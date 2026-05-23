import "server-only";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import * as res from "@/lib/api-response";
import { getUserId } from "@/lib/get-user";
import Job, { IJob } from "@/models/job.model";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiStats {
  totalApplied: number;
  inProgress: number;
  interviews: number;
  rejected: number;
  avgAiMatchScore: number | null;
}

interface AiInsight {
  type: "role" | "resume" | "company";
  message: string;
}

interface RecentJob {
  _id: string;
  company: string;
  role: string;
  status: IJob["status"];
  appliedDate?: Date;
  aiMatchScore?: number;
}

interface DashboardData {
  kpi: KpiStats;
  aiInsights: AiInsight[];
  recentJobs: RecentJob[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives AI insights from the user's job data.
 * This is rule-based for now — can be swapped for a real LLM call later.
 */
function deriveAiInsights(jobs: IJob[]): AiInsight[] {
  const insights: AiInsight[] = [];

  // ── Insight 1: Most successful role category ──────────────────────────────
  const interviewJobs = jobs.filter((j) => j.status === "interview");
  if (interviewJobs.length > 0) {
    // Find the most common role keyword among interview-stage jobs
    const roleWords = interviewJobs.flatMap((j) =>
      j.role.toLowerCase().split(/\s+/)
    );
    const stopWords = new Set(["developer", "engineer", "manager", "lead", "senior", "junior"]);
    const freq: Record<string, number> = {};
    for (const word of roleWords) {
      if (word.length > 3 && !stopWords.has(word)) {
        freq[word] = (freq[word] ?? 0) + 1;
      }
    }
    const topRole = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (topRole) {
      insights.push({
        type: "role",
        message: `You're getting more interview calls from ${topRole[0].charAt(0).toUpperCase() + topRole[0].slice(1)} roles.`,
      });
    }
  }

  // ── Insight 2: Resume gap (jobs with low AI match score) ─────────────────
  const scoredJobs = jobs.filter((j) => j.aiMatchScore != null);
  if (scoredJobs.length > 0) {
    const avgScore =
      scoredJobs.reduce((sum, j) => sum + (j.aiMatchScore ?? 0), 0) /
      scoredJobs.length;

    if (avgScore < 60) {
      insights.push({
        type: "resume",
        message:
          "Your average AI match score is below 60%. Consider adding more relevant keywords to your resume.",
      });
    } else if (avgScore >= 75) {
      insights.push({
        type: "resume",
        message: `Strong resume match! Your average AI score is ${Math.round(avgScore)}%. Keep targeting similar roles.`,
      });
    }
  } else {
    // No scored jobs yet — nudge user to add AI scores
    insights.push({
      type: "resume",
      message:
        "Add AI match scores to your jobs to get resume gap insights.",
    });
  }

  // ── Insight 3: Top companies (most applied to) ────────────────────────────
  const companyFreq: Record<string, number> = {};
  for (const job of jobs) {
    companyFreq[job.company] = (companyFreq[job.company] ?? 0) + 1;
  }
  const topCompanies = Object.entries(companyFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  if (topCompanies.length > 0) {
    insights.push({
      type: "company",
      message: `Top companies you've targeted: ${topCompanies.join(", ")}.`,
    });
  }

  return insights;
}

// ─── Controller ───────────────────────────────────────────────────────────────

export async function getDashboardController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    // Fetch all active (non-deleted) jobs for this user
    const jobs = await Job.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean<IJob[]>();

    // ── KPI Stats ─────────────────────────────────────────────────────────────
    const totalApplied = jobs.filter((j) =>
      ["applied", "interview", "rejected", "offer"].includes(j.status)
    ).length;

    const inProgress = jobs.filter((j) =>
      ["saved", "applied"].includes(j.status)
    ).length;

    const interviews = jobs.filter((j) => j.status === "interview").length;
    const rejected = jobs.filter((j) => j.status === "rejected").length;

    const scoredJobs = jobs.filter((j) => j.aiMatchScore != null);
    const avgAiMatchScore =
      scoredJobs.length > 0
        ? Math.round(
            scoredJobs.reduce((sum, j) => sum + (j.aiMatchScore ?? 0), 0) /
              scoredJobs.length
          )
        : null;

    const kpi: KpiStats = {
      totalApplied,
      inProgress,
      interviews,
      rejected,
      avgAiMatchScore,
    };

    // ── AI Insights ───────────────────────────────────────────────────────────
    const aiInsights = deriveAiInsights(jobs);

    // ── Recent Jobs (latest 5) ────────────────────────────────────────────────
    const recentJobs: RecentJob[] = jobs.slice(0, 5).map((j) => ({
      _id: (j._id as { toString(): string }).toString(),
      company: j.company,
      role: j.role,
      status: j.status,
      appliedDate: j.appliedDate,
      aiMatchScore: j.aiMatchScore,
    }));

    const data: DashboardData = { kpi, aiInsights, recentJobs };

    return res.success(data, "Dashboard data fetched successfully");
  } catch (err) {
    console.error("[getDashboard]", err);
    return res.error("Internal server error", 500);
  }
}

"use client";

import { useEffect, useState } from "react";
import KpiCard from "@/components/dashboard/KpiCard";
import AiInsightsPanel from "@/components/dashboard/AiInsightsPanel";
import RecentJobsTable from "@/components/dashboard/RecentJobsTable";

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
  status: "saved" | "applied" | "interview" | "rejected" | "offer";
  appliedDate?: string;
  aiMatchScore?: number;
}

interface DashboardData {
  kpi: KpiStats;
  aiInsights: AiInsight[];
  recentJobs: RecentJob[];
}

// ─── KPI card definitions ─────────────────────────────────────────────────────

function buildKpiCards(kpi: KpiStats) {
  return [
    {
      label: "Total Jobs Applied",
      value: kpi.totalApplied,
      icon: "🧾",
      iconBg: "bg-zinc-100",
      iconColor: "text-zinc-600",
    },
    {
      label: "In Progress",
      value: kpi.inProgress,
      icon: "🟡",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      label: "Interviews",
      value: kpi.interviews,
      icon: "🟢",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Rejected",
      value: kpi.rejected,
      icon: "🔴",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      label: "AI Match Score",
      value: kpi.avgAiMatchScore != null ? `${kpi.avgAiMatchScore}%` : "—",
      icon: "🤖",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="h-20 rounded-xl border border-zinc-200 bg-white shadow-sm animate-pulse" />
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white shadow-sm animate-pulse ${className}`}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        const json = await response.json();

        if (!response.ok || !json.success) {
          setError(json.message ?? "Failed to load dashboard.");
          return;
        }

        setData(json.data as DashboardData);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="h-8 w-40 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonBlock className="h-44" />
        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm text-zinc-500">{error ?? "No data available."}</p>
        </div>
      </div>
    );
  }

  const kpiCards = buildKpiCards(data.kpi);

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Here&apos;s a snapshot of your job search activity.
        </p>
      </div>

      {/* ── Row 1: KPI Cards ──────────────────────────────────────────────── */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpiCards.map((card) => (
            <KpiCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* ── Row 2: AI Insights ───────────────────────────────────────────── */}
      <section aria-label="AI insights">
        <AiInsightsPanel insights={data.aiInsights} />
      </section>

      {/* ── Row 3: Recent Jobs ───────────────────────────────────────────── */}
      <section aria-label="Recent jobs">
        <RecentJobsTable jobs={data.recentJobs} />
      </section>
    </div>
  );
}

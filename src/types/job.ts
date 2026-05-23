// ─── Shared Job types used across the frontend ────────────────────────────────

export type JobStatus = "saved" | "applied" | "interview" | "rejected" | "offer";
export type JobType = "remote" | "onsite" | "hybrid";
export type InterviewRound = "hr" | "technical" | "final" | "manager";
export type InterviewResult = "pending" | "passed" | "failed";

export interface JobInterview {
  _id?: string;
  round?: InterviewRound;
  date?: string;
  result?: InterviewResult;
  feedback?: string;
}

export interface Job {
  _id: string;
  company: string;
  role: string;
  status: JobStatus;
  jobType?: JobType;
  location?: string;
  salary?: string;
  jobUrl?: string;
  description?: string;
  notes?: string;
  aiMatchScore?: number;
  aiSummary?: string;
  aiMatchResult?: {
    score: number;
    summary: string;
    matchedSkills: string[];
    missingSkills: string[];
    recommendation: string;
    interviewReadiness: "Low" | "Medium" | "High";
    isFallback?: boolean;
    isOverride?: boolean;
    evaluatedAt?: string;
  };
  interviews: JobInterview[];
  appliedDate?: string;
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Status display config ────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; badgeClass: string; dot: string }
> = {
  saved: {
    label: "Saved",
    badgeClass: "bg-zinc-100 text-zinc-600",
    dot: "bg-zinc-400",
  },
  applied: {
    label: "Applied",
    badgeClass: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  interview: {
    label: "Interview",
    badgeClass: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  offer: {
    label: "Offer 🎉",
    badgeClass: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

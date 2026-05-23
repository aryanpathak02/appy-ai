"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Job, JobStatus, JobInterview, STATUS_CONFIG } from "@/types/job";
import { showToast } from "@/lib/toast";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cfg.badgeClass}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Meta pill ────────────────────────────────────────────────────────────────

function MetaPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-800">
        <span>{icon}</span>
        {value}
      </span>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

const TIMELINE_STEPS: { status: JobStatus; label: string; icon: string }[] = [
  { status: "saved",     label: "Saved",            icon: "🔖" },
  { status: "applied",   label: "Applied",           icon: "📤" },
  { status: "interview", label: "Interview",         icon: "🗣️" },
  { status: "offer",     label: "Offer Received",    icon: "🎉" },
];

const REJECTED_STEP = { status: "rejected" as JobStatus, label: "Rejected", icon: "❌" };

function ApplicationTimeline({ job }: { job: Job }) {
  const isRejected = job.status === "rejected";

  // Build the steps to show — if rejected, replace offer with rejected
  const steps = isRejected
    ? [...TIMELINE_STEPS.slice(0, 3), REJECTED_STEP]
    : TIMELINE_STEPS;

  // Determine which step index is "current"
  const statusOrder: JobStatus[] = ["saved", "applied", "interview", "offer"];
  const currentIndex = isRejected
    ? 2 // interview is the last "real" step before rejection
    : statusOrder.indexOf(job.status);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900 mb-6">Application Timeline</h2>

      {/* Steps */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-zinc-200" />

        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isDone = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const isRejectedStep = step.status === "rejected";

            return (
              <div key={step.status} className="relative flex items-start gap-4">
                {/* Circle */}
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-base transition-all ${
                  isRejectedStep && isCurrent
                    ? "border-red-400 bg-red-50"
                    : isDone
                    ? "border-zinc-900 bg-zinc-900"
                    : "border-zinc-300 bg-white"
                }`}>
                  {isDone ? (
                    isRejectedStep ? (
                      <span className="text-sm">❌</span>
                    ) : (
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${
                      isRejectedStep && isCurrent ? "text-red-600" : isDone ? "text-zinc-900" : "text-zinc-400"
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && !isRejectedStep && (
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Show date if available */}
                  {step.status === "applied" && job.appliedDate && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(job.appliedDate).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                  {step.status === "interview" && job.interviewDate && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(job.interviewDate).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                  {step.status === "saved" && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Added {new Date(job.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interview rounds (from interviews subdocument) */}
      {job.interviews && job.interviews.length > 0 && (
        <div className="mt-6 pt-6 border-t border-zinc-100">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Interview Rounds
          </h3>
          <div className="space-y-3">
            {job.interviews.map((interview: JobInterview, idx: number) => (
              <InterviewRoundCard key={interview._id ?? idx} interview={interview} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Interview round card ─────────────────────────────────────────────────────

const ROUND_CONFIG: Record<string, { label: string; icon: string }> = {
  hr:        { label: "HR Round",        icon: "🤝" },
  technical: { label: "Technical Round", icon: "💻" },
  final:     { label: "Final Round",     icon: "🏁" },
  manager:   { label: "Manager Round",   icon: "👔" },
};

const RESULT_CONFIG: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending",  classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  passed:  { label: "Passed ✓", classes: "bg-green-50 text-green-700 border-green-200" },
  failed:  { label: "Failed",   classes: "bg-red-50 text-red-700 border-red-200" },
};

function InterviewRoundCard({ interview, index }: { interview: JobInterview; index: number }) {
  const roundCfg = interview.round ? ROUND_CONFIG[interview.round] : null;
  const resultCfg = interview.result ? RESULT_CONFIG[interview.result] : null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-base">{roundCfg?.icon ?? "📋"}</span>
          <span className="text-sm font-medium text-zinc-800">
            {roundCfg?.label ?? `Round ${index + 1}`}
          </span>
          {interview.date && (
            <span className="text-xs text-zinc-400">
              · {new Date(interview.date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          )}
        </div>
        {resultCfg && (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${resultCfg.classes}`}>
            {resultCfg.label}
          </span>
        )}
      </div>
      {interview.feedback && (
        <p className="mt-2 text-xs text-zinc-600 leading-relaxed">{interview.feedback}</p>
      )}
    </div>
  );
}

// ─── AI Match section ─────────────────────────────────────────────────────────

function AiMatchSection({ job }: { job: Job }) {
  const result = job.aiMatchResult;
  const hasResult = result != null && typeof result.score === "number";

  if (!hasResult) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center">
        <span className="text-3xl">🤖</span>
        <p className="text-sm font-medium text-zinc-700 mt-2">No AI match yet</p>
        <p className="text-xs text-zinc-400 mt-1">
          Go to Applied Jobs and click "AI Match" on this job card.
        </p>
      </div>
    );
  }

  const scoreColor = result!.score >= 70 ? "text-green-600" : result!.score >= 50 ? "text-yellow-600" : "text-red-600";
  const barColor = result!.score >= 70 ? "bg-green-500" : result!.score >= 50 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">🤖 AI Match Report</h2>
        <div className="flex items-center gap-2">
          {result!.isFallback && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              ⚠️ Estimate
            </span>
          )}
          <span className={`text-2xl font-bold ${scoreColor}`}>{result!.score}%</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${result!.score}%` }} />
      </div>

      {/* Summary */}
      <p className="text-sm text-zinc-700 leading-relaxed">{result!.summary}</p>

      {/* Skills grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result!.matchedSkills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
              ✅ Matched Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result!.matchedSkills.map((s) => (
                <span key={s} className="rounded-full bg-green-50 text-green-700 px-2.5 py-0.5 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {result!.missingSkills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
              ❌ Missing Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result!.missingSkills.map((s) => (
                <span key={s} className="rounded-full bg-red-50 text-red-600 px-2.5 py-0.5 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
        <p className="text-xs font-semibold text-blue-600 mb-1">💡 Recommendation</p>
        <p className="text-sm text-blue-800 leading-relaxed">{result!.recommendation}</p>
      </div>

      {result!.evaluatedAt && (
        <p className="text-xs text-zinc-400">
          Evaluated {new Date(result!.evaluatedAt).toLocaleString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message ?? "Job not found.");
          return;
        }

        setJob(data.data as Job);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this job?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast.error(data.message ?? "Failed to delete job.");
        return;
      }
      showToast.success("Job deleted.");
      router.push("/dashboard/jobs");
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-4xl">
        <div className="h-8 w-48 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 rounded-xl bg-zinc-100 animate-pulse" />
            <div className="h-32 rounded-xl bg-zinc-100 animate-pulse" />
          </div>
          <div className="h-80 rounded-xl bg-zinc-100 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !job) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center gap-4 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm text-zinc-500">{error ?? "Job not found."}</p>
        <Link href="/dashboard/jobs" className="text-sm font-medium text-zinc-900 underline underline-offset-2">
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/dashboard/jobs" className="hover:text-zinc-700 transition-colors">
          Applied Jobs
        </Link>
        <span>›</span>
        <span className="text-zinc-700 font-medium truncate">{job.company} — {job.role}</span>
      </nav>

      {/* Page header */}
      <div className="space-y-3">
        {/* Back + status row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/dashboard/jobs"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} />
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? "Deleting..." : "🗑️ Delete"}
            </button>
          </div>
        </div>

        {/* Company avatar + title */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white text-lg font-bold uppercase">
            {job.company.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-zinc-900 truncate">{job.role}</h1>
            <p className="text-sm text-zinc-500 truncate">{job.company}</p>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column (2/3) ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Meta info card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Job Details</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {job.location && <MetaPill icon="📍" label="Location" value={job.location} />}
              {job.salary && <MetaPill icon="💰" label="Salary" value={job.salary} />}
              {job.jobType && (
                <MetaPill
                  icon="🏢"
                  label="Type"
                  value={job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                />
              )}
              {job.appliedDate && (
                <MetaPill
                  icon="📅"
                  label="Applied"
                  value={new Date(job.appliedDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                />
              )}
              {job.interviewDate && (
                <MetaPill
                  icon="🗓️"
                  label="Interview"
                  value={new Date(job.interviewDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                />
              )}
              <MetaPill
                icon="🕐"
                label="Added"
                value={new Date(job.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              />
            </div>

            {job.jobUrl && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                >
                  View Job Posting ↗
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900 mb-3">Job Description</h2>
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900 mb-3">My Notes</h2>
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {job.notes}
              </p>
            </div>
          )}

          {/* AI Match */}
          <AiMatchSection job={job} />
        </div>

        {/* ── Right column (1/3) ─────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Timeline */}
          <ApplicationTimeline job={job} />

          {/* Quick actions */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
              Quick Actions
            </h2>
            <Link
              href="/dashboard/interview-prep"
              className="flex items-center gap-2 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <span>🎯</span> Practice Interview Questions
            </Link>
            <Link
              href="/dashboard/resume"
              className="flex items-center gap-2 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <span>📄</span> View My Resume
            </Link>
            <Link
              href="/dashboard/jobs"
              className="flex items-center gap-2 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <span>💼</span> All Applied Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

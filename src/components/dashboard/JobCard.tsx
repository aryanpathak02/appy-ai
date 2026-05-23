"use client";

import { useState } from "react";
import Link from "next/link";
import { Job, STATUS_CONFIG } from "@/types/job";
import { AiMatchResult } from "@/types/ai-match";
import { showToast } from "@/lib/toast";
import AiMatchModal from "@/components/dashboard/AiMatchModal";
import NoJdModal from "@/components/dashboard/NoJdModal";

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onAiMatchComplete: (jobId: string, result: AiMatchResult & { evaluatedAt: string }) => void;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Job["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function MetaPill({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
      <span>{icon}</span>
      {text}
    </span>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

export default function JobCard({ job, onEdit, onDelete, onAiMatchComplete }: JobCardProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showNoJdModal, setShowNoJdModal] = useState(false);

  const appliedOn = job.appliedDate
    ? new Date(job.appliedDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  // A result is only "real" if it has a score — guards against Mongoose returning {}
  const hasRealResult = job.aiMatchResult != null && typeof job.aiMatchResult.score === "number";
  const displayScore = hasRealResult ? job.aiMatchResult!.score : (job.aiMatchScore ?? null);
  const hasValidDescription = (job.description?.trim().length ?? 0) >= 100;

  // ── Core fetch helper ──────────────────────────────────────────────────────

  async function runMatch(body: Record<string, unknown> = {}) {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/ai-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast.error(data.message ?? "AI match failed.");
        return;
      }

      onAiMatchComplete(job._id, data.data.result);
      setShowNoJdModal(false);
      setShowResult(true);
      showToast.success("AI match complete!");
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Button click ───────────────────────────────────────────────────────────

  function handleAiMatchClick() {
    if (hasValidDescription) {
      // Normal flow — job already has a good description
      runMatch();
    } else {
      // No valid JD — open the modal to let user paste one or use fallback
      setShowNoJdModal(true);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">

        {/* ── Top row ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-700 uppercase">
              {job.company.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{job.company}</p>
              <p className="text-xs text-zinc-500 truncate">{job.role}</p>
            </div>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* ── Meta row ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {job.location && <MetaPill icon="📍" text={job.location} />}
          {job.salary && <MetaPill icon="💰" text={job.salary} />}
          {job.jobType && (
            <MetaPill icon="🏢" text={job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)} />
          )}
          {appliedOn && <MetaPill icon="📅" text={appliedOn} />}
        </div>

        {/* ── AI match score bar ────────────────────────────────────────────── */}
        {displayScore != null && (
          <button
            onClick={() => hasRealResult && setShowResult(true)}
            className="group w-full text-left"
            title={hasRealResult ? "Click to view full report" : undefined}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">
                AI Match
                {job.aiMatchResult?.isFallback && (
                  <span className="ml-1 text-amber-500" title="Estimate — based on role + company only">~</span>
                )}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    displayScore >= 70 ? "bg-green-500" : displayScore >= 50 ? "bg-yellow-400" : "bg-red-400"
                  }`}
                  style={{ width: `${displayScore}%` }}
                />
              </div>
              <span className="text-xs font-medium text-zinc-700">{displayScore}%</span>
              {hasRealResult && (
                <span className="text-xs text-blue-500 group-hover:underline">View →</span>
              )}
            </div>
          </button>
        )}

        {/* ── Short description hint (not blocking) ────────────────────────── */}
        {!hasValidDescription && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5">
            ⚠️ {!job.description?.trim()
              ? "No job description — click AI Match to add one or use fallback."
              : `Description too short (${job.description.trim().length}/100 chars) — click AI Match to paste a full JD.`
            }
          </p>
        )}

        {/* ── Job URL ──────────────────────────────────────────────────────── */}
        {job.jobUrl && (
          <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline truncate">
            View Job Posting ↗
          </a>
        )}

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 pt-1 border-t border-zinc-100 mt-auto">
          {/* AI Match — full width on its own row so text never wraps */}
          <button
            onClick={handleAiMatchClick}
            disabled={analyzing}
            className="w-full rounded-lg border border-blue-200 bg-blue-50 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {analyzing ? "⏳ Analyzing..." : hasRealResult ? "🤖 Re-analyze" : "🤖 AI Match"}
          </button>

          {/* Details / Edit / Delete — three equal columns */}
          <div className="grid grid-cols-3 gap-2">
            <Link
              href={`/dashboard/jobs/${job._id}`}
              className="rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors text-center whitespace-nowrap"
            >
              👁️ Details
            </Link>

            <button
              onClick={() => onEdit(job)}
              className="rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors whitespace-nowrap"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => onDelete(job)}
              className="rounded-lg border border-red-100 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors whitespace-nowrap"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* ── No JD modal ───────────────────────────────────────────────────── */}
      {showNoJdModal && (
        <NoJdModal
          jobTitle={job.role}
          company={job.company}
          isAnalyzing={analyzing}
          onSubmitDescription={(desc) => runMatch({ descriptionOverride: desc })}
          onFallback={() => runMatch({ useFallback: true })}
          onClose={() => setShowNoJdModal(false)}
        />
      )}

      {/* ── AI Match Result modal ─────────────────────────────────────────── */}
      {showResult && hasRealResult && (
        <AiMatchModal
          jobTitle={job.role}
          company={job.company}
          result={job.aiMatchResult!}
          onClose={() => setShowResult(false)}
        />
      )}
    </>
  );
}

"use client";

import { useEffect } from "react";
import { AiMatchResult } from "@/types/ai-match";

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-500" : "text-red-500";
  const ringColor =
    score >= 70 ? "stroke-green-500" : score >= 50 ? "stroke-yellow-400" : "stroke-red-400";

  // SVG circle math
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
          {/* Track */}
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#e4e4e7" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            className={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-zinc-400">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-zinc-500">Match Score</span>
    </div>
  );
}

// ─── Readiness badge ──────────────────────────────────────────────────────────

function ReadinessBadge({ level }: { level: AiMatchResult["interviewReadiness"] }) {
  const config = {
    High:   { classes: "bg-green-50 text-green-700 border-green-200",  icon: "🟢" },
    Medium: { classes: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: "🟡" },
    Low:    { classes: "bg-red-50 text-red-700 border-red-200",         icon: "🔴" },
  }[level];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.classes}`}>
      {config.icon} {level} Interview Readiness
    </span>
  );
}

// ─── Skill pill ───────────────────────────────────────────────────────────────

function SkillPill({ label, variant }: { label: string; variant: "matched" | "missing" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        variant === "matched"
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      {variant === "matched" ? "✓ " : "✗ "}{label}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface AiMatchModalProps {
  jobTitle: string;
  company: string;
  result: AiMatchResult & { evaluatedAt?: string };
  onClose: () => void;
}

export default function AiMatchModal({
  jobTitle,
  company,
  result,
  onClose,
}: AiMatchModalProps) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const evaluatedAt = result.evaluatedAt
    ? new Date(result.evaluatedAt).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">🤖 AI Match Report</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{company} — {jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-5">

          {/* Score + readiness */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <ScoreRing score={result.score} />
            <div className="flex flex-col gap-2 items-end">
              <ReadinessBadge level={result.interviewReadiness} />
              {result.isFallback && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  ⚠️ Estimate — based on role + company only
                </span>
              )}
              {result.isOverride && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  📋 Based on pasted JD
                </span>
              )}
              {evaluatedAt && (
                <span className="text-xs text-zinc-400">Evaluated {evaluatedAt}</span>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Summary</p>
            <p className="text-sm text-zinc-700 leading-relaxed">{result.summary}</p>
          </div>

          {/* Matched skills */}
          {result.matchedSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                ✅ Matched Skills ({result.matchedSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedSkills.map((s) => (
                  <SkillPill key={s} label={s} variant="matched" />
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {result.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                ❌ Missing Skills ({result.missingSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map((s) => (
                  <SkillPill key={s} label={s} variant="missing" />
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
              💡 Recommendation
            </p>
            <p className="text-sm text-blue-800 leading-relaxed">{result.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

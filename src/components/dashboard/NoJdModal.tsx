"use client";

import { useEffect, useState } from "react";

interface NoJdModalProps {
  jobTitle: string;
  company: string;
  /** Called when user submits a pasted JD */
  onSubmitDescription: (description: string) => void;
  /** Called when user chooses "Continue with Role + Company only" */
  onFallback: () => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

export default function NoJdModal({
  jobTitle,
  company,
  onSubmitDescription,
  onFallback,
  onClose,
  isAnalyzing,
}: NoJdModalProps) {
  const [description, setDescription] = useState("");
  const MIN_LENGTH = 100;
  const charCount = description.trim().length;
  const isReady = charCount >= MIN_LENGTH;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !isAnalyzing) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, isAnalyzing]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isAnalyzing) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              No Job Description Found
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {company} — {jobTitle}
            </p>
          </div>
          {!isAnalyzing && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Info banner */}
          <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <span className="text-lg shrink-0">⚠️</span>
            <p className="text-sm text-amber-800">
              AI matching works best with a real job description. Paste the JD below for the most accurate results.
            </p>
          </div>

          {/* Option 1 — Paste JD */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Option 1 — Paste Job Description{" "}
              <span className="text-xs font-normal text-zinc-400">(recommended)</span>
            </label>
            <textarea
              rows={7}
              placeholder="Paste the full job description here — include responsibilities, required skills, and experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isAnalyzing}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition resize-none disabled:opacity-50"
            />
            {/* Character counter */}
            <div className="flex items-center justify-between">
              <p className={`text-xs ${isReady ? "text-green-600" : "text-zinc-400"}`}>
                {isReady
                  ? "✓ Looks good — ready to analyze"
                  : `${charCount} / ${MIN_LENGTH} characters minimum`}
              </p>
            </div>
            <button
              onClick={() => onSubmitDescription(description.trim())}
              disabled={!isReady || isAnalyzing}
              className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isAnalyzing ? "⏳ Analyzing..." : "🤖 Analyze with this JD"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-xs text-zinc-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          {/* Option 2 — Fallback */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700">
              Option 2 — Continue with Role + Company only
            </p>
            <p className="text-xs text-zinc-500">
              We&apos;ll generate a typical job description for{" "}
              <span className="font-medium text-zinc-700">{jobTitle}</span> at{" "}
              <span className="font-medium text-zinc-700">{company}</span> and use it for matching.
              Results will be an estimate — less accurate than a real JD.
            </p>
            <button
              onClick={onFallback}
              disabled={isAnalyzing}
              className="w-full rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isAnalyzing ? "⏳ Generating context..." : "Continue with Role + Company →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

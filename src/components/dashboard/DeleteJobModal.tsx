"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";
import { Job } from "@/types/job";

interface DeleteJobModalProps {
  job: Job;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteJobModal({ job, onClose, onDeleted }: DeleteJobModalProps) {
  const [deleting, setDeleting] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast.error(data.message ?? "Failed to delete job.");
        return;
      }

      showToast.success("Job deleted.");
      onDeleted(job._id);
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
          <span className="text-xl">🗑️</span>
        </div>

        <h2 className="text-base font-semibold text-zinc-900 mb-1">Delete this job?</h2>
        <p className="text-sm text-zinc-500 mb-6">
          <span className="font-medium text-zinc-700">{job.company} — {job.role}</span> will be
          permanently removed from your tracker.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

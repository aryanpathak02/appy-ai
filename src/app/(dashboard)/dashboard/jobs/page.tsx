"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/dashboard/JobCard";
import EditJobModal from "@/components/dashboard/EditJobModal";
import DeleteJobModal from "@/components/dashboard/DeleteJobModal";
import { Job } from "@/types/job";
import { AiMatchResult } from "@/types/ai-match";

// ─── Filter bar ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "rejected", label: "Rejected" },
  { value: "offer", label: "Offer" },
];

const JOB_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
];

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonJobCard() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-zinc-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-32 rounded bg-zinc-200" />
          <div className="h-3 w-24 rounded bg-zinc-100" />
        </div>
        <div className="h-5 w-16 rounded-full bg-zinc-200" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-20 rounded bg-zinc-100" />
        <div className="h-3 w-16 rounded bg-zinc-100" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-100" />
      <div className="flex gap-2 pt-1">
        <div className="h-7 flex-1 rounded-lg bg-zinc-100" />
        <div className="h-7 flex-1 rounded-lg bg-zinc-100" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

  // ── Fetch jobs ─────────────────────────────────────────────────────────────

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (jobTypeFilter) params.set("jobType", jobTypeFilter);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to load jobs.");
        return;
      }

      setJobs(data.data.jobs as Job[]);
      setTotalPages(data.data.pagination.totalPages);
      setTotal(data.data.pagination.total);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, jobTypeFilter]);

  // Re-fetch whenever filters or page change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, [fetchJobs]);

  // Reset to page 1 when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, statusFilter, jobTypeFilter]);

  // ── Modal callbacks ────────────────────────────────────────────────────────

  function handleJobSaved(updated: Job) {
    setJobs((prev) => prev.map((j) => (j._id === updated._id ? updated : j)));
    setEditingJob(null);
  }

  function handleJobDeleted(id: string) {
    setJobs((prev) => prev.filter((j) => j._id !== id));
    setTotal((prev) => prev - 1);
    setDeletingJob(null);
  }

  function handleAiMatchComplete(
    jobId: string,
    result: AiMatchResult & { evaluatedAt: string }
  ) {
    setJobs((prev) =>
      prev.map((j) =>
        j._id === jobId
          ? { ...j, aiMatchScore: result.score, aiMatchResult: result }
          : j
      )
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="p-6 md:p-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Applied Jobs</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {total > 0 ? `${total} job${total !== 1 ? "s" : ""} in your tracker` : "No jobs yet"}
            </p>
          </div>
          <Link
            href="/dashboard/add-job"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + Add Job
          </Link>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* Search — full width on mobile */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search company, role, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
            />
          </div>

          {/* Selects — side by side on mobile, inline on larger screens */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 appearance-none rounded-lg border border-zinc-300 pl-3 pr-9 py-2 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center]"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="flex-1 appearance-none rounded-lg border border-zinc-300 pl-3 pr-9 py-2 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center]"
            >
              {JOB_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Error state ─────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ── Loading skeletons ────────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonJobCard key={i} />
            ))}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {!loading && !error && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm font-medium text-zinc-700">No jobs found</p>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              {search || statusFilter || jobTypeFilter
                ? "Try adjusting your filters."
                : "Start tracking your applications."}
            </p>
            {!search && !statusFilter && !jobTypeFilter && (
              <Link
                href="/dashboard/add-job"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
              >
                + Add your first job
              </Link>
            )}
          </div>
        )}

        {/* ── Cards grid ───────────────────────────────────────────────────── */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onEdit={setEditingJob}
                onDelete={setDeletingJob}
                onAiMatchComplete={handleAiMatchComplete}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            <span className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Modals (rendered outside the scroll container) ─────────────────── */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSaved={handleJobSaved}
        />
      )}

      {deletingJob && (
        <DeleteJobModal
          job={deletingJob}
          onClose={() => setDeletingJob(null)}
          onDeleted={handleJobDeleted}
        />
      )}
    </>
  );
}

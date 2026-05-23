import Link from "next/link";
import { JobStatus, STATUS_CONFIG } from "@/types/job";

interface RecentJob {
  _id: string;
  company: string;
  role: string;
  status: JobStatus;
  appliedDate?: string;
  aiMatchScore?: number;
}

interface RecentJobsTableProps {
  jobs: RecentJob[];
}

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/**
 * Shows the 5 most recent jobs with company, role, status badge,
 * and a "View All Jobs" CTA at the bottom.
 */
export default function RecentJobsTable({ jobs }: RecentJobsTableProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h2 className="text-base font-semibold text-zinc-900">Recent Jobs</h2>
        </div>
        <Link
          href="/dashboard/jobs"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          View All Jobs →
        </Link>
      </div>

      {/* Job rows */}
      {jobs.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-zinc-400">No jobs yet.</p>
          <Link
            href="/dashboard/add-job"
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2"
          >
            Add your first job →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {jobs.map((job) => (
            <li key={job._id}>
              <Link
                href={`/dashboard/jobs/${job._id}`}
                className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-zinc-50 transition-colors"
              >
                {/* Company + Role */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {job.company}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{job.role}</p>
                </div>

                {/* Right side: AI score + status */}
                <div className="flex items-center gap-3 shrink-0">
                  {job.aiMatchScore != null && (
                    <span className="hidden sm:inline-block text-xs font-medium text-zinc-400">
                      🤖 {job.aiMatchScore}%
                    </span>
                  )}
                  <StatusBadge status={job.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Footer CTA */}
      {jobs.length > 0 && (
        <div className="px-6 py-3 border-t border-zinc-100">
          <Link
            href="/dashboard/jobs"
            className="block w-full rounded-lg border border-zinc-200 py-2 text-center text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
          >
            View All Jobs →
          </Link>
        </div>
      )}
    </div>
  );
}

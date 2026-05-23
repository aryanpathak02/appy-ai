// loading.tsx — shown during initial navigation to /dashboard/jobs
// Matches the exact layout of jobs/page.tsx

export default function JobsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-7 w-32 rounded-lg bg-zinc-200 animate-pulse" />
          <div className="h-4 w-40 rounded bg-zinc-100 animate-pulse" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-zinc-200 animate-pulse" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-9 flex-1 rounded-lg bg-zinc-100 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-9 w-32 rounded-lg bg-zinc-100 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-zinc-100 animate-pulse" />
        </div>
      </div>

      {/* Job cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3 animate-pulse"
          >
            {/* Top row — avatar + title + badge */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-zinc-200" />
                <div className="h-3 w-20 rounded bg-zinc-100" />
              </div>
              <div className="h-5 w-16 rounded-full bg-zinc-200" />
            </div>
            {/* Meta pills */}
            <div className="flex gap-3">
              <div className="h-3 w-20 rounded bg-zinc-100" />
              <div className="h-3 w-16 rounded bg-zinc-100" />
            </div>
            {/* Score bar */}
            <div className="h-1.5 w-full rounded-full bg-zinc-100" />
            {/* Action buttons */}
            <div className="pt-1 space-y-2 border-t border-zinc-100">
              <div className="h-8 w-full rounded-lg bg-zinc-100" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-7 rounded-lg bg-zinc-100" />
                <div className="h-7 rounded-lg bg-zinc-100" />
                <div className="h-7 rounded-lg bg-zinc-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

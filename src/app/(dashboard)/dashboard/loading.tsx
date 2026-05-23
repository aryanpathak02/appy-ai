// loading.tsx — shown during initial navigation to /dashboard
// Matches the exact layout of dashboard/page.tsx

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Page title */}
      <div className="space-y-1.5">
        <div className="h-7 w-36 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="h-4 w-64 rounded bg-zinc-100 animate-pulse" />
      </div>

      {/* KPI cards — 2 col mobile → 3 col sm → 5 col lg */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-zinc-200 bg-white shadow-sm animate-pulse"
          />
        ))}
      </div>

      {/* AI Insights panel */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6 space-y-4 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-200" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-zinc-200" />
            <div className="h-3 w-48 rounded bg-zinc-100" />
          </div>
        </div>
        {/* Insight cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-zinc-100" />
          ))}
        </div>
      </div>

      {/* Recent jobs table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden animate-pulse">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="h-4 w-28 rounded bg-zinc-200" />
          <div className="h-4 w-20 rounded bg-zinc-100" />
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-50"
          >
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-zinc-200" />
              <div className="h-3 w-24 rounded bg-zinc-100" />
            </div>
            <div className="h-5 w-16 rounded-full bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

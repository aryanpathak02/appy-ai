// loading.tsx — shown during initial navigation to /dashboard/interview-prep
// Matches the exact layout of interview-prep/page.tsx

export default function InterviewPrepLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="space-y-1.5">
        <div className="h-7 w-36 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="h-4 w-80 rounded bg-zinc-100 animate-pulse" />
      </div>

      {/* Generator form card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5 animate-pulse">
        {/* Card title */}
        <div className="h-4 w-40 rounded bg-zinc-200" />

        {/* Role + Company row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="h-3.5 w-10 rounded bg-zinc-200" />
            <div className="h-10 w-full rounded-lg bg-zinc-100" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-16 rounded bg-zinc-200" />
            <div className="h-10 w-full rounded-lg bg-zinc-100" />
          </div>
        </div>

        {/* Question type selector — 3 cards */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 rounded bg-zinc-200" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-zinc-100" />
            ))}
          </div>
        </div>

        {/* Count slider */}
        <div className="space-y-2">
          <div className="h-3.5 w-48 rounded bg-zinc-200" />
          <div className="h-2 w-full rounded-full bg-zinc-100" />
          <div className="flex justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 w-4 rounded bg-zinc-100" />
            ))}
          </div>
        </div>

        {/* Job description textarea */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-36 rounded bg-zinc-200" />
          <div className="h-24 w-full rounded-lg bg-zinc-100" />
        </div>

        {/* Submit button */}
        <div className="h-11 w-full rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}

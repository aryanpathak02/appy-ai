// loading.tsx — shown during initial navigation to /dashboard/resume
// Matches the exact layout of resume/page.tsx

export default function ResumeLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      {/* Page header */}
      <div className="space-y-1.5">
        <div className="h-7 w-28 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="h-4 w-80 rounded bg-zinc-100 animate-pulse" />
      </div>

      {/* Upload card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4 animate-pulse">
        {/* Card header */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-zinc-200" />
          <div className="h-4 w-32 rounded bg-zinc-200" />
        </div>

        {/* Drag & drop zone */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 px-6 py-10">
          <div className="h-10 w-10 rounded-full bg-zinc-200" />
          <div className="space-y-2 text-center">
            <div className="h-4 w-56 rounded bg-zinc-200 mx-auto" />
            <div className="h-3 w-32 rounded bg-zinc-100 mx-auto" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-lg bg-zinc-200" />
          <div className="h-10 w-24 rounded-lg bg-zinc-100" />
          <div className="h-10 w-20 rounded-lg bg-zinc-100" />
        </div>
      </div>

      {/* PDF preview placeholder */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden animate-pulse">
        {/* Preview header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-zinc-200" />
            <div className="h-4 w-28 rounded bg-zinc-200" />
          </div>
          <div className="h-3 w-24 rounded bg-zinc-100" />
        </div>
        {/* Preview body */}
        <div className="bg-zinc-50" style={{ height: "420px" }}>
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="h-12 w-12 rounded-xl bg-zinc-200" />
            <div className="h-4 w-40 rounded bg-zinc-200" />
            <div className="h-3 w-56 rounded bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

// loading.tsx — shown during initial navigation to /dashboard/add-job
// Matches the exact layout of add-job/page.tsx

function SkeletonField({ wide }: { wide?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-3.5 rounded bg-zinc-200 animate-pulse ${wide ? "w-24" : "w-16"}`} />
      <div className="h-10 w-full rounded-lg bg-zinc-100 animate-pulse" />
    </div>
  );
}

export default function AddJobLoading() {
  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Page header */}
      <div className="mb-8 space-y-1.5">
        <div className="h-7 w-28 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="h-4 w-56 rounded bg-zinc-100 animate-pulse" />
      </div>

      <div className="space-y-5">
        {/* Company + Role */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SkeletonField wide />
          <SkeletonField wide />
        </div>

        {/* Status + Job Type */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SkeletonField />
          <SkeletonField />
        </div>

        {/* Location + Salary */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SkeletonField wide />
          <SkeletonField />
        </div>

        {/* Job URL */}
        <SkeletonField wide />

        {/* Applied Date */}
        <SkeletonField wide />

        {/* Description textarea */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-28 rounded bg-zinc-200 animate-pulse" />
          <div className="h-24 w-full rounded-lg bg-zinc-100 animate-pulse" />
        </div>

        {/* Notes textarea */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-12 rounded bg-zinc-200 animate-pulse" />
          <div className="h-20 w-full rounded-lg bg-zinc-100 animate-pulse" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-10 w-24 rounded-lg bg-zinc-200 animate-pulse" />
          <div className="h-10 w-20 rounded-lg bg-zinc-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

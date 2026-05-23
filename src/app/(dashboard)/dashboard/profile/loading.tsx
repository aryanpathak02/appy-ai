// loading.tsx — shown during initial navigation to /dashboard/profile
// Matches the exact layout of profile/page.tsx

function SkeletonField() {
  return (
    <div className="space-y-1">
      <div className="h-3 w-20 rounded bg-zinc-200 animate-pulse" />
      <div className="h-10 w-full rounded-lg bg-zinc-100 animate-pulse" />
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl w-full">
      {/* Page header */}
      <div className="space-y-1.5">
        <div className="h-7 w-20 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="h-4 w-64 rounded bg-zinc-100 animate-pulse" />
      </div>

      {/* Personal info card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5 animate-pulse">
        {/* Avatar + name row */}
        <div className="flex items-center gap-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-zinc-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-zinc-200" />
            <div className="h-3 w-44 rounded bg-zinc-100" />
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-zinc-200" />
          <div className="h-4 w-36 rounded bg-zinc-200" />
        </div>

        {/* Name + Email fields */}
        <SkeletonField />
        <SkeletonField />

        {/* Save button */}
        <div className="h-10 w-32 rounded-lg bg-zinc-200" />
      </div>

      {/* Change password card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5 animate-pulse">
        {/* Section label */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-zinc-200" />
          <div className="h-4 w-32 rounded bg-zinc-200" />
        </div>

        {/* Current / New / Confirm password fields */}
        <SkeletonField />
        <SkeletonField />
        <SkeletonField />

        {/* Change password button */}
        <div className="h-10 w-40 rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}

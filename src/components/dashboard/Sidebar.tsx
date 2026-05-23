"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/lib/toast";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/dashboard/jobs", label: "Applied Jobs", icon: "💼" },
  { href: "/dashboard/add-job", label: "Add Job", icon: "＋" },
  { href: "/dashboard/resume", label: "My Resume", icon: "📄" },
  { href: "/dashboard/interview-prep", label: "Interview Prep", icon: "🎯" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
];

// ─── Single nav link ──────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  icon,
  active,
  mobile,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-0.5 flex-1 px-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-0 ${
          active
            ? "text-zinc-900"
            : "text-zinc-400 hover:text-zinc-700"
        }`}
      >
        <span className={`text-lg leading-none p-1 rounded-lg transition-colors ${active ? "bg-zinc-100" : ""}`}>{icon}</span>
        <span className="leading-tight truncate w-full text-center">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </Link>
  );
}

// ─── Logout button (shared between mobile and desktop) ───────────────────────

function LogoutButton({ mobile }: { mobile?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        showToast.success("Logged out successfully.");
        router.push("/login");
        router.refresh(); // clear Next.js router cache so middleware re-runs
      } else {
        showToast.error("Logout failed. Please try again.");
      }
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (mobile) {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex flex-col items-center gap-0.5 flex-1 px-1 py-1.5 rounded-lg text-[10px] font-medium text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors min-w-0"
      >
        <span className="text-lg leading-none p-1 rounded-lg">🚪</span>
        <span className="leading-tight">{loading ? "..." : "Logout"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 transition-colors"
    >
      <span className="text-base leading-none">🚪</span>
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile top header (logo only) ─────────────────────────────────── */}
      <header className="lg:hidden w-full bg-white border-b border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            Apply<span className="text-blue-600">AI</span>
          </span>
          <span className="text-xs text-zinc-400">Job tracker, powered by AI</span>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ──────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around px-1 py-1 safe-area-inset-bottom">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              mobile
            />
          ))}
          <LogoutButton mobile />
        </div>
      </nav>

      {/* ── Desktop left sidebar ────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-zinc-200 bg-white">
        <div className="flex flex-col h-full px-4 py-6">
          {/* Logo */}
          <div className="mb-8 px-1">
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Apply<span className="text-blue-600">AI</span>
            </span>
            <p className="text-xs text-zinc-400 mt-0.5">Job tracker, powered by AI</p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href}
              />
            ))}
          </nav>

          {/* Footer — logout + copyright */}
          <div className="mt-auto pt-4 border-t border-zinc-100 flex flex-col gap-2">
            <LogoutButton />
            <p className="text-xs text-zinc-400 px-1">© 2025 ApplyAI</p>
          </div>
        </div>
      </aside>
    </>
  );
}

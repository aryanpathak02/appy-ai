"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string | null;
  email: string;
  createdAt: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonField() {
  return <div className="h-10 rounded-lg bg-zinc-100 animate-pulse" />;
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

function AvatarInitials({ name, email }: { name: string | null; email: string }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-white text-xl font-semibold select-none">
      {initials}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Info form state ────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  // ── Password form state ────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Fetch profile on mount ─────────────────────────────────────────────────

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok && data.success) {
          const p = data.data as ProfileData;
          setProfile(p);
          setName(p.name ?? "");
          setEmail(p.email);
        } else {
          showToast.error(data.message ?? "Failed to load profile.");
        }
      } catch {
        showToast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // ── Save name / email ──────────────────────────────────────────────────────

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      showToast.error("Name cannot be empty.");
      return;
    }
    if (!trimmedEmail) {
      showToast.error("Email cannot be empty.");
      return;
    }

    // Only send if something actually changed
    const nameChanged = trimmedName !== (profile?.name ?? "");
    const emailChanged = trimmedEmail !== profile?.email;
    if (!nameChanged && !emailChanged) {
      showToast.error("No changes to save.");
      return;
    }

    setSavingInfo(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast.error(data.message ?? "Failed to update profile.");
        return;
      }

      const updated = data.data as ProfileData;
      setProfile(updated);
      setName(updated.name ?? "");
      setEmail(updated.email);
      showToast.success("Profile updated successfully.");
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setSavingInfo(false);
    }
  }

  // ── Change password ────────────────────────────────────────────────────────

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!currentPassword) {
      showToast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      showToast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast.error("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast.error(data.message ?? "Failed to change password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast.success("Password changed successfully.");
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  // ── Info form: enable only when both fields have a value ──────────────────
  const canSaveInfo = name.trim().length > 0 && email.trim().length > 0;

  // ── Password form: enable only when all three fields meet requirements ─────
  const canChangePassword =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmPassword.length > 0;

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-2xl w-full">
        <div className="h-8 w-36 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-zinc-200 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded bg-zinc-200 animate-pulse" />
              <div className="h-3 w-48 rounded bg-zinc-100 animate-pulse" />
            </div>
          </div>
          <SkeletonField />
          <SkeletonField />
          <div className="h-10 w-28 rounded-lg bg-zinc-200 animate-pulse" />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="h-5 w-40 rounded bg-zinc-200 animate-pulse" />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <div className="h-10 w-36 rounded-lg bg-zinc-200 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl w-full">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Profile</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Manage your account details and password.
        </p>
      </div>

      {/* ── Account info card ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {/* Avatar + member since */}
        <div className="flex items-center gap-4 mb-6">
          <AvatarInitials name={profile?.name ?? null} email={profile?.email ?? ""} />
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {profile?.name ?? "No name set"}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Member since{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        {/* Info form */}
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">👤</span>
            <h2 className="text-sm font-semibold text-zinc-900">Personal Information</h2>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label
              htmlFor="profile-name"
              className="block text-xs font-medium text-zinc-600"
            >
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="profile-email"
              className="block text-xs font-medium text-zinc-600"
            >
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={!canSaveInfo || savingInfo}
            className="w-full sm:w-auto rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {savingInfo ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* ── Change password card ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🔒</span>
            <h2 className="text-sm font-semibold text-zinc-900">Change Password</h2>
          </div>

          {/* Current password */}
          <div className="space-y-1">
            <label
              htmlFor="current-password"
              className="block text-xs font-medium text-zinc-600"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          {/* New password */}
          <div className="space-y-1">
            <label
              htmlFor="new-password"
              className="block text-xs font-medium text-zinc-600"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          {/* Confirm new password */}
          <div className="space-y-1">
            <label
              htmlFor="confirm-password"
              className="block text-xs font-medium text-zinc-600"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={!canChangePassword || savingPassword}
            className="w-full sm:w-auto rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {savingPassword ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

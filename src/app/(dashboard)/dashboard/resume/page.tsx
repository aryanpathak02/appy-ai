"use client";

import { useEffect, useRef, useState } from "react";
import { showToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResumeInfo {
  name: string | null;
  email: string;
  resumeUrl: string | null;
  hasResumeText: boolean;
  resumeParsedAt: string | null;
}

/**
 * Our own proxy endpoint — fetches the PDF from Cloudinary server-side and
 * streams it back with Content-Type: application/pdf + inline disposition.
 * Works regardless of whether the file was uploaded as "raw" or "image".
 */
const RESUME_VIEW_URL = "/api/user/resume/view";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResumePage() {
  const [info, setInfo] = useState<ResumeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  // Incrementing this forces the iframe to remount after a new upload
  const [previewKey, setPreviewKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch current resume info on mount ────────────────────────────────────

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch("/api/user/resume");
        const data = await res.json();
        if (res.ok && data.success) {
          setInfo(data.data as ResumeInfo);
        }
      } catch {
        showToast.error("Failed to load resume info.");
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, []);

  // ── Upload handler ─────────────────────────────────────────────────────────

  async function handleUpload(file: File) {
    if (file.type !== "application/pdf") {
      showToast.error("Only PDF files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("File too large. Maximum size is 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/user/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast.error(data.message ?? "Upload failed.");
        return;
      }

      setInfo((prev) => prev ? { ...prev, resumeUrl: data.data.resumeUrl, hasResumeText: data.data.hasResumeText } : prev);
      setPreviewKey((k) => k + 1);

      if (data.data.parseWarning) {
        showToast.error(data.data.parseWarning);
      } else {
        showToast.success("Resume uploaded and text extracted successfully!");
      }
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  // ── Delete handler ─────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!confirm("Are you sure you want to remove your resume?")) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/user/resume", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast.error(data.message ?? "Failed to delete resume.");
        return;
      }

      setInfo((prev) => prev ? { ...prev, resumeUrl: null } : prev);
      showToast.success("Resume removed.");
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-3xl">
        <div className="h-8 w-40 rounded-lg bg-zinc-200 animate-pulse" />
        <div className="h-48 rounded-xl bg-zinc-100 animate-pulse" />
        <div className="h-96 rounded-xl bg-zinc-100 animate-pulse" />
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">My Resume</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Upload your resume as a PDF. It will be stored securely and used for AI matching.
        </p>
      </div>

      {/* ── Upload / Replace card ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <h2 className="text-sm font-semibold text-zinc-900">
            {info?.resumeUrl ? "Replace Resume" : "Upload Resume"}
          </h2>
          {/* AI text extraction status badge */}
          {info?.resumeUrl && (
            info.hasResumeText ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                🤖 AI Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                ⚠️ Text not extracted
              </span>
            )
          )}
        </div>

        {/* Drag & drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors ${
            dragOver
              ? "border-zinc-900 bg-zinc-50"
              : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
          }`}
        >
          <span className="text-3xl">{uploading ? "⏳" : "☁️"}</span>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700">
              {uploading
                ? "Uploading your resume..."
                : "Drag & drop your PDF here, or click to browse"}
            </p>
            <p className="text-xs text-zinc-400 mt-1">PDF only · Max 5 MB</p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {uploading ? "Uploading..." : info?.resumeUrl ? "Replace PDF" : "Upload PDF"}
          </button>

          {info?.resumeUrl && (
            <>
              <a
                href={RESUME_VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
              >
                ⬇️ Download
              </a>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {deleting ? "Removing..." : "🗑️ Remove"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── PDF Preview ────────────────────────────────────────────────────── */}
      {info?.resumeUrl ? (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-base">👁️</span>
              <span className="text-sm font-medium text-zinc-900">Resume Preview</span>
            </div>
            <a
              href={RESUME_VIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Open in new tab ↗
            </a>
          </div>

          {/*
           * Points to our proxy route which:
           * 1. Verifies the user's JWT cookie
           * 2. Fetches the PDF from Supabase Storage server-side
           * 3. Returns it with Content-Type: application/pdf + inline disposition
           * The browser renders it natively — no CORS issues.
           * ?t= cache-busts the iframe after a new upload.
           */}
          <iframe
            key={previewKey}
            src={`${RESUME_VIEW_URL}?t=${previewKey}`}
            title="Resume Preview"
            className="w-full border-0"
            style={{ height: "80vh", minHeight: "600px" }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <span className="text-4xl mb-3">📭</span>
          <p className="text-sm font-medium text-zinc-700">No resume uploaded yet</p>
          <p className="text-xs text-zinc-400 mt-1">
            Upload a PDF above to preview it here.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormFields {
  company: string;
  role: string;
  status: string;
  jobType: string;
  location: string;
  salary: string;
  jobUrl: string;
  description: string;
  notes: string;
  appliedDate: string;
}

interface FormErrors {
  company?: string;
  role?: string;
  status?: string;
  jobUrl?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};

  if (!fields.company.trim()) {
    errors.company = "Company name is required.";
  }

  if (!fields.role.trim()) {
    errors.role = "Job role is required.";
  }

  if (!fields.status) {
    errors.status = "Please select a status.";
  }

  if (fields.jobUrl.trim()) {
    try {
      new URL(fields.jobUrl.trim());
    } catch {
      errors.jobUrl = "Please enter a valid URL (e.g. https://example.com/job).";
    }
  }

  return errors;
}

// ─── Reusable field components ────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition";

const inputErrorClass =
  "w-full rounded-lg border border-red-400 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition";

// Select gets extra right padding so the native arrow doesn't overlap the text
const selectClass =
  "w-full appearance-none rounded-lg border border-zinc-300 pl-3 pr-9 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center]";

const selectErrorClass =
  "w-full appearance-none rounded-lg border border-red-400 pl-3 pr-9 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23f87171%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center]";

// ─── Page ─────────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormFields = {
  company: "",
  role: "",
  status: "applied",
  jobType: "",
  location: "",
  salary: "",
  jobUrl: "",
  description: "",
  notes: "",
  appliedDate: "",
};

export default function AddJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormFields>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Frontend validation
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast.error("Please fix the errors before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      // Build payload — omit empty optional fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = {
        company: form.company.trim(),
        role: form.role.trim(),
        status: form.status,
      };

      if (form.jobType) payload.jobType = form.jobType;
      if (form.location.trim()) payload.location = form.location.trim();
      if (form.salary.trim()) payload.salary = form.salary.trim();
      if (form.jobUrl.trim()) payload.jobUrl = form.jobUrl.trim();
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.notes.trim()) payload.notes = form.notes.trim();
      if (form.appliedDate) payload.appliedDate = new Date(form.appliedDate).toISOString();

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Surface server-side field errors if any
        if (data.errors) {
          const serverErrors: FormErrors = {};
          for (const [key, msgs] of Object.entries(data.errors)) {
            serverErrors[key as keyof FormErrors] = (msgs as string[])[0];
          }
          setErrors(serverErrors);
        }
        showToast.error(data.message ?? "Failed to add job.");
        return;
      }

      showToast.success("Job added successfully! 🎉");
      router.push("/dashboard");
    } catch {
      showToast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    form.company.trim().length > 0 &&
    form.role.trim().length > 0 &&
    form.status.length > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Add a Job</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Track a new job application in your pipeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* ── Required fields ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Company" required error={errors.company}>
            <input
              name="company"
              type="text"
              placeholder="e.g. Google"
              value={form.company}
              onChange={handleChange}
              className={errors.company ? inputErrorClass : inputClass}
            />
          </Field>

          <Field label="Role" required error={errors.role}>
            <input
              name="role"
              type="text"
              placeholder="e.g. Frontend Developer"
              value={form.role}
              onChange={handleChange}
              className={errors.role ? inputErrorClass : inputClass}
            />
          </Field>
        </div>

        {/* ── Status + Job Type ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Status" required error={errors.status}>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={errors.status ? selectErrorClass : selectClass}
            >
              <option value="">Select status</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="offer">Offer</option>
            </select>
          </Field>

          <Field label="Job Type">
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select type</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </Field>
        </div>

        {/* ── Location + Salary ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Location">
            <input
              name="location"
              type="text"
              placeholder="e.g. Bangalore, India"
              value={form.location}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Salary">
            <input
              name="salary"
              type="text"
              placeholder="e.g. ₹12 LPA or $80k"
              value={form.salary}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
        </div>

        {/* ── Job URL ──────────────────────────────────────────────────────── */}
        <Field label="Job URL" error={errors.jobUrl}>
          <input
            name="jobUrl"
            type="url"
            placeholder="https://careers.example.com/job/123"
            value={form.jobUrl}
            onChange={handleChange}
            className={errors.jobUrl ? inputErrorClass : inputClass}
          />
        </Field>

        {/* ── Applied Date ─────────────────────────────────────────────────── */}
        <Field label="Applied Date">
          <input
            name="appliedDate"
            type="date"
            value={form.appliedDate}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        {/* ── Description ──────────────────────────────────────────────────── */}
        <Field label="Job Description">
          <textarea
            name="description"
            rows={4}
            placeholder="Paste the job description here..."
            value={form.description}
            onChange={handleChange}
            className={`${inputClass} resize-none`}
          />
        </Field>

        {/* ── Notes ────────────────────────────────────────────────────────── */}
        <Field label="Notes">
          <textarea
            name="notes"
            rows={3}
            placeholder="Any personal notes about this role..."
            value={form.notes}
            onChange={handleChange}
            className={`${inputClass} resize-none`}
          />
        </Field>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Saving..." : "Add Job"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

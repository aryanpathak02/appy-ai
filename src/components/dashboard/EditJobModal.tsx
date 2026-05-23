"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";
import { Job } from "@/types/job";

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

interface EditJobModalProps {
  job: Job;
  onClose: () => void;
  onSaved: (updated: Job) => void;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.company.trim()) errors.company = "Company name is required.";
  if (!fields.role.trim()) errors.role = "Job role is required.";
  if (!fields.status) errors.status = "Please select a status.";
  if (fields.jobUrl.trim()) {
    try {
      new URL(fields.jobUrl.trim());
    } catch {
      errors.jobUrl = "Please enter a valid URL.";
    }
  }
  return errors;
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition";

const inputErrorClass =
  "w-full rounded-lg border border-red-400 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition";

const selectClass =
  "w-full appearance-none rounded-lg border border-zinc-300 pl-3 pr-9 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center]";

const selectErrorClass =
  "w-full appearance-none rounded-lg border border-red-400 pl-3 pr-9 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23f87171%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center]";

// ─── Field wrapper ────────────────────────────────────────────────────────────

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
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function EditJobModal({ job, onClose, onSaved }: EditJobModalProps) {
  // Pre-fill form from the job being edited
  const [form, setForm] = useState<FormFields>({
    company: job.company,
    role: job.role,
    status: job.status,
    jobType: job.jobType ?? "",
    location: job.location ?? "",
    salary: job.salary ?? "",
    jobUrl: job.jobUrl ?? "",
    description: job.description ?? "",
    notes: job.notes ?? "",
    appliedDate: job.appliedDate
      ? new Date(job.appliedDate).toISOString().split("T")[0]
      : "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast.error("Please fix the errors before saving.");
      return;
    }

    setSubmitting(true);

    try {
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

      const res = await fetch(`/api/jobs/${job._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          const serverErrors: FormErrors = {};
          for (const [key, msgs] of Object.entries(data.errors)) {
            serverErrors[key as keyof FormErrors] = (msgs as string[])[0];
          }
          setErrors(serverErrors);
        }
        showToast.error(data.message ?? "Failed to update job.");
        return;
      }

      showToast.success("Job updated successfully!");
      onSaved(data.data as Job);
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

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Edit Job</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{job.company} — {job.role}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company" required error={errors.company}>
              <input name="company" type="text" value={form.company} onChange={handleChange}
                className={errors.company ? inputErrorClass : inputClass} />
            </Field>
            <Field label="Role" required error={errors.role}>
              <input name="role" type="text" value={form.role} onChange={handleChange}
                className={errors.role ? inputErrorClass : inputClass} />
            </Field>
          </div>

          {/* Status + Job Type */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status" required error={errors.status}>
              <select name="status" value={form.status} onChange={handleChange}
                className={errors.status ? selectErrorClass : selectClass}>
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="offer">Offer</option>
              </select>
            </Field>
            <Field label="Job Type">
              <select name="jobType" value={form.jobType} onChange={handleChange} className={selectClass}>
                <option value="">Select type</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </Field>
          </div>

          {/* Location + Salary */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location">
              <input name="location" type="text" placeholder="e.g. Bangalore" value={form.location}
                onChange={handleChange} className={inputClass} />
            </Field>
            <Field label="Salary">
              <input name="salary" type="text" placeholder="e.g. ₹12 LPA" value={form.salary}
                onChange={handleChange} className={inputClass} />
            </Field>
          </div>

          {/* Job URL */}
          <Field label="Job URL" error={errors.jobUrl}>
            <input name="jobUrl" type="url" placeholder="https://..." value={form.jobUrl}
              onChange={handleChange} className={errors.jobUrl ? inputErrorClass : inputClass} />
          </Field>

          {/* Applied Date */}
          <Field label="Applied Date">
            <input name="appliedDate" type="date" value={form.appliedDate}
              onChange={handleChange} className={inputClass} />
          </Field>

          {/* Description */}
          <Field label="Job Description">
            <textarea name="description" rows={3} value={form.description}
              onChange={handleChange} className={`${inputClass} resize-none`} />
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea name="notes" rows={2} value={form.notes}
              onChange={handleChange} className={`${inputClass} resize-none`} />
          </Field>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={!canSubmit || submitting}
              className="flex-1 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

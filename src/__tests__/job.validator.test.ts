/**
 * job.validator.test.ts
 *
 * Tests for the Zod schemas that guard the job CRUD endpoints.
 * Pure functions — no DB, no network, no mocking required.
 */

import {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema,
} from "@/lib/validators/job.validator";

// ─── createJobSchema ──────────────────────────────────────────────────────────

describe("createJobSchema", () => {
  const valid = {
    company: "Google",
    role: "Frontend Developer",
    status: "applied",
  };

  it("accepts a minimal valid payload (company + role + status)", () => {
    const result = createJobSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts a full valid payload with all optional fields", () => {
    const result = createJobSchema.safeParse({
      ...valid,
      jobType: "remote",
      location: "Bangalore, India",
      salary: "₹12 LPA",
      notes: "Referral from a friend",
      jobUrl: "https://careers.google.com/jobs/123",
      description: "Build amazing UIs",
      appliedDate: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("defaults status to 'saved' when not provided", () => {
    const result = createJobSchema.safeParse({ company: "Meta", role: "SWE" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("saved");
    }
  });

  it("rejects a missing company", () => {
    const result = createJobSchema.safeParse({ ...valid, company: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.company).toBeDefined();
    }
  });

  it("rejects a missing role", () => {
    const result = createJobSchema.safeParse({ ...valid, role: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.role).toBeDefined();
    }
  });

  it("rejects an invalid status value", () => {
    const result = createJobSchema.safeParse({ ...valid, status: "pending" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid jobType value", () => {
    const result = createJobSchema.safeParse({ ...valid, jobType: "freelance" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed jobUrl", () => {
    const result = createJobSchema.safeParse({ ...valid, jobUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty string jobUrl (optional field cleared)", () => {
    const result = createJobSchema.safeParse({ ...valid, jobUrl: "" });
    expect(result.success).toBe(true);
  });
});

// ─── updateJobSchema ──────────────────────────────────────────────────────────

describe("updateJobSchema", () => {
  it("accepts an empty object (all fields optional on update)", () => {
    const result = updateJobSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with only status", () => {
    const result = updateJobSchema.safeParse({ status: "interview" });
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with only notes", () => {
    const result = updateJobSchema.safeParse({ notes: "Follow up next week" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status on partial update", () => {
    const result = updateJobSchema.safeParse({ status: "ghosted" });
    expect(result.success).toBe(false);
  });
});

// ─── jobQuerySchema ───────────────────────────────────────────────────────────

describe("jobQuerySchema", () => {
  it("applies defaults when no params are provided", () => {
    const result = jobQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("coerces string page and limit to numbers", () => {
    const result = jobQuerySchema.safeParse({ page: "2", limit: "20" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects page less than 1", () => {
    const result = jobQuerySchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = jobQuerySchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid status filter", () => {
    const result = jobQuerySchema.safeParse({ status: "interview" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status filter", () => {
    const result = jobQuerySchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });
});

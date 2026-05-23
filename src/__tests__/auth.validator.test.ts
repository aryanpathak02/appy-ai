/**
 * auth.validator.test.ts
 *
 * Tests for the Zod schemas that guard the register and login endpoints.
 * These are pure functions — no DB, no network, no mocking required.
 */

import { registerSchema, loginSchema } from "@/lib/validators/auth.validator";

// ─── registerSchema ───────────────────────────────────────────────────────────

describe("registerSchema", () => {
  const valid = {
    name: "Aryan Pathak",
    email: "aryan@example.com",
    password: "secret123",
  };

  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("normalises email to lowercase", () => {
    const result = registerSchema.safeParse({ ...valid, email: "ARYAN@EXAMPLE.COM" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("aryan@example.com");
    }
  });

  it("rejects a missing name", () => {
    const result = registerSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({ ...valid, password: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });

  it("rejects when all fields are missing", () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  const valid = { email: "aryan@example.com", password: "secret123" };

  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("normalises email to lowercase", () => {
    const result = loginSchema.safeParse({ ...valid, email: "ARYAN@EXAMPLE.COM" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("aryan@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ ...valid, email: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ ...valid, password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });
});

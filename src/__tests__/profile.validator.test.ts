/**
 * profile.validator.test.ts
 *
 * Tests for the Zod schema that guards the profile update endpoint.
 * Pure functions — no DB, no network, no mocking required.
 */

import { updateProfileSchema } from "@/lib/validators/profile.validator";

describe("updateProfileSchema", () => {
  it("accepts a name-only update", () => {
    const result = updateProfileSchema.safeParse({ name: "Aryan Pathak" });
    expect(result.success).toBe(true);
  });

  it("accepts an email-only update", () => {
    const result = updateProfileSchema.safeParse({ email: "new@example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts a password change with both currentPassword and newPassword", () => {
    const result = updateProfileSchema.safeParse({
      currentPassword: "oldpass123",
      newPassword: "newpass456",
    });
    expect(result.success).toBe(true);
  });

  it("accepts updating name + email together", () => {
    const result = updateProfileSchema.safeParse({
      name: "Aryan",
      email: "aryan@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects newPassword without currentPassword", () => {
    const result = updateProfileSchema.safeParse({ newPassword: "newpass456" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.currentPassword).toBeDefined();
    }
  });

  it("rejects a newPassword shorter than 6 characters", () => {
    const result = updateProfileSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "abc",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.newPassword).toBeDefined();
    }
  });

  it("rejects an invalid email format", () => {
    const result = updateProfileSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("accepts an empty object (no-op update — controller handles this case)", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

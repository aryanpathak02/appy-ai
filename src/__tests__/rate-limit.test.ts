/**
 * rate-limit.test.ts
 *
 * Tests for the in-memory rate limiter.
 * Uses the low-level checkRateLimit() function directly — no HTTP needed.
 */

import { checkRateLimit } from "@/lib/rate-limit";

// ─── checkRateLimit ───────────────────────────────────────────────────────────

describe("checkRateLimit", () => {
  it("allows the first request within the window", () => {
    const result = checkRateLimit("test:user-1", { limit: 5, windowMs: 60_000 });
    expect(result).toBeNull(); // null = allowed
  });

  it("allows requests up to the limit", () => {
    const key = "test:user-2";
    const opts = { limit: 3, windowMs: 60_000 };

    // First 3 should all pass
    expect(checkRateLimit(key, opts)).toBeNull();
    expect(checkRateLimit(key, opts)).toBeNull();
    expect(checkRateLimit(key, opts)).toBeNull();
  });

  it("blocks the request that exceeds the limit", () => {
    const key = "test:user-3";
    const opts = { limit: 2, windowMs: 60_000 };

    checkRateLimit(key, opts); // 1st — allowed
    checkRateLimit(key, opts); // 2nd — allowed
    const blocked = checkRateLimit(key, opts); // 3rd — should be blocked

    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
  });

  it("returns a response with Retry-After header when blocked", async () => {
    const key = "test:user-4";
    const opts = { limit: 1, windowMs: 60_000 };

    checkRateLimit(key, opts); // 1st — allowed
    const blocked = checkRateLimit(key, opts); // 2nd — blocked

    expect(blocked).not.toBeNull();
    const retryAfter = blocked?.headers.get("Retry-After");
    expect(retryAfter).toBeDefined();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  it("uses separate counters for different keys", () => {
    const opts = { limit: 1, windowMs: 60_000 };

    // Each unique key gets its own counter
    expect(checkRateLimit("test:user-a", opts)).toBeNull();
    expect(checkRateLimit("test:user-b", opts)).toBeNull();
    expect(checkRateLimit("test:user-c", opts)).toBeNull();
  });

  it("resets the counter after the window expires", async () => {
    const key = "test:user-5";
    const opts = { limit: 1, windowMs: 50 }; // 50ms window

    checkRateLimit(key, opts); // 1st — allowed
    const blocked = checkRateLimit(key, opts); // 2nd — blocked
    expect(blocked).not.toBeNull();

    // Wait for the window to expire
    await new Promise((r) => setTimeout(r, 60));

    // Should be allowed again in the new window
    const afterReset = checkRateLimit(key, opts);
    expect(afterReset).toBeNull();
  });
});

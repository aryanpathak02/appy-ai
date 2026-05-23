import "server-only";
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number; // epoch ms when the window resets
}

// ─── In-memory store ──────────────────────────────────────────────────────────
// A single Map per process. Next.js runs API routes in the same Node.js process
// so this is shared across all requests. For multi-instance deployments, swap
// this for a Redis-backed store (e.g. @upstash/ratelimit).

const store = new Map<string, RateLimitEntry>();

// Prune expired entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000);

// ─── Core check ───────────────────────────────────────────────────────────────

/**
 * Returns a 429 NextResponse if the key has exceeded the limit, otherwise null.
 * Call this at the top of a route handler and return early if it returns a response.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // First request in this window (or window has expired)
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= limit) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        message: `Too many requests. Please try again in ${retryAfterSec} second${retryAfterSec !== 1 ? "s" : ""}.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count += 1;
  return null;
}

// ─── IP helper ────────────────────────────────────────────────────────────────

/**
 * Extracts the best available client IP from the request.
 * Falls back to "unknown" if none is found.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────

/**
 * Strict limiter for auth endpoints (login / register).
 * Keyed by IP — 10 requests per 15 minutes.
 * Protects against brute-force and credential stuffing.
 */
export function authRateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req);
  return checkRateLimit(`auth:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
}

/**
 * AI endpoint limiter — keyed by userId.
 * 20 requests per hour. Protects Groq API costs.
 */
export function aiRateLimit(req: NextRequest, userId: string): NextResponse | null {
  return checkRateLimit(`ai:${userId}`, { limit: 20, windowMs: 60 * 60 * 1000 });
}

/**
 * Write endpoint limiter — keyed by userId.
 * 60 requests per minute. Prevents bulk mutation abuse.
 */
export function writeRateLimit(req: NextRequest, userId: string): NextResponse | null {
  return checkRateLimit(`write:${userId}`, { limit: 60, windowMs: 60 * 1000 });
}

/**
 * Read endpoint limiter — keyed by userId.
 * 120 requests per minute. Prevents scraping / polling abuse.
 */
export function readRateLimit(req: NextRequest, userId: string): NextResponse | null {
  return checkRateLimit(`read:${userId}`, { limit: 120, windowMs: 60 * 1000 });
}

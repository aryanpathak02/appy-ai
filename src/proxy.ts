import { NextRequest, NextResponse } from "next/server";

// ─── Route config ─────────────────────────────────────────────────────────────

/** Routes that require the user to be logged in. */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Routes that logged-in users should be redirected away from. */
const AUTH_ROUTES = ["/login", "/register"];

// ─── Lightweight JWT verification (Edge-compatible) ───────────────────────────

/**
 * Verifies a HS256 JWT using the Web Crypto API.
 * Returns true if the token is structurally valid and the signature matches.
 * We only need to know "is this token legit?" — we don't need the payload here.
 */
async function isValidToken(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode and check expiry from payload
    const payloadJson = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );
    if (payloadJson.exp && Date.now() / 1000 > payloadJson.exp) return false;

    // Import the secret key
    const keyData = new TextEncoder().encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify the signature
    const signatureBytes = Buffer.from(signatureB64, "base64url");
    const dataToVerify = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

    return await crypto.subtle.verify("HMAC", cryptoKey, signatureBytes, dataToVerify);
  } catch {
    return false;
  }
}

// ─── Proxy (replaces middleware) ──────────────────────────────────────────────

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value ?? null;
  const secret = process.env.JWT_SECRET ?? "";

  const loggedIn = token ? await isValidToken(token, secret) : false;

  // ── Protected routes: redirect to /login if not authenticated ─────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !loggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth routes: redirect to /dashboard if already logged in ──────────────
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute && loggedIn) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// ─── Matcher: only run on page routes, skip static assets & API ───────────────

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - /api/*        (API routes handle their own auth via getUserId())
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

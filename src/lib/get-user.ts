import "server-only";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

interface JwtPayload {
  id: string;
}

/**
 * Extracts and verifies the JWT from the request cookie.
 * Returns the userId string or null if missing/invalid.
 */
export function getUserId(req: NextRequest): string | null {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return payload.id ?? null;
  } catch {
    return null;
  }
}

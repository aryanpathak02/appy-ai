import { NextRequest } from "next/server";
import { registerController } from "@/controllers/auth.controller";
import { authRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = authRateLimit(req);
  if (limited) return limited;
  return registerController(req);
}

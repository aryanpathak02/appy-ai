import { NextRequest } from "next/server";
import { getDashboardController } from "@/controllers/dashboard.controller";
import { getUserId } from "@/lib/get-user";
import { readRateLimit } from "@/lib/rate-limit";

// GET /api/dashboard — aggregated KPI, AI insights, and recent jobs
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = readRateLimit(req, userId);
    if (limited) return limited;
  }
  return getDashboardController(req);
}

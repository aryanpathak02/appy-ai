import { NextRequest } from "next/server";
import { interviewPrepController } from "@/controllers/interview-prep.controller";
import { getUserId } from "@/lib/get-user";
import { aiRateLimit } from "@/lib/rate-limit";

// POST /api/interview-prep — generate interview questions for a role
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = aiRateLimit(req, userId);
    if (limited) return limited;
  }
  return interviewPrepController(req);
}

import { NextRequest } from "next/server";
import { aiMatchController } from "@/controllers/ai-match.controller";
import { getUserId } from "@/lib/get-user";
import { aiRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

// POST /api/jobs/:id/ai-match — run AI match evaluation for a job
export async function POST(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (userId) {
    const limited = aiRateLimit(req, userId);
    if (limited) return limited;
  }
  const { id } = await params;
  return aiMatchController(req, id);
}

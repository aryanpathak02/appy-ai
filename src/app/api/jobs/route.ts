import { NextRequest } from "next/server";
import { createJobController, getJobsController } from "@/controllers/job.controller";
import { getUserId } from "@/lib/get-user";
import { readRateLimit, writeRateLimit } from "@/lib/rate-limit";

// POST /api/jobs — create a job
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = writeRateLimit(req, userId);
    if (limited) return limited;
  }
  return createJobController(req);
}

// GET /api/jobs — get all jobs (paginated + search)
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = readRateLimit(req, userId);
    if (limited) return limited;
  }
  return getJobsController(req);
}

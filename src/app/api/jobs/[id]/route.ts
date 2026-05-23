import { NextRequest } from "next/server";
import {
  getJobByIdController,
  updateJobController,
  deleteJobController,
} from "@/controllers/job.controller";
import { getUserId } from "@/lib/get-user";
import { readRateLimit, writeRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

// GET /api/jobs/:id
export async function GET(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (userId) {
    const limited = readRateLimit(req, userId);
    if (limited) return limited;
  }
  const { id } = await params;
  return getJobByIdController(req, id);
}

// PATCH /api/jobs/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (userId) {
    const limited = writeRateLimit(req, userId);
    if (limited) return limited;
  }
  const { id } = await params;
  return updateJobController(req, id);
}

// DELETE /api/jobs/:id — soft delete
export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = getUserId(req);
  if (userId) {
    const limited = writeRateLimit(req, userId);
    if (limited) return limited;
  }
  const { id } = await params;
  return deleteJobController(req, id);
}

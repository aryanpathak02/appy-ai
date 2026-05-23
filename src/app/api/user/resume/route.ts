import { NextRequest } from "next/server";
import {
  getResumeController,
  uploadResumeController,
  deleteResumeController,
} from "@/controllers/resume.controller";
import { getUserId } from "@/lib/get-user";
import { readRateLimit, writeRateLimit } from "@/lib/rate-limit";

// GET /api/user/resume — get current resume URL + user info
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = readRateLimit(req, userId);
    if (limited) return limited;
  }
  return getResumeController(req);
}

// POST /api/user/resume — upload or replace resume (multipart/form-data)
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = writeRateLimit(req, userId);
    if (limited) return limited;
  }
  return uploadResumeController(req);
}

// DELETE /api/user/resume — remove resume
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = writeRateLimit(req, userId);
    if (limited) return limited;
  }
  return deleteResumeController(req);
}

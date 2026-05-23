import { NextRequest } from "next/server";
import {
  getProfileController,
  updateProfileController,
} from "@/controllers/profile.controller";
import { getUserId } from "@/lib/get-user";
import { readRateLimit, writeRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = readRateLimit(req, userId);
    if (limited) return limited;
  }
  return getProfileController(req);
}

export async function PUT(req: NextRequest) {
  const userId = getUserId(req);
  if (userId) {
    const limited = writeRateLimit(req, userId);
    if (limited) return limited;
  }
  return updateProfileController(req);
}

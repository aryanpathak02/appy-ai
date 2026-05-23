import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * supabase-storage.ts — Supabase client scoped to storage operations.
 * Uses the service-role key so it can bypass RLS for server-side uploads.
 * Import `supabaseStorage` anywhere on the server side.
 */
export const supabaseStorage = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

/** The bucket name where resumes are stored. */
export const RESUME_BUCKET = "resumes";

/**
 * Builds the storage path for a user's resume.
 * e.g. "user_abc123/resume.pdf"
 */
export function resumeStoragePath(userId: string): string {
  return `${userId}/resume.pdf`;
}

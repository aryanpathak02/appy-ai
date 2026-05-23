import "server-only";
import { NextRequest } from "next/server";
import pdfParse from "pdf-parse";
import { connectDB } from "@/lib/db";
import * as res from "@/lib/api-response";
import { getUserId } from "@/lib/get-user";
import { supabaseStorage, RESUME_BUCKET, resumeStoragePath } from "@/lib/supabase-storage";
import User from "@/models/user.model";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts plain text from a PDF buffer using pdf-parse.
 * pdf-parse is declared as a serverExternalPackage in next.config.ts
 * so it runs in Node.js directly and can safely use fs.
 * Returns the extracted text, or null if parsing fails (non-fatal).
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string | null> {
  try {
    const result = await pdfParse(buffer);
    // Collapse 3+ consecutive newlines into 2 to clean up whitespace
    return result.text.replace(/\n{3,}/g, "\n\n").trim();
  } catch (err) {
    console.warn("[extractTextFromPdf] Failed to parse PDF:", err);
    return null;
  }
}

// ─── GET /api/user/resume ─────────────────────────────────────────────────────

export async function getResumeController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const user = await User.findById(userId)
      .select("name email resume resumeText resumeParsedAt")
      .lean();
    if (!user) return res.error("User not found", 404);

    return res.success(
      {
        name: user.name ?? null,
        email: user.email,
        resumeUrl: user.resume ?? null,
        // Expose a boolean so the frontend knows text was extracted
        hasResumeText: Boolean(user.resumeText),
        resumeParsedAt: user.resumeParsedAt ?? null,
      },
      "Resume info fetched"
    );
  } catch (err) {
    console.error("[getResume]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── POST /api/user/resume — upload + parse ───────────────────────────────────

export async function uploadResumeController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file || !(file instanceof File)) {
      return res.error("No file provided. Send a PDF as 'resume' field.", 400);
    }

    if (file.type !== "application/pdf") {
      return res.error("Only PDF files are accepted.", 400);
    }

    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_BYTES) {
      return res.error("File too large. Maximum size is 5 MB.", 400);
    }

    // ── Step 1: Convert File → Buffer (needed for both parse + upload) ────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Step 2: Extract text from PDF (non-blocking — failure is non-fatal) ───
    const resumeText = await extractTextFromPdf(buffer);

    // ── Step 3: Upload to Supabase Storage ────────────────────────────────────
    // upsert: true replaces any existing file at the same path automatically
    const storagePath = resumeStoragePath(userId);
    const { error: uploadError } = await supabaseStorage.storage
      .from(RESUME_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadResume] Supabase upload error:", uploadError);
      return res.error("Failed to upload resume. Please try again.", 500);
    }

    // ── Step 4: Get the public URL ────────────────────────────────────────────
    const { data: urlData } = supabaseStorage.storage
      .from(RESUME_BUCKET)
      .getPublicUrl(storagePath);

    const resumeUrl = urlData.publicUrl;

    // ── Step 5: Save URL + extracted text to the User document ────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      resume: resumeUrl,
    };

    if (resumeText) {
      updatePayload.resumeText = resumeText;
      updatePayload.resumeParsedAt = new Date();
    }

    await User.findByIdAndUpdate(userId, updatePayload);

    return res.success(
      {
        resumeUrl,
        hasResumeText: Boolean(resumeText),
        // Surface a warning if parsing failed so the frontend can inform the user
        parseWarning: resumeText
          ? null
          : "Resume uploaded but text could not be extracted. AI matching may be limited.",
      },
      "Resume uploaded successfully"
    );
  } catch (err) {
    console.error("[uploadResume]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── DELETE /api/user/resume ──────────────────────────────────────────────────

export async function deleteResumeController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const user = await User.findById(userId).select("resume").lean();
    if (!user) return res.error("User not found", 404);
    if (!user.resume) return res.error("No resume to delete.", 400);

    // ── Delete from Supabase Storage ──────────────────────────────────────────
    const storagePath = resumeStoragePath(userId);
    const { error: deleteError } = await supabaseStorage.storage
      .from(RESUME_BUCKET)
      .remove([storagePath]);

    if (deleteError) {
      // Log but don't block — still clear the DB record
      console.warn("[deleteResume] Supabase delete failed:", deleteError);
    }

    // ── Clear all resume fields from the User document ────────────────────────
    await User.findByIdAndUpdate(userId, {
      $unset: { resume: "", resumeText: "", resumeParsedAt: "" },
    });

    return res.success(null, "Resume deleted successfully");
  } catch (err) {
    console.error("[deleteResume]", err);
    return res.error("Internal server error", 500);
  }
}

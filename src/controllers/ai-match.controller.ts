import "server-only";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import * as res from "@/lib/api-response";
import { getUserId } from "@/lib/get-user";
import { groqClient } from "@/lib/groq";
import {
  AI_MATCH_MODEL,
  AI_MATCH_SYSTEM_PROMPT,
  buildUserMessage,
  JD_VALIDATION_MODEL,
  JD_VALIDATION_SYSTEM_PROMPT,
  buildJdValidationMessage,
  PSEUDO_JD_MODEL,
  PSEUDO_JD_SYSTEM_PROMPT,
  buildPseudoJdMessage,
} from "@/lib/prompts/ai-match.prompt";
import Job from "@/models/job.model";
import User from "@/models/user.model";
import { AiMatchResult } from "@/types/ai-match";

// ─── Request body shape ───────────────────────────────────────────────────────

interface AiMatchRequestBody {
  /** User-pasted JD from the NoJdModal textarea */
  descriptionOverride?: string;
  /** True when user clicks "Continue with Role + Company only" */
  useFallback?: boolean;
}

// ─── Helper: validate JD with AI ─────────────────────────────────────────────

async function validateJobDescription(
  description: string
): Promise<{ isValid: boolean; reason: string }> {
  try {
    const completion = await groqClient.chat.completions.create({
      model: JD_VALIDATION_MODEL,
      messages: [
        { role: "system", content: JD_VALIDATION_SYSTEM_PROMPT },
        { role: "user", content: buildJdValidationMessage(description) },
      ],
      temperature: 0,
      max_tokens: 128,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as { isValid: boolean; reason: string };

    if (typeof parsed.isValid !== "boolean" || typeof parsed.reason !== "string") {
      console.warn("[validateJD] Unexpected shape:", parsed);
      return { isValid: true, reason: "Validation inconclusive — proceeding." };
    }
    return parsed;
  } catch (err) {
    // Fail open — a Groq outage should not block the user
    console.warn("[validateJD] Validation call failed:", err);
    return { isValid: true, reason: "Validation unavailable — proceeding." };
  }
}

// ─── Helper: generate pseudo-JD from role + company ──────────────────────────

async function generatePseudoJd(role: string, company: string): Promise<string> {
  const completion = await groqClient.chat.completions.create({
    model: PSEUDO_JD_MODEL,
    messages: [
      { role: "system", content: PSEUDO_JD_SYSTEM_PROMPT },
      { role: "user", content: buildPseudoJdMessage(role, company) },
    ],
    temperature: 0.4,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

// ─── POST /api/jobs/:id/ai-match ──────────────────────────────────────────────

export async function aiMatchController(req: NextRequest, jobId: string) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    // ── 1. Fetch the job ──────────────────────────────────────────────────────
    const job = await Job.findOne({ _id: jobId, userId, deletedAt: null }).lean();
    if (!job) return res.error("Job not found", 404);

    // ── 2. Check user has resume text ─────────────────────────────────────────
    const user = await User.findById(userId).select("resumeText").lean();
    if (!user?.resumeText?.trim()) {
      return res.error(
        "No resume text found. Upload your resume on the My Resume page first.",
        400
      );
    }

    // ── 3. Parse request body ─────────────────────────────────────────────────
    let body: AiMatchRequestBody = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is fine — means normal flow with job's own description
    }

    const { descriptionOverride, useFallback } = body;

    // ── 4. Resolve which description to use ───────────────────────────────────
    let descriptionToUse: string;
    let isFallback = false;
    let isOverride = false;

    if (useFallback) {
      // User chose "Continue with Role + Company only" — generate pseudo-JD
      isFallback = true;
      const pseudo = await generatePseudoJd(job.role, job.company);
      if (!pseudo) {
        return res.error("Failed to generate job context. Please try again.", 502);
      }
      descriptionToUse = pseudo;
    } else if (descriptionOverride?.trim()) {
      // User pasted a JD in the modal textarea
      isOverride = true;
      descriptionToUse = descriptionOverride.trim();

      // Validate the pasted description
      const MIN_LENGTH = 100;
      if (descriptionToUse.length < MIN_LENGTH) {
        return res.error(
          `Pasted description is too short (minimum ${MIN_LENGTH} characters). Please paste the full job description.`,
          400
        );
      }

      const validation = await validateJobDescription(descriptionToUse);
      if (!validation.isValid) {
        return res.error(
          `The pasted description doesn't look like a real job description: ${validation.reason}`,
          400
        );
      }
    } else {
      // Normal flow — use the job's own description
      const MIN_LENGTH = 100;
      if (!job.description?.trim() || job.description.trim().length < MIN_LENGTH) {
        return res.error(
          `Job description is too short (minimum ${MIN_LENGTH} characters). Paste the actual job description to get an accurate AI match.`,
          400
        );
      }

      const validation = await validateJobDescription(job.description);
      if (!validation.isValid) {
        return res.error(
          `The job description doesn't look valid: ${validation.reason} Please paste a real job description with skills, responsibilities, and requirements.`,
          400
        );
      }

      descriptionToUse = job.description;
    }

    // ── 5. Run the main AI match ──────────────────────────────────────────────
    const completion = await groqClient.chat.completions.create({
      model: AI_MATCH_MODEL,
      messages: [
        { role: "system", content: AI_MATCH_SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(descriptionToUse, user.resumeText) },
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    // ── 6. Parse and validate the JSON response ───────────────────────────────
    let parsed: AiMatchResult;
    try {
      parsed = JSON.parse(rawContent) as AiMatchResult;
    } catch {
      console.error("[aiMatch] Failed to parse Groq response:", rawContent);
      return res.error("AI returned an invalid response. Please try again.", 502);
    }

    if (
      typeof parsed.score !== "number" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.matchedSkills) ||
      !Array.isArray(parsed.missingSkills) ||
      typeof parsed.recommendation !== "string" ||
      !["Low", "Medium", "High"].includes(parsed.interviewReadiness)
    ) {
      console.error("[aiMatch] Unexpected response shape:", parsed);
      return res.error("AI returned an unexpected format. Please try again.", 502);
    }

    parsed.score = Math.min(100, Math.max(0, Math.round(parsed.score)));

    // ── 7. Persist result ─────────────────────────────────────────────────────
    // If user pasted an override JD, also save it to the job for future use
    const jobUpdate: Record<string, unknown> = {
      aiMatchScore: parsed.score,
      aiMatchResult: { ...parsed, evaluatedAt: new Date(), isFallback, isOverride },
    };
    if (isOverride) {
      jobUpdate.description = descriptionToUse;
    }

    await Job.findByIdAndUpdate(jobId, jobUpdate);

    return res.success(
      {
        jobId,
        isFallback,
        isOverride,
        result: { ...parsed, evaluatedAt: new Date(), isFallback, isOverride },
      },
      "AI match evaluation complete"
    );
  } catch (err) {
    console.error("[aiMatch]", err);
    return res.error("Internal server error", 500);
  }
}

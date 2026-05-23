import "server-only";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import * as res from "@/lib/api-response";
import { getUserId } from "@/lib/get-user";
import { groqClient } from "@/lib/groq";
import {
  INTERVIEW_PREP_MODEL,
  INTERVIEW_PREP_SYSTEM_PROMPT,
  buildInterviewPrepMessage,
} from "@/lib/prompts/interview-prep.prompt";
import { InterviewQuestion, QuestionType } from "@/types/interview";

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_COUNT = 1;
const MAX_COUNT = 20;
const VALID_TYPES: QuestionType[] = ["hr", "technical", "mixed"];

// ─── Request body shape ───────────────────────────────────────────────────────

interface InterviewPrepBody {
  role?: unknown;
  company?: unknown;
  questionType?: unknown;
  count?: unknown;
  jobDescription?: unknown;
}

// ─── POST /api/interview-prep ─────────────────────────────────────────────────

export async function interviewPrepController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    // ── 1. Parse body ─────────────────────────────────────────────────────────
    let body: InterviewPrepBody = {};
    try {
      body = await req.json();
    } catch {
      return res.error("Invalid request body.", 400);
    }

    const { role, company, questionType, count, jobDescription } = body;

    // ── 2. Validate inputs ────────────────────────────────────────────────────

    // role
    if (!role || typeof role !== "string" || !role.trim()) {
      return res.error("Role is required.", 400);
    }
    const cleanRole = role.trim();
    if (cleanRole.length < 2 || cleanRole.length > 100) {
      return res.error("Role must be between 2 and 100 characters.", 400);
    }

    // company
    if (!company || typeof company !== "string" || !company.trim()) {
      return res.error("Company is required.", 400);
    }
    const cleanCompany = company.trim();
    if (cleanCompany.length < 2 || cleanCompany.length > 100) {
      return res.error("Company must be between 2 and 100 characters.", 400);
    }

    // questionType
    if (!questionType || !VALID_TYPES.includes(questionType as QuestionType)) {
      return res.error(
        `Question type must be one of: ${VALID_TYPES.join(", ")}.`,
        400
      );
    }
    const cleanType = questionType as QuestionType;

    // count
    const parsedCount = Number(count);
    if (!Number.isInteger(parsedCount) || parsedCount < MIN_COUNT || parsedCount > MAX_COUNT) {
      return res.error(
        `Question count must be an integer between ${MIN_COUNT} and ${MAX_COUNT}.`,
        400
      );
    }

    // jobDescription (optional but if provided must be a string)
    let cleanJd: string | undefined;
    if (jobDescription !== undefined && jobDescription !== null) {
      if (typeof jobDescription !== "string") {
        return res.error("Job description must be a string.", 400);
      }
      cleanJd = jobDescription.trim() || undefined;
    }

    // ── 3. Call Groq ──────────────────────────────────────────────────────────
    const userMessage = buildInterviewPrepMessage(
      cleanRole,
      cleanCompany,
      cleanType,
      parsedCount,
      cleanJd
    );

    const completion = await groqClient.chat.completions.create({
      model: INTERVIEW_PREP_MODEL,
      messages: [
        { role: "system", content: INTERVIEW_PREP_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7, // slightly higher for question variety
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    // ── 4. Parse and validate response ────────────────────────────────────────
    let parsed: { questions: InterviewQuestion[] };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("[interviewPrep] Failed to parse Groq response:", rawContent);
      return res.error("AI returned an invalid response. Please try again.", 502);
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      console.error("[interviewPrep] Unexpected response shape:", parsed);
      return res.error("AI returned an unexpected format. Please try again.", 502);
    }

    // Validate each question shape
    const validQuestions: InterviewQuestion[] = parsed.questions
      .filter(
        (q) =>
          typeof q.id === "number" &&
          typeof q.question === "string" &&
          ["HR", "Technical"].includes(q.type) &&
          ["Easy", "Medium", "Hard"].includes(q.difficulty) &&
          typeof q.hint === "string"
      )
      .slice(0, MAX_COUNT); // hard cap — never return more than 20

    if (validQuestions.length === 0) {
      return res.error("AI returned malformed questions. Please try again.", 502);
    }

    return res.success(
      {
        role: cleanRole,
        company: cleanCompany,
        questionType: cleanType,
        count: validQuestions.length,
        questions: validQuestions,
        generatedAt: new Date().toISOString(),
      },
      "Interview questions generated successfully"
    );
  } catch (err) {
    console.error("[interviewPrep]", err);
    return res.error("Internal server error", 500);
  }
}

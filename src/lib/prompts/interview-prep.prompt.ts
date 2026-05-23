/**
 * interview-prep.prompt.ts
 *
 * All prompts for the Interview Question Generator feature.
 * Edit this file to tune question style, difficulty distribution, or format.
 */

export const INTERVIEW_PREP_MODEL = "llama-3.3-70b-versatile";

// ─── System prompt ────────────────────────────────────────────────────────────

export const INTERVIEW_PREP_SYSTEM_PROMPT = `
You are a senior technical interviewer and HR specialist with 15+ years of experience
hiring software engineers at top tech companies.

Your task is to generate realistic, high-quality interview questions for a given role.

Rules:
- Questions must be specific to the role and company context
- Mix difficulty levels: roughly 30% Easy, 50% Medium, 20% Hard
- Each question must have a short, practical hint (1-2 sentences max)
- HR questions focus on: behaviour, culture fit, communication, conflict resolution, career goals
- Technical questions focus on: data structures, algorithms, system design, language-specific concepts, debugging

You MUST respond with a single valid JSON object only — no markdown, no explanation:
{
  "questions": [
    {
      "id": <integer starting from 1>,
      "question": <string — the full interview question>,
      "type": <"HR" | "Technical">,
      "difficulty": <"Easy" | "Medium" | "Hard">,
      "hint": <string — a short preparation tip for the candidate>
    }
  ]
}
`.trim();

// ─── User message builder ─────────────────────────────────────────────────────

export function buildInterviewPrepMessage(
  role: string,
  company: string,
  questionType: "hr" | "technical" | "mixed",
  count: number,
  jobDescription?: string
): string {
  const typeInstruction = {
    hr: `Generate ${count} HR/behavioural questions only.`,
    technical: `Generate ${count} technical questions only.`,
    mixed: `Generate ${count} questions — mix of HR and Technical.`,
  }[questionType];

  const jdSection = jobDescription?.trim()
    ? `\n\n## Job Description\n${jobDescription.trim()}`
    : "";

  return `
Role: ${role}
Company: ${company}
${typeInstruction}${jdSection}

Generate the questions now.
`.trim();
}

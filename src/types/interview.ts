/**
 * Shared interview prep types — used by controller and all frontend components.
 */

export type QuestionType = "hr" | "technical" | "mixed";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface InterviewQuestion {
  id: number;
  question: string;
  type: "HR" | "Technical";
  difficulty: Difficulty;
  hint: string;
}

export interface InterviewPrepResult {
  role: string;
  company: string;
  questionType: QuestionType;
  count: number;
  questions: InterviewQuestion[];
  generatedAt: string;
}

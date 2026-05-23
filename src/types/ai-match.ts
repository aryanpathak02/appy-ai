/**
 * Shared AI match result type — used by the controller and all frontend components.
 */
export interface AiMatchResult {
  score: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
  interviewReadiness: "Low" | "Medium" | "High";
  /** True when result was generated using a pseudo-JD (role + company only) */
  isFallback?: boolean;
  /** True when result was generated using a user-pasted description override */
  isOverride?: boolean;
}

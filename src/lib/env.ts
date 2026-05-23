import "server-only";

/**
 * env.ts — Single source of truth for all environment variables.
 * Validates presence at startup. Import from here, never directly from process.env.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // Database
  MONGODB_URI: requireEnv("MONGODB_URI"),

  // App
  NODE_ENV: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "test",

  // JWT
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  // Supabase
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),

  // Groq
  GROQ_API_KEY: requireEnv("GROQ_API_KEY"),
} as const;
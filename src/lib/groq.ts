import "server-only";
import Groq from "groq-sdk";
import { env } from "@/lib/env";

/**
 * groq.ts — Singleton Groq client.
 * Import `groqClient` anywhere on the server side.
 */
export const groqClient = new Groq({ apiKey: env.GROQ_API_KEY });

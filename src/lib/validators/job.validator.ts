import { z } from "zod";

export const createJobSchema = z.object({
  company: z.string().min(1, "Company is required").trim(),
  role: z.string().min(1, "Role is required").trim(),
  description: z.string().trim().optional(),
  jobUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z
    .enum(["saved", "applied", "interview", "rejected", "offer"])
    .default("saved"),
  jobType: z.enum(["remote", "onsite", "hybrid"]).optional(),
  location: z.string().trim().optional(),
  salary: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  appliedDate: z.string().datetime().optional(),
  interviewDate: z.string().datetime().optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const jobQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z
    .enum(["saved", "applied", "interview", "rejected", "offer"])
    .optional(),
  jobType: z.enum(["remote", "onsite", "hybrid"]).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;

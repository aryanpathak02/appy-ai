import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  email: z.string().email("Invalid email address").toLowerCase().trim().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .optional(),
})
  // If newPassword is provided, currentPassword must also be provided
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    }
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

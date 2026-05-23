import "server-only";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { getUserId } from "@/lib/get-user";
import { updateProfileSchema } from "@/lib/validators/profile.validator";
import User from "@/models/user.model";
import * as res from "@/lib/api-response";

// ─── GET /api/user/profile ────────────────────────────────────────────────────

export async function getProfileController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const user = await User.findById(userId)
      .select("name email createdAt")
      .lean();

    if (!user) return res.error("User not found", 404);

    return res.success(
      {
        name: user.name ?? null,
        email: user.email,
        createdAt: user.createdAt,
      },
      "Profile fetched successfully"
    );
  } catch (err) {
    console.error("[getProfile]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── PUT /api/user/profile ────────────────────────────────────────────────────

export async function updateProfileController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const body = await req.json();

    // 1. Validate input
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return res.error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const { name, email, currentPassword, newPassword } = parsed.data;

    // 2. Fetch the current user (include password for verification)
    const user = await User.findById(userId).select("+password");
    if (!user) return res.error("User not found", 404);

    // 3. If email is being changed, check it isn't already taken
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: userId } }).lean();
      if (emailTaken) return res.error("Email is already in use by another account", 409);
    }

    // 4. If a password change is requested, verify the current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.error("Current password is required to set a new password", 400);
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.error("Current password is incorrect", 400);
      }
    }

    // 5. Build the update payload — only include fields that were provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {};

    if (name !== undefined) updatePayload.name = name;
    if (email !== undefined) updatePayload.email = email;
    if (newPassword) {
      updatePayload.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.error("No fields to update", 400);
    }

    // 6. Persist the changes
    const updated = await User.findByIdAndUpdate(
      userId,
      updatePayload,
      { new: true, runValidators: true }
    )
      .select("name email createdAt")
      .lean();

    if (!updated) return res.error("User not found", 404);

    return res.success(
      {
        name: updated.name ?? null,
        email: updated.email,
        createdAt: updated.createdAt,
      },
      "Profile updated successfully"
    );
  } catch (err) {
    console.error("[updateProfile]", err);
    return res.error("Internal server error", 500);
  }
}

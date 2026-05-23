import "server-only";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import { loginSchema, registerSchema } from "@/lib/validators/auth.validator";
import User from "@/models/user.model";
import { dbService } from "@/services/db.service";
import * as res from "@/lib/api-response";

// ─── Helpers ────────────────────────────────────────────────────────────────

function signToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

function setTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerController(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // 1. Validate input with Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return res.error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const { name, email, password } = parsed.data;

    // 2. Check if user already exists
    const existing = await dbService.findOne(User, { email });
    if (existing) {
      return res.error("Email already registered", 409);
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    const user = await dbService.create(User, { name, email, password: hashedPassword });

    // 5. Sign JWT and set cookie
    const token = signToken(user._id.toString());
    const response = res.success(
      { id: user._id, name: user.name, email: user.email },
      "Account created successfully",
      201
    );
    setTokenCookie(response, token);

    return response;
  } catch (err) {
    console.error("[register]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginController(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // 1. Validate input with Zod
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return res.error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    // 2. Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.error("Invalid email or password", 401);
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.error("Invalid email or password", 401);
    }

    // 4. Sign JWT and set cookie
    const token = signToken(user._id.toString());
    const response = res.success(
      { id: user._id, name: user.name, email: user.email },
      "Logged in successfully"
    );
    setTokenCookie(response, token);

    return response;
  } catch (err) {
    console.error("[login]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logoutController() {
  try {
    const response = res.success(null, "Logged out successfully");

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[logout]", err);
    return res.error("Internal server error", 500);
  }
}

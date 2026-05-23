import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  // ── Resume ──────────────────────────────────────────────────────────────────
  resume?: string;        // Cloudinary URL of the uploaded PDF
  resumeText?: string;    // Plain text extracted from the PDF (used by AI matching)
  resumeParsedAt?: Date;  // Timestamp of the last successful parse
  // ────────────────────────────────────────────────────────────────────────────
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    resume: {
      type: String, // Cloudinary URL
      trim: true,
    },
    resumeText: {
      type: String, // Extracted plain text — used for AI job matching
    },
    resumeParsedAt: {
      type: Date,   // When the text was last extracted
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model re-compilation during Next.js hot reloads
const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;

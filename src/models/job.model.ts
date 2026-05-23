import mongoose, { Document, Model, Schema } from "mongoose";

// ─── Interview sub-document ───────────────────────────────────────────────────

export interface IInterview {
  round?: "hr" | "technical" | "final" | "manager";
  date?: Date;
  result?: "pending" | "passed" | "failed";
  feedback?: string;
}

// ─── Job document ─────────────────────────────────────────────────────────────

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  description?: string;
  jobUrl?: string;
  status: "saved" | "applied" | "interview" | "rejected" | "offer";
  jobType?: "remote" | "onsite" | "hybrid";
  location?: string;
  salary?: string;
  notes?: string;
  aiSummary?: string;
  aiMatchScore?: number;
  aiMatchResult?: {
    score: number;
    summary: string;
    matchedSkills: string[];
    missingSkills: string[];
    recommendation: string;
    interviewReadiness: "Low" | "Medium" | "High";
    evaluatedAt: Date;
  };
  interviews: IInterview[];
  appliedDate?: Date;
  interviewDate?: Date;
  deletedAt?: Date | null; // soft delete
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const JobSchema = new Schema<IJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    jobUrl: String,
    status: {
      type: String,
      enum: ["saved", "applied", "interview", "rejected", "offer"],
      default: "saved",
    },
    jobType: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
    },
    location: String,
    salary: String,
    notes: String,
    aiSummary: String,
    aiMatchScore: Number,
    aiMatchResult: {
      type: new mongoose.Schema({
        score: Number,
        summary: String,
        matchedSkills: [String],
        missingSkills: [String],
        recommendation: String,
        interviewReadiness: {
          type: String,
          enum: ["Low", "Medium", "High"],
        },
        isFallback: Boolean,
        isOverride: Boolean,
        evaluatedAt: Date,
      }, { _id: false }),
      default: undefined, // prevents Mongoose returning {} for new docs
    },
    interviews: [
      {
        round: {
          type: String,
          enum: ["hr", "technical", "final", "manager"],
        },
        date: Date,
        result: {
          type: String,
          enum: ["pending", "passed", "failed"],
          default: "pending",
        },
        feedback: String,
      },
    ],
    appliedDate: Date,
    interviewDate: Date,
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Model ────────────────────────────────────────────────────────────────────

// Prevent model re-compilation during Next.js hot reloads
const Job: Model<IJob> =
  mongoose.models.Job ?? mongoose.model<IJob>("Job", JobSchema);

export default Job;

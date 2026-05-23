import "server-only";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import * as res from "@/lib/api-response";
import { getUserId } from "@/lib/get-user";
import {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema,
} from "@/lib/validators/job.validator";
import Job from "@/models/job.model";

// ─── Create Job ───────────────────────────────────────────────────────────────

export async function createJobController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const body = await req.json();
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return res.error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const job = await Job.create({ ...parsed.data, userId });

    return res.success(job, "Job created successfully", 201);
  } catch (err) {
    console.error("[createJob]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── Get All Jobs (paginated + search + filter) ───────────────────────────────

export async function getJobsController(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    // Parse query params
    // searchParams.get() returns null for missing params — convert to undefined
    // so Zod's .optional() fields pass validation correctly.
    const { searchParams } = new URL(req.url);
    const parsed = jobQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      jobType: searchParams.get("jobType") ?? undefined,
    });

    if (!parsed.success) {
      return res.error("Invalid query params", 400, parsed.error.flatten().fieldErrors);
    }

    const { page, limit, search, status, jobType } = parsed.data;
    const skip = (page - 1) * limit;

    // Build filter — always scope to current user and exclude soft-deleted
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      userId,
      deletedAt: null,
    };

    if (status) filter.status = status;
    if (jobType) filter.jobType = jobType;

    // Search across company, role, location
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    return res.success(
      {
        jobs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
      "Jobs fetched successfully"
    );
  } catch (err) {
    console.error("[getJobs]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── Get Job By ID ────────────────────────────────────────────────────────────

export async function getJobByIdController(req: NextRequest, id: string) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const job = await Job.findOne({ _id: id, userId, deletedAt: null }).lean();
    if (!job) return res.error("Job not found", 404);

    return res.success(job, "Job fetched successfully");
  } catch (err) {
    console.error("[getJobById]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── Update Job ───────────────────────────────────────────────────────────────

export async function updateJobController(req: NextRequest, id: string) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const body = await req.json();
    const parsed = updateJobSchema.safeParse(body);
    if (!parsed.success) {
      return res.error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!job) return res.error("Job not found", 404);

    return res.success(job, "Job updated successfully");
  } catch (err) {
    console.error("[updateJob]", err);
    return res.error("Internal server error", 500);
  }
}

// ─── Soft Delete Job ──────────────────────────────────────────────────────────

export async function deleteJobController(req: NextRequest, id: string) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) return res.error("Unauthorized", 401);

    const job = await Job.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    ).lean();

    if (!job) return res.error("Job not found", 404);

    return res.success(null, "Job deleted successfully");
  } catch (err) {
    console.error("[deleteJob]", err);
    return res.error("Internal server error", 500);
  }
}

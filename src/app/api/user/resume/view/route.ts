import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserId } from "@/lib/get-user";
import User from "@/models/user.model";
import { readRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/user/resume/view
 *
 * Proxies the user's resume PDF from Supabase Storage through our server.
 * This guarantees the browser receives the correct Content-Type and
 * Content-Disposition headers for inline rendering.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const limited = readRateLimit(req, userId);
    if (limited) return limited;

    const user = await User.findById(userId).select("resume").lean();
    if (!user?.resume) {
      return new NextResponse("No resume found", { status: 404 });
    }

    // Fetch the PDF from Supabase Storage on the server side
    const storageRes = await fetch(user.resume);
    if (!storageRes.ok) {
      return new NextResponse("Failed to fetch resume from storage", { status: 502 });
    }

    const pdfBuffer = await storageRes.arrayBuffer();

    // Stream it back to the browser with headers that force inline rendering
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // "inline" tells the browser to display it, not download it
        "Content-Disposition": "inline; filename=\"resume.pdf\"",
        "Content-Length": String(pdfBuffer.byteLength),
        // Cache for 5 minutes — avoids re-fetching on every page visit
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[resumeView]", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

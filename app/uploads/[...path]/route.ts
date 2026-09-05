import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const relativePath = pathSegments.join("/");
    // Prevent directory traversal attacks
    if (relativePath.includes("..")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const candidatePaths = [
      path.join(process.cwd(), "public", "uploads", ...pathSegments),
      path.join(process.cwd(), ".next", "standalone", "public", "uploads", ...pathSegments),
    ];

    let fileBuffer: Buffer | null = null;
    let foundPath = "";

    for (const p of candidatePaths) {
      try {
        fileBuffer = await fs.readFile(p);
        foundPath = p;
        break;
      } catch {}
    }

    if (!fileBuffer) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(foundPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

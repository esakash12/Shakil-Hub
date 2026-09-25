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

    const hasInvalidSegment = pathSegments.some(
      (s) =>
        s.includes("..") ||
        s.includes("/") ||
        s.includes("\\") ||
        s.includes("\0") ||
        !/^[a-zA-Z0-9_.-]+$/.test(s)
    );
    if (hasInvalidSegment) {
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

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    // Prevent Stored XSS via SVG by applying strict sandbox CSP
    if (ext === ".svg") {
      headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'";
      headers["Content-Disposition"] = 'inline; filename="asset.svg"';
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

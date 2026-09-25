import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { verifyAdminToken } from "@/lib/actions/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const adminToken = req.cookies.get("sakil_admin_token")?.value;
    if (!adminToken || !(await verifyAdminToken(adminToken))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required to upload media." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    // 1. Strict File Size Validation (Max 10MB)
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB size limit." },
        { status: 400 }
      );
    }

    // 2. Strict MIME and Extension Whitelist (Block SVG, HTML, scripts to prevent XSS)
    const ALLOWED_MIME_TYPES = new Map<string, string>([
      ["image/jpeg", ".jpg"],
      ["image/png", ".png"],
      ["image/webp", ".webp"],
      ["image/gif", ".gif"],
    ]);

    const ext = path.extname(file.name || "").toLowerCase();
    const normalizedExt = ext === ".jpeg" ? ".jpg" : ext;
    const expectedExt = ALLOWED_MIME_TYPES.get(file.type);

    if (!expectedExt || (normalizedExt && normalizedExt !== expectedExt && ext !== ".jpeg")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only standard raster images (JPG, PNG, WebP, GIF) are allowed.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Magic Byte Verification (Verify actual binary header)
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
    const isWebp =
      buffer.length > 12 &&
      buffer.toString("utf8", 0, 4) === "RIFF" &&
      buffer.toString("utf8", 8, 12) === "WEBP";

    if (!isJpeg && !isPng && !isGif && !isWebp) {
      return NextResponse.json(
        { success: false, error: "File content does not match a valid image format." },
        { status: 400 }
      );
    }

    const sanitizedBase = path
      .basename(file.name || "image", ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const finalExt = expectedExt || ".jpg";
    const filename = `${Date.now()}-${sanitizedBase || "image"}${finalExt}`;

    // 1. Try uploading directly to Cloudflare R2 from server (bypasses browser CORS)
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.R2_ENDPOINT;
    const bucketName = process.env.R2_BUCKET_NAME || "lms-videos";

    if (accessKey && secretKey && endpoint) {
      try {
        const s3 = new S3Client({
          region: "auto",
          endpoint,
          credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        });

        const r2Key = `thumbnails/${filename}`;
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: r2Key,
            Body: buffer,
            ContentType: file.type || "image/jpeg",
          })
        );

        return NextResponse.json({
          success: true,
          url: `/api/r2/${r2Key}`,
          r2Key,
        });
      } catch (r2Err: any) {
        console.warn("R2 upload fallback to local storage:", r2Err.message);
      }
    }

    // 2. Resilient Local Storage Fallback: Save in public/uploads/thumbnails
    const localTargets = [
      path.join(process.cwd(), "public", "uploads", "thumbnails", filename),
      path.join(process.cwd(), ".next", "standalone", "public", "uploads", "thumbnails", filename),
    ];

    for (const target of localTargets) {
      try {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, buffer);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      url: `/uploads/thumbnails/${filename}`,
    });
  } catch (err: any) {
    console.error("UPLOAD IMAGE API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Image upload failed." },
      { status: 500 }
    );
  }
}

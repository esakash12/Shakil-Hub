import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || "image.jpg";
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${sanitizedName}`;

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

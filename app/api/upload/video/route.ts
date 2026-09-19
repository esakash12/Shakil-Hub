import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No video file provided." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || "video.mp4";
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${sanitizedName}`;

    // 1. Try uploading to Cloudflare R2 if credentials exist
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

        const objectKey = `portfolio/${filename}`;
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            Body: buffer,
            ContentType: file.type || "video/mp4",
          })
        );

        const publicUrl = `/api/r2/${objectKey}`;

        return NextResponse.json({
          success: true,
          objectKey,
          fileKey: objectKey,
          publicUrl,
          url: publicUrl,
        });
      } catch (r2Err: any) {
        console.warn("Cloudflare R2 video upload failed, falling back to local storage:", r2Err.message);
      }
    }

    // 2. Resilient Local Disk Storage Fallback: Save in public/uploads/videos
    const localTargets = [
      path.join(process.cwd(), "public", "uploads", "videos", filename),
      path.join(process.cwd(), ".next", "standalone", "public", "uploads", "videos", filename),
    ];

    for (const target of localTargets) {
      try {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, buffer);
      } catch (err: any) {
        console.warn("Failed to write video to target:", target, err.message);
      }
    }

    const localUrl = `/uploads/videos/${filename}`;

    return NextResponse.json({
      success: true,
      objectKey: filename,
      fileKey: filename,
      publicUrl: localUrl,
      url: localUrl,
    });
  } catch (err: any) {
    console.error("SERVER VIDEO UPLOAD ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Video upload failed." },
      { status: 500 }
    );
  }
}

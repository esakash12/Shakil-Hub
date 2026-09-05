import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.R2_ENDPOINT;
    const bucketName = process.env.R2_BUCKET_NAME || "lms-videos";

    const originalName = file.name || "video.mp4";
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const objectKey = `lessons/${Date.now()}-${sanitizedName}`;

    if (!accessKey || !secretKey || !endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudflare R2 credentials are not configured on the server.",
        },
        { status: 500 }
      );
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
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
  } catch (err: any) {
    console.error("SERVER VIDEO UPLOAD ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Video upload failed." },
      { status: 500 }
    );
  }
}

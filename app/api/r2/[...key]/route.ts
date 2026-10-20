import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const resolvedParams = await params;
  const keySegments = resolvedParams?.key || [];
  const objectKey = keySegments.join("/");

  if (!objectKey) {
    return new NextResponse("Object key is required", { status: 400 });
  }

  const bucketName = process.env.R2_BUCKET_NAME || "lms-videos";
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;

  if (!accessKey || !secretKey || !endpoint) {
    return new NextResponse("Cloudflare R2 is not configured", { status: 500 });
  }

  try {
    const s3Client = getR2Client();

    const rangeHeader = request.headers.get("range");

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Range: rangeHeader || undefined,
    });

    const s3Response = await s3Client.send(command);

    if (!s3Response.Body) {
      return new NextResponse("File body is empty", { status: 404 });
    }

    const isThumbnail = objectKey.startsWith("thumbnails/") || /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(objectKey);

    const headers = new Headers();
    if (s3Response.ContentType) {
      headers.set("Content-Type", s3Response.ContentType);
    }
    if (s3Response.ContentLength !== undefined) {
      headers.set("Content-Length", s3Response.ContentLength.toString());
    }
    headers.set("Accept-Ranges", "bytes");

    if (rangeHeader && s3Response.ContentRange) {
      headers.set("Content-Range", s3Response.ContentRange);
    }

    headers.set(
      "Cache-Control",
      isThumbnail
        ? "public, max-age=31536000, immutable"
        : "public, max-age=86400, s-maxage=86400"
    );

    const stream = s3Response.Body as ReadableStream;
    const status = rangeHeader && s3Response.ContentRange ? 206 : 200;

    return new NextResponse(stream as any, {
      status,
      headers,
    });
  } catch (err: any) {
    console.error(`R2 Media streaming proxy error for key "${objectKey}":`, err.message || err);
    return new NextResponse("Failed to resolve media from Cloudflare R2", {
      status: 404,
    });
  }
}

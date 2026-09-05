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

function getContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
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
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return new NextResponse("Object not found in bucket", { status: 404 });
    }

    const contentType =
      response.ContentType || getContentType(objectKey);

    // Convert AWS SDK stream to Web ReadableStream
    const nodeStream = response.Body as Readable;
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": response.ContentLength?.toString() || "",
        "ETag": response.ETag || "",
      },
    });
  } catch (err: any) {
    console.error(`R2 Media Proxy error for key "${objectKey}":`, err.message || err);
    return new NextResponse("Failed to fetch media from Cloudflare R2", {
      status: 404,
    });
  }
}

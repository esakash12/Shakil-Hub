import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

    // Generate high-speed Cloudflare R2 presigned streaming URL
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 86400, // 24 hours
    });

    // 307 Temporary Redirect: Directly stream from Cloudflare R2's global edge network.
    // This eliminates 100% of video buffering and frees the Node.js server from heavy proxying!
    return NextResponse.redirect(presignedUrl, {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err: any) {
    console.error(`R2 Media streaming redirect error for key "${objectKey}":`, err.message || err);
    return new NextResponse("Failed to resolve media from Cloudflare R2", {
      status: 404,
    });
  }
}

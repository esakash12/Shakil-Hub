"use server";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface PresignedUploadResponse {
  success: boolean;
  uploadUrl?: string;
  objectKey?: string;
  fileKey?: string;
  publicUrl?: string;
  error?: string;
}

interface PresignedViewResponse {
  success: boolean;
  viewUrl?: string;
  error?: string;
}

/**
 * Initializes S3 client connected to Cloudflare R2 Object Storage
 */
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

/**
 * Generates an S3-compatible pre-signed PUT URL for direct browser-to-R2 upload.
 * Strictly generates and synchronizes the unique object key with the PUT command.
 */
export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string = "video/mp4"
): Promise<PresignedUploadResponse> {
  const bucketName = process.env.R2_BUCKET_NAME || "lms-videos";
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;

  if (!fileName?.trim()) {
    return {
      success: false,
      error: "Filename is required.",
    };
  }

  // Strict sanitized unique object key
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const objectKey = `lessons/${Date.now()}-${sanitizedName}`;

  // 1. If R2 credentials are configured
  if (accessKey && secretKey && endpoint) {
    try {
      const s3Client = getR2Client();

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: fileType || "video/mp4",
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour upload window
      });

      return {
        success: true,
        uploadUrl,
        objectKey,
        fileKey: objectKey,
        publicUrl: `${endpoint.replace(/\/$/, "")}/${bucketName}/${objectKey}`,
      };
    } catch (err: any) {
      console.error("Cloudflare R2 Presign Error:", err.message || err);
      return {
        success: false,
        error: err.message || "Failed to generate pre-signed upload URL.",
      };
    }
  }

  // 2. Fallback simulation for local dev without R2 credentials
  return {
    success: true,
    uploadUrl: "SIMULATED_R2_UPLOAD",
    objectKey,
    fileKey: objectKey,
    publicUrl: `https://r2.sakilhub.com/${objectKey}`,
  };
}

/**
 * Generates an S3-compatible pre-signed GET URL for secure 1-hour video streaming.
 * Raw bucket credentials and permanent video links remain strictly hidden from clients.
 */
export async function getPresignedViewUrl(
  fileKey: string
): Promise<PresignedViewResponse> {
  if (!fileKey || !fileKey.trim()) {
    return {
      success: false,
      error: "No video file key was attached to this lesson.",
    };
  }

  let cleanKey = fileKey.trim();

  // 1. If it's a YouTube or Vimeo link, pass through directly
  if (
    cleanKey.includes("youtube.com") ||
    cleanKey.includes("youtu.be") ||
    cleanKey.includes("vimeo.com")
  ) {
    return {
      success: true,
      viewUrl: cleanKey,
    };
  }

  const bucketName = process.env.R2_BUCKET_NAME || "lms-videos";

  // 2. If it's a full R2 storage URL, extract the relative object key
  if (cleanKey.includes(`/${bucketName}/`)) {
    cleanKey = cleanKey.split(`/${bucketName}/`)[1];
  } else if (cleanKey.startsWith("http://") || cleanKey.startsWith("https://")) {
    // If it's a direct external mp4 link (e.g. storage.googleapis.com)
    return {
      success: true,
      viewUrl: cleanKey,
    };
  }

  // Strictly URL-decode and strip leading slashes
  try {
    cleanKey = decodeURIComponent(cleanKey);
  } catch {}
  cleanKey = cleanKey.replace(/^\/+/, "");

  // Prevent double-prefixing: ensure key starts with "lessons/" without duplicating
  while (cleanKey.startsWith("lessons/lessons/")) {
    cleanKey = cleanKey.replace(/^lessons\//, "");
  }
  const finalKey = cleanKey.startsWith("lessons/") ? cleanKey : `lessons/${cleanKey}`;

  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;

  if (accessKey && secretKey && endpoint) {
    try {
      const s3Client = getR2Client();
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: finalKey,
      });

      const viewUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour secure streaming token
      });

      return {
        success: true,
        viewUrl,
      };
    } catch (err: any) {
      console.error("Cloudflare R2 Presign GET Error:", err.message || err);
      return {
        success: false,
        error: `Failed to load video stream: ${err.message || "Invalid object key or S3 error"}`,
      };
    }
  }

  // 3. Fallback error when R2 credentials are not configured
  return {
    success: false,
    error: "Video streaming service is temporarily unavailable. Cloudflare R2 credentials are not configured.",
  };
}

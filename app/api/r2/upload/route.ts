import { NextRequest } from "next/server";
import { POST as imageUploadHandler } from "@/app/api/upload/image/route";

export async function POST(req: NextRequest) {
  return imageUploadHandler(req);
}

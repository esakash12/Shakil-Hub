import { NextRequest, NextResponse } from "next/server";
import { submitContactAction } from "@/lib/actions/contact";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await submitContactAction(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to submit inquiry." },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/contact error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

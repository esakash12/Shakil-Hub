import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithTokenOrOtpAction } from "@/lib/actions/password-reset";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, token, newPassword } = body;
    const otpOrToken = otp || token;

    if (!email || !otpOrToken || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, verification code (or token), and new password are required.",
        },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithTokenOrOtpAction(
      email,
      otpOrToken,
      newPassword
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/auth/reset-password error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

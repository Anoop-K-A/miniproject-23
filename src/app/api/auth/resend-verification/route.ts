import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { normalizeRoleInput } from "@/lib/adminConfig";
import { EmailServiceError, sendVerificationEmail } from "@/lib/emailService";
import { storeVerificationToken } from "@/lib/verificationTokenStore";
import { findUserByUsername } from "@/lib/userStore";

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Username or email is required" },
        { status: 400 },
      );
    }

    const user = await findUserByUsername(identifier);

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "No account found with this username or email" },
        { status: 404 },
      );
    }

    const normalizedRole = normalizeRoleInput(user.role);
    if (normalizedRole !== "faculty") {
      return NextResponse.json(
        { error: "Email verification is available only for faculty accounts" },
        { status: 400 },
      );
    }

    if (user.emailVerified === true) {
      return NextResponse.json(
        { error: "Email is already verified. You can sign in now." },
        { status: 400 },
      );
    }

    if (!user.firebaseUid) {
      return NextResponse.json(
        {
          error:
            "Unable to resend verification for this account. Please contact admin.",
        },
        { status: 400 },
      );
    }

    const token = randomBytes(32).toString("hex");
    storeVerificationToken(token, {
      email: user.email,
      firebaseUid: user.firebaseUid,
      createdAt: Date.now(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    try {
      await sendVerificationEmail(
        user.email,
        user.name || user.username,
        verificationLink,
      );
    } catch (emailError) {
      if (
        emailError instanceof EmailServiceError &&
        emailError.code === "EMAIL_SERVICE_NOT_CONFIGURED"
      ) {
        return NextResponse.json(
          {
            error:
              "Email service is not configured. Ask admin to set GMAIL_USER and GMAIL_PASSWORD.",
            code: "EMAIL_SERVICE_NOT_CONFIGURED",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to send verification email. Please try again.",
          code: "EMAIL_DELIVERY_FAILED",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Verification email sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

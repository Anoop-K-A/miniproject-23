import { NextRequest, NextResponse } from "next/server";
import { EmailServiceError, sendVerificationEmail } from "@/lib/emailService";
import { storeVerificationToken } from "@/lib/verificationTokenStore";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, firebaseUid } = await request.json();

    if (!email || !fullName || !firebaseUid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate verification token
    const token = randomBytes(32).toString("hex");

    // Store verification token temporarily (24 hours)
    storeVerificationToken(token, {
      email,
      firebaseUid,
      createdAt: Date.now(),
    });

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    try {
      await sendVerificationEmail(email, fullName, verificationLink);
      return NextResponse.json({
        message: "Verification email sent successfully",
        success: true,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);

      if (
        emailError instanceof EmailServiceError &&
        emailError.code === "EMAIL_SERVICE_NOT_CONFIGURED"
      ) {
        return NextResponse.json(
          {
            error:
              "Email service is not configured. Set GMAIL_USER and GMAIL_PASSWORD in environment variables.",
            code: "EMAIL_SERVICE_NOT_CONFIGURED",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error:
            "Failed to send verification email. Please try again or contact admin.",
          code: "EMAIL_DELIVERY_FAILED",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Add this for testing/debugging - to be removed later
export async function GET() {
  return NextResponse.json({
    message: "Use POST to send verification email",
  });
}

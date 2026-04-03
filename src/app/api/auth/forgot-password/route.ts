import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/userStore";

const GENERIC_SUCCESS_MESSAGE =
  "If your account exists, a password reset email has been sent.";

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Username or email is required" },
        { status: 400 },
      );
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();
    let email = normalizedIdentifier.includes("@") ? normalizedIdentifier : "";

    if (!email) {
      const user = await findUserByUsername(normalizedIdentifier);
      if (!user) {
        return NextResponse.json(
          {
            error:
              "No account found with that username. Try your registered email.",
          },
          { status: 404 },
        );
      }

      email = String(user.email || "")
        .trim()
        .toLowerCase();
    }

    if (!email) {
      return NextResponse.json(
        { error: "No email found for this account. Contact admin." },
        { status: 400 },
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Password reset service is not configured. Missing Firebase API key.",
          code: "PASSWORD_RESET_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email,
        }),
      },
    );

    if (!response.ok) {
      let errorCode = "UNKNOWN_ERROR";
      try {
        const firebaseError = (await response.json()) as {
          error?: { message?: string };
        };
        errorCode = String(firebaseError.error?.message || "UNKNOWN_ERROR");
      } catch {
        // Ignore parse errors.
      }

      if (
        errorCode === "EMAIL_NOT_FOUND" ||
        errorCode === "INVALID_EMAIL" ||
        errorCode === "USER_NOT_FOUND"
      ) {
        return NextResponse.json(
          { error: "No Firebase account found for this email." },
          { status: 404 },
        );
      }

      console.error("Forgot password Firebase error:", errorCode);
      return NextResponse.json(
        {
          error:
            "Unable to send reset email right now. Please try again later.",
          code: "PASSWORD_RESET_DELIVERY_FAILED",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: GENERIC_SUCCESS_MESSAGE,
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { updateUserVerification } from "@/lib/userStore";
import {
  getVerificationToken,
  deleteVerificationToken,
  isTokenExpired,
} from "@/lib/verificationTokenStore";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 },
      );
    }

    // Check if token exists
    const tokenData = getVerificationToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      deleteVerificationToken(token);
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Update user's email verification status
    try {
      await updateUserVerification(tokenData.firebaseUid, true);
      deleteVerificationToken(token);

      return NextResponse.json({
        message: "Email verified successfully!",
        success: true,
      });
    } catch (error) {
      console.error("Failed to update user verification:", error);
      return NextResponse.json(
        { error: "Failed to verify email" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export function GET(request: NextRequest) {
  // GET endpoint for page redirect
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required" },
      { status: 400 },
    );
  }

  // Return HTML page that will call POST endpoint
  const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Verifying Email...</title>
    <style>
      body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; }
      .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Verifying Your Email...</h1>
      <div class="spinner"></div>
      <p>Please wait while we verify your email address.</p>
    </div>
    <script>
      async function verifyEmail() {
        try {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: '${token}' })
          });
          const data = await response.json();
          
          if (response.ok) {
            document.body.innerHTML = '<div class="container" style="text-align: center; color: green;"><h1>✓ Email Verified Successfully!</h1><p>Your email has been verified. Your profile will now be visible to the admin for approval.</p><p>You will receive an email notification once the admin approves or rejects your account.</p><a href="/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Go to Login</a></div>';
          } else {
            throw new Error(data.error || 'Verification failed');
          }
        } catch (error) {
          document.body.innerHTML = '<div class="container" style="text-align: center; color: red;"><h1>✗ Verification Failed</h1><p>' + error.message + '</p><p>The token may be expired or invalid. Please register again if needed.</p><a href="/register" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Go to Register</a></div>';
        }
      }
      verifyEmail();
    </script>
  </body>
</html>`;

  return new NextResponse(htmlContent, {
    headers: { "Content-Type": "text/html" },
  });
}

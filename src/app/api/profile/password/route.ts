import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { findUserById, updateUserById } from "@/lib/userStore";
import { PRIMARY_ADMIN_PASSWORD } from "@/lib/adminConfig";

const MIN_PASSWORD_LENGTH = 6;

type FirebaseErrorPayload = {
  error?: {
    message?: string;
  };
};

function hasAdminRole(user: { role?: string; roles?: string[] }) {
  return user.role === "admin" || user.roles?.includes("admin") === true;
}

async function verifyCurrentPasswordWithFirebase(
  email: string,
  currentPassword: string,
) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: currentPassword,
          returnSecureToken: true,
        }),
        signal: AbortSignal.timeout(7000),
      },
    );

    if (!response.ok) {
      const payload = (await response
        .json()
        .catch(() => ({}))) as FirebaseErrorPayload;
      const code = payload.error?.message;

      if (
        code === "INVALID_PASSWORD" ||
        code === "INVALID_LOGIN_CREDENTIALS" ||
        code === "EMAIL_NOT_FOUND"
      ) {
        return false;
      }

      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const userId = String(body.userId || "").trim();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new passwords are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 },
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 },
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!hasAdminRole(user)) {
      return NextResponse.json(
        { error: "Only admin can change password here" },
        { status: 403 },
      );
    }

    const hasStoredPassword =
      typeof user.password === "string" && user.password.length > 0;
    const matchesStoredPassword =
      hasStoredPassword && user.password === currentPassword;
    const matchesBootstrapPassword =
      !hasStoredPassword && currentPassword === PRIMARY_ADMIN_PASSWORD;
    let matchesFirebasePassword = false;

    if (!matchesStoredPassword && !matchesBootstrapPassword && user.email) {
      matchesFirebasePassword = await verifyCurrentPasswordWithFirebase(
        user.email,
        currentPassword,
      );
    }

    if (
      !matchesStoredPassword &&
      !matchesBootstrapPassword &&
      !matchesFirebasePassword
    ) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    if (user.firebaseUid) {
      try {
        await adminAuth.updateUser(user.firebaseUid, { password: newPassword });
      } catch (firebaseError) {
        console.error(
          "Failed to sync Firebase password update:",
          firebaseError,
        );
        return NextResponse.json(
          {
            error:
              "Failed to sync password with authentication service. Please try again.",
          },
          { status: 502 },
        );
      }
    }

    const updatedUser = await updateUserById(userId, {
      password: newPassword,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}

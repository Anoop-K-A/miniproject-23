import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  findUserByUsername,
  updateUserLastActive,
} from "@/lib/userStore";

const DEFAULT_ADMIN_EMAIL = "admin@college.com";
const DEFAULT_ADMIN_NAME = "Admin User";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Firebase API key not configured" },
        { status: 500 },
      );
    }

    const firebaseResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          returnSecureToken: true,
        }),
      },
    );

    type FirebaseLoginSuccess = {
      localId: string;
      email?: string;
    };

    let firebaseData: FirebaseLoginSuccess | null = null;

    if (!firebaseResponse.ok) {
      const firebaseError = (await firebaseResponse.json()) as {
        error?: { message?: string };
      };
      const errorCode = firebaseError.error?.message;

      if (
        errorCode === "EMAIL_NOT_FOUND" ||
        errorCode === "INVALID_PASSWORD" ||
        errorCode === "INVALID_LOGIN_CREDENTIALS"
      ) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      if (errorCode === "USER_DISABLED") {
        return NextResponse.json(
          { error: "Account is disabled" },
          { status: 403 },
        );
      }

      console.error("Firebase sign-in error:", firebaseError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }

    firebaseData = (await firebaseResponse.json()) as FirebaseLoginSuccess;

    let user = await findUserByUsername(normalizedEmail);

    // Keep the default admin account usable even when only Firebase Auth exists.
    if (
      !user &&
      normalizedEmail === DEFAULT_ADMIN_EMAIL &&
      firebaseData?.localId
    ) {
      try {
        user = await createUser({
          username: normalizedEmail,
          email: normalizedEmail,
          name: DEFAULT_ADMIN_NAME,
          role: "admin",
          roles: ["admin"],
          department: "Administration",
          status: "active",
          firebaseUid: firebaseData.localId,
        });
      } catch (createError) {
        if (
          !(createError instanceof Error) ||
          createError.message !== "DUPLICATE_USER"
        ) {
          console.error(
            "Failed to auto-provision admin profile after Firebase login:",
            createError,
          );
        }
        user = await findUserByUsername(normalizedEmail);
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Account is authenticated but profile is missing. Contact admin to complete setup.",
        },
        { status: 403 },
      );
    }

    const normalizedStatus = user.status?.toLowerCase();
    const isApproved =
      !normalizedStatus ||
      normalizedStatus === "active" ||
      normalizedStatus === "approved" ||
      normalizedStatus === "approval";

    if (!isApproved) {
      return NextResponse.json(
        { error: "Account pending approval" },
        { status: 403 },
      );
    }

    // Update lastActiveAt timestamp
    try {
      await updateUserLastActive(user.id);
    } catch (error) {
      console.error("Failed to update lastActiveAt:", error);
      // Continue with response even if this fails
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      roles: user.roles || [user.role],
      department: user.department,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

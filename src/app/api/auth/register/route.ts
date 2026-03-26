import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";
import { adminAuth } from "@/lib/firebaseAdmin";
import { createUser, findUserByEmail, isUsernameTaken } from "@/lib/userStore";
import {
  isPrimaryAdminUsername,
  normalizeRoleInput,
  normalizeUsername,
} from "@/lib/adminConfig";

export async function POST(request: NextRequest) {
  let createdFirebaseUid: string | null = null;

  try {
    const { email, password, fullName, role, department } =
      await request.json();

    console.log("[REGISTER] Registration attempt:", { email, fullName, role });

    // Validate inputs
    if (!email || !password || !fullName || !department) {
      console.log("[REGISTER] Missing required fields");
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      console.log("[REGISTER] Password too short");
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const requestedRole =
      typeof role === "string" && role.trim().length > 0
        ? role.trim().toLowerCase()
        : "faculty";

    const mappedRole = normalizeRoleInput(requestedRole);
    if (mappedRole === "admin") {
      console.log("[REGISTER] Admin role assignment attempted");
      return NextResponse.json(
        { error: "Creating admin users is disabled" },
        { status: 403 },
      );
    }

    const normalizedRole: UserRole =
      mappedRole === "auditor"
        ? "auditor"
        : mappedRole === "staff-advisor"
          ? "staff-advisor"
          : "faculty";

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedOfficialName = normalizeUsername(fullName);

    console.log("[REGISTER] Normalized:", {
      normalizedEmail,
      normalizedOfficialName,
      normalizedRole,
    });

    if (isPrimaryAdminUsername(normalizedOfficialName)) {
      console.log("[REGISTER] Primary admin username reserved");
      return NextResponse.json(
        { error: "This username is reserved" },
        { status: 403 },
      );
    }

    const usernameTaken = await isUsernameTaken(normalizedOfficialName);
    const existingByEmail = await findUserByEmail(normalizedEmail);

    console.log("[REGISTER] Duplicate checks:", {
      usernameTaken,
      existingByEmail: !!existingByEmail,
    });

    if (usernameTaken || existingByEmail) {
      console.log("[REGISTER] User already exists");
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 },
      );
    }

    console.log("[REGISTER] Creating Firebase user...");
    const firebaseUser = await adminAuth.createUser({
      email: normalizedEmail,
      password,
      displayName: fullName,
    });
    createdFirebaseUid = firebaseUser.uid;
    console.log("[REGISTER] Firebase user created:", createdFirebaseUid);

    console.log("[REGISTER] Creating MongoDB user...");
    await createUser({
      username: fullName,
      email: normalizedEmail,
      name: fullName,
      role: normalizedRole,
      roles: [normalizedRole],
      department,
      status: normalizedRole === "faculty" ? "pending" : "active",
      firebaseUid: firebaseUser.uid,
    });
    console.log("[REGISTER] MongoDB user created");

    // Send verification email (for faculty only)
    if (normalizedRole === "faculty") {
      try {
        console.log("[REGISTER] Sending verification email...");
        // Call send-verification endpoint which will generate token and send email
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/send-verification`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: normalizedEmail,
              fullName,
              firebaseUid: firebaseUser.uid,
            }),
          },
        );

        if (!response.ok) {
          console.warn(
            "Failed to send verification email, but user was created",
          );
        } else {
          console.log("[REGISTER] Verification email sent");
        }
      } catch (emailError) {
        console.warn(
          "Email sending failed, but user account was created:",
          emailError,
        );
        // Don't fail the registration if email fails
      }
    }

    console.log("[REGISTER] Registration successful");
    return NextResponse.json({
      message:
        normalizedRole === "faculty"
          ? "Account created! Please check your email to verify your account. Admin can only see your profile after email verification."
          : "User created successfully",
      firebaseUid: firebaseUser.uid,
    });
  } catch (error) {
    console.error("[REGISTER] Error occurred:", error);

    if (createdFirebaseUid) {
      try {
        console.log("[REGISTER] Rolling back Firebase user...");
        await adminAuth.deleteUser(createdFirebaseUid);
        console.log("[REGISTER] Firebase user rolled back");
      } catch (rollbackError) {
        console.error("Failed to roll back Firebase user:", rollbackError);
      }
    }

    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError?.code === "auth/email-already-exists") {
      console.log("[REGISTER] Firebase auth/email-already-exists");
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "DUPLICATE_USER") {
      console.log("[REGISTER] DUPLICATE_USER error");
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "PRIMARY_ADMIN_IDENTITY_RESERVED"
    ) {
      console.log("[REGISTER] PRIMARY_ADMIN_IDENTITY_RESERVED");
      return NextResponse.json(
        { error: "This username is reserved" },
        { status: 403 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "ADMIN_ROLE_ASSIGNMENT_DISABLED"
    ) {
      console.log("[REGISTER] ADMIN_ROLE_ASSIGNMENT_DISABLED");
      return NextResponse.json(
        { error: "Creating admin users is disabled" },
        { status: 403 },
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";
import { adminAuth } from "@/lib/firebaseAdmin";
import { createUser, findUserByUsername } from "@/lib/userStore";
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

    // Validate inputs
    if (!email || !password || !fullName || !department) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
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

    if (isPrimaryAdminUsername(normalizedOfficialName)) {
      return NextResponse.json(
        { error: "This username is reserved" },
        { status: 403 },
      );
    }

    const existingByUsername = await findUserByUsername(normalizedOfficialName);
    const existingByEmail = await findUserByUsername(normalizedEmail);

    if (existingByUsername || existingByEmail) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 },
      );
    }

    const firebaseUser = await adminAuth.createUser({
      email: normalizedEmail,
      password,
      displayName: fullName,
    });
    createdFirebaseUid = firebaseUser.uid;

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

    return NextResponse.json({
      message: "User created successfully",
      firebaseUid: firebaseUser.uid,
    });
  } catch (error) {
    if (createdFirebaseUid) {
      try {
        await adminAuth.deleteUser(createdFirebaseUid);
      } catch (rollbackError) {
        console.error("Failed to roll back Firebase user:", rollbackError);
      }
    }

    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError?.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "DUPLICATE_USER") {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "PRIMARY_ADMIN_IDENTITY_RESERVED"
    ) {
      return NextResponse.json(
        { error: "This username is reserved" },
        { status: 403 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "ADMIN_ROLE_ASSIGNMENT_DISABLED"
    ) {
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

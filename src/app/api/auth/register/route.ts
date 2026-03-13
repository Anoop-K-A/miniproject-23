import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";
import { adminAuth } from "@/lib/firebaseAdmin";
import { createUser, findUserByUsername } from "@/lib/userStore";

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

    const normalizedRole: UserRole =
      requestedRole === "auditor"
        ? "auditor"
        : requestedRole === "staffadvisor" ||
            requestedRole === "staff advisor" ||
            requestedRole === "staff-advisor"
          ? "staff-advisor"
          : requestedRole === "admin"
            ? "admin"
            : "faculty";

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingProfile = await findUserByUsername(normalizedEmail);
    if (existingProfile) {
      return NextResponse.json(
        { error: "Email already exists" },
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
      username: normalizedEmail,
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
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "DUPLICATE_USER") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

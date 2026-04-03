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
  let normalizedEmail = "";
  let fullName = "";
  let department = "";
  let normalizedRole: UserRole = "faculty";

  try {
    const {
      email,
      password,
      fullName: requestFullName,
      role,
      department: requestDepartment,
    } = await request.json();

    fullName = String(requestFullName || "").trim();
    department = String(requestDepartment || "").trim();

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

    normalizedRole =
      mappedRole === "auditor"
        ? "auditor"
        : mappedRole === "staff-advisor"
          ? "staff-advisor"
          : "faculty";

    normalizedEmail = String(email).trim().toLowerCase();
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
        {
          error:
            "Email is already registered. Please sign in or wait for admin approval.",
        },
        { status: 409 },
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
      username: normalizedEmail,
      email: normalizedEmail,
      name: fullName,
      role: normalizedRole,
      roles: [normalizedRole],
      department,
      status: normalizedRole === "faculty" ? "pending" : "active",
      emailVerified: true,
      firebaseUid: firebaseUser.uid,
    });
    console.log("[REGISTER] MongoDB user created");

    console.log("[REGISTER] Registration successful");
    return NextResponse.json(
      {
        message:
          normalizedRole === "faculty"
            ? "Account created! Your profile is now pending admin approval."
            : "User created successfully",
        firebaseUid: firebaseUser.uid,
      },
      { status: 200 },
    );
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

      const existingByEmail = normalizedEmail
        ? await findUserByEmail(normalizedEmail)
        : null;

      if (existingByEmail) {
        return NextResponse.json(
          {
            error:
              "This email is already registered. Please sign in instead of creating a new account.",
            code: "EMAIL_ALREADY_EXISTS",
          },
          { status: 409 },
        );
      }

      if (normalizedEmail) {
        try {
          const firebaseUser = await adminAuth.getUserByEmail(normalizedEmail);
          await createUser({
            username: fullName || normalizedEmail,
            email: normalizedEmail,
            name: fullName || normalizedEmail,
            role: normalizedRole,
            roles: [normalizedRole],
            department: department || "General",
            status: normalizedRole === "faculty" ? "pending" : "active",
            emailVerified: true,
            firebaseUid: firebaseUser.uid,
          });

          return NextResponse.json(
            {
              message:
                "Your account already existed in authentication and has been linked.",
              code: "PROFILE_RECOVERED_FROM_AUTH",
            },
            { status: 200 },
          );
        } catch (recoveryError) {
          console.warn(
            "[REGISTER] Could not recover profile from auth:",
            recoveryError,
          );
        }
      }

      return NextResponse.json(
        {
          error:
            "This email is already registered. Please sign in instead of creating a new account.",
          code: "EMAIL_ALREADY_EXISTS",
        },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message === "DUPLICATE_USER") {
      console.log("[REGISTER] DUPLICATE_USER error");
      return NextResponse.json(
        {
          error:
            "Email is already registered. Please sign in or wait for admin approval.",
        },
        { status: 409 },
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

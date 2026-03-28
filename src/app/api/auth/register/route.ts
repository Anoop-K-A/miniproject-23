import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import type { UserRole } from "@/lib/roles";
import { adminAuth } from "@/lib/firebaseAdmin";
import { createUser, findUserByEmail, isUsernameTaken } from "@/lib/userStore";
import { EmailServiceError, sendVerificationEmail } from "@/lib/emailService";
import { storeVerificationToken } from "@/lib/verificationTokenStore";
import {
  isPrimaryAdminUsername,
  normalizeRoleInput,
  normalizeUsername,
} from "@/lib/adminConfig";

async function sendFacultyVerification(
  email: string,
  fullName: string,
  firebaseUid: string,
) {
  const token = randomBytes(32).toString("hex");
  storeVerificationToken(token, {
    email,
    firebaseUid,
    createdAt: Date.now(),
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;
  await sendVerificationEmail(email, fullName, verificationLink);
}

export async function POST(request: NextRequest) {
  let createdFirebaseUid: string | null = null;
  let normalizedEmail = "";
  let fullName = "";
  let department = "";
  let normalizedRole: UserRole = "faculty";
  let emailWarning: string | null = null;

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
        await sendFacultyVerification(
          normalizedEmail,
          fullName,
          firebaseUser.uid,
        );
        console.log("[REGISTER] Verification email sent");
      } catch (emailError) {
        console.warn(
          "Email sending failed, but user account was created:",
          emailError,
        );
        if (
          emailError instanceof EmailServiceError &&
          emailError.code === "EMAIL_SERVICE_NOT_CONFIGURED"
        ) {
          emailWarning =
            "Account created, but email service is not configured. Please ask admin to set GMAIL_USER and GMAIL_PASSWORD, then use Resend Verification from login.";
        } else {
          emailWarning =
            "Account created, but verification email could not be delivered. Use Resend Verification from login.";
        }
        // Don't fail the registration if email fails
      }
    }

    console.log("[REGISTER] Registration successful");
    return NextResponse.json(
      {
        message:
          normalizedRole === "faculty"
            ? "Account created! Please check your email to verify your account. Admin can only see your profile after email verification."
            : "User created successfully",
        firebaseUid: firebaseUser.uid,
        ...(emailWarning
          ? {
              warning: emailWarning,
              code: "VERIFICATION_EMAIL_SEND_FAILED",
            }
          : {}),
      },
      {
        status: emailWarning ? 202 : 200,
      },
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
        const existingRole =
          normalizeRoleInput(existingByEmail.role) || "faculty";
        if (
          existingRole === "faculty" &&
          existingByEmail.emailVerified !== true &&
          existingByEmail.firebaseUid
        ) {
          try {
            await sendFacultyVerification(
              existingByEmail.email || normalizedEmail,
              existingByEmail.name || fullName || "Faculty Member",
              existingByEmail.firebaseUid,
            );
            return NextResponse.json(
              {
                message:
                  "Account already exists and is pending email verification. We sent a fresh verification email.",
                code: "EMAIL_ALREADY_EXISTS_VERIFICATION_RESENT",
              },
              { status: 409 },
            );
          } catch (resendError) {
            console.warn(
              "[REGISTER] Failed to resend verification email:",
              resendError,
            );

            const resendConfigError =
              resendError instanceof EmailServiceError &&
              resendError.code === "EMAIL_SERVICE_NOT_CONFIGURED";

            return NextResponse.json(
              {
                error: resendConfigError
                  ? "This email is already registered and pending verification, but email service is not configured. Ask admin to configure GMAIL_USER and GMAIL_PASSWORD."
                  : "This email is already registered and pending verification. Please use login and resend verification.",
                code: "EMAIL_ALREADY_EXISTS_PENDING_VERIFICATION",
              },
              { status: 409 },
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
            firebaseUid: firebaseUser.uid,
          });

          if (normalizedRole === "faculty") {
            try {
              await sendFacultyVerification(
                normalizedEmail,
                fullName || normalizedEmail,
                firebaseUser.uid,
              );
            } catch (recoveryEmailError) {
              console.warn(
                "[REGISTER] Recovered profile but failed to send verification email:",
                recoveryEmailError,
              );
            }
          }

          return NextResponse.json(
            {
              message:
                "Your account already existed in authentication and has been linked. Please verify your email to continue.",
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
            "This email is already registered. Please sign in or use resend verification from the login page.",
          code: "EMAIL_ALREADY_EXISTS",
        },
        { status: 409 },
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

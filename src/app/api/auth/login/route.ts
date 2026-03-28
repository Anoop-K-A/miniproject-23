import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  findUserByUsername,
  updateUserLastActive,
} from "@/lib/userStore";
import {
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_NAME,
  PRIMARY_ADMIN_PASSWORD,
  PRIMARY_ADMIN_USERNAME,
  includesAdminRole,
  normalizeRoleInput,
  sanitizeNonAdminRoles,
  isPrimaryAdminUsername,
  normalizeUsername,
} from "@/lib/adminConfig";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    const normalizedProvidedUsername = normalizeUsername(username);

    // Reserved read-only user login requested for shared viewing page.
    if (normalizedProvidedUsername === "user" && password === "User@123") {
      return NextResponse.json({
        id: "public-user",
        username: "User",
        name: "User",
        role: "user",
        roles: ["user"],
        department: "General",
      });
    }

    const normalizedUsername = normalizedProvidedUsername;
    let user = await findUserByUsername(normalizedUsername);

    const resolvedLoginEmail = user?.email
      ? String(user.email).trim().toLowerCase()
      : user?.username && String(user.username).includes("@")
        ? String(user.username).trim().toLowerCase()
        : isPrimaryAdminUsername(normalizedUsername)
          ? PRIMARY_ADMIN_EMAIL
          : null;

    if (!resolvedLoginEmail) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    type FirebaseLoginSuccess = {
      localId: string;
      email?: string;
    };

    let firebaseData: FirebaseLoginSuccess | null = null;
    let firebaseUnavailable = false;

    const ensurePrimaryAdminProfile = async (firebaseUid?: string) => {
      if (user || !isPrimaryAdminUsername(normalizedUsername)) {
        return;
      }

      try {
        user = await createUser({
          username: PRIMARY_ADMIN_USERNAME,
          email: PRIMARY_ADMIN_EMAIL,
          name: PRIMARY_ADMIN_NAME,
          role: "admin",
          roles: ["admin"],
          department: "Administration",
          status: "active",
          ...(firebaseUid ? { firebaseUid } : {}),
        });
      } catch (createError) {
        if (
          !(createError instanceof Error) ||
          createError.message !== "DUPLICATE_USER"
        ) {
          console.error(
            "Failed to auto-provision admin profile after login:",
            createError,
          );
        }
        user = await findUserByUsername(PRIMARY_ADMIN_USERNAME);
      }
    };

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey) {
      try {
        const firebaseResponse = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: resolvedLoginEmail,
              password,
              returnSecureToken: true,
            }),
            signal: AbortSignal.timeout(7000),
          },
        );

        if (!firebaseResponse.ok) {
          let errorCode: string | undefined;
          try {
            const firebaseError = (await firebaseResponse.json()) as {
              error?: { message?: string };
            };
            errorCode = firebaseError.error?.message;
          } catch {
            // Ignore parse errors and continue with generic handling.
          }

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

          firebaseUnavailable = true;
          console.error("Firebase sign-in error code:", errorCode || "unknown");
        } else {
          firebaseData =
            (await firebaseResponse.json()) as FirebaseLoginSuccess;
        }
      } catch (firebaseNetworkError) {
        firebaseUnavailable = true;
        console.error("Firebase sign-in request failed:", firebaseNetworkError);
      }
    } else {
      firebaseUnavailable = true;
    }

    if (firebaseData?.localId) {
      await ensurePrimaryAdminProfile(firebaseData.localId);
    }

    if (!firebaseData) {
      const isAdminAttempt = isPrimaryAdminUsername(normalizedUsername);
      const hasStoredPassword =
        typeof user?.password === "string" && user.password.length > 0;
      const passwordMatchesStored =
        hasStoredPassword && user?.password === password;
      const adminPasswordMatches =
        isAdminAttempt &&
        !hasStoredPassword &&
        password === PRIMARY_ADMIN_PASSWORD;

      if (!passwordMatchesStored && !adminPasswordMatches) {
        if (hasStoredPassword || isAdminAttempt) {
          return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 },
          );
        }

        if (firebaseUnavailable) {
          return NextResponse.json(
            {
              error:
                "Authentication service is temporarily unavailable. Please try again shortly.",
            },
            { status: 503 },
          );
        }

        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      if (adminPasswordMatches) {
        await ensurePrimaryAdminProfile();
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

    const normalizedUserRole = normalizeRoleInput(user.role) || "faculty";
    if (normalizedUserRole === "faculty" && user.emailVerified !== true) {
      return NextResponse.json(
        {
          error:
            "Email verification required. Please verify your email from the link we sent before signing in.",
          code: "EMAIL_VERIFICATION_REQUIRED",
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
        { error: "Account pending approval", code: "ACCOUNT_PENDING_APPROVAL" },
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

    const sourceRoles =
      Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles
        : [user.role];
    const normalizedRoles = includesAdminRole(sourceRoles)
      ? ["admin"]
      : sanitizeNonAdminRoles(sourceRoles);
    const normalizedRole = normalizedRoles[0];

    return NextResponse.json({
      id: user.id,
      username: user.username || user.name,
      name: user.name,
      role: normalizedRole,
      roles: normalizedRoles,
      department: user.department,
      emailVerified: user.emailVerified === true,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

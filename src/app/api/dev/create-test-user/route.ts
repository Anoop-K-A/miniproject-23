/**
 * Development API: Create Test User in Firebase Auth
 *
 * This endpoint creates a test user directly in Firebase Authentication
 * for quick testing during development.
 *
 * Usage: POST http://localhost:3000/api/dev/create-test-user
 *
 * ⚠️ SECURITY WARNING: Remove or protect this endpoint in production!
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  isPrimaryAdminEmail,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_PASSWORD,
} from "@/lib/adminConfig";

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is disabled in production" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { email, password, name, role, department } = body;

    // Use defaults if not provided
    const testEmail = email || PRIMARY_ADMIN_EMAIL;
    const testPassword = password || PRIMARY_ADMIN_PASSWORD;
    const testName = name || "Admin User";
    const requestedRole = String(role || "")
      .trim()
      .toLowerCase();
    const isPrimaryAdminTarget = isPrimaryAdminEmail(testEmail);

    if (requestedRole === "admin" && !isPrimaryAdminTarget) {
      return NextResponse.json(
        { error: "Assigning admin role is disabled" },
        { status: 403 },
      );
    }

    const testRole = isPrimaryAdminTarget
      ? "admin"
      : requestedRole === "auditor"
        ? "auditor"
        : requestedRole === "staff-advisor" ||
            requestedRole === "staff advisor" ||
            requestedRole === "staffadvisor"
          ? "staff-advisor"
          : "faculty";
    const testDepartment = department || "Administration";

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await adminAuth.getUserByEmail(testEmail);
      return NextResponse.json(
        {
          success: true,
          message: "User already exists",
          user: {
            email: existingUser.email,
            uid: existingUser.uid,
            displayName: existingUser.displayName,
          },
        },
        { status: 200 },
      );
    } catch (error: any) {
      // User doesn't exist, proceed to create
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: testEmail,
      password: testPassword,
      displayName: testName,
      disabled: false,
    });

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: testRole,
      department: testDepartment,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Test user created successfully",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        credentials: {
          email: testEmail,
          password: testPassword,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating test user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create test user",
      },
      { status: 500 },
    );
  }
}

// GET endpoint to create default admin user
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is disabled in production" },
      { status: 403 },
    );
  }

  try {
    const testEmail = PRIMARY_ADMIN_EMAIL;
    const testPassword = PRIMARY_ADMIN_PASSWORD;

    // Check if user already exists
    try {
      const existingUser = await adminAuth.getUserByEmail(testEmail);
      return NextResponse.json(
        {
          success: true,
          message: "Admin user already exists. You can sign in now!",
          credentials: {
            email: testEmail,
            password: testPassword,
          },
        },
        { status: 200 },
      );
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Create default admin user
    const userRecord = await adminAuth.createUser({
      email: testEmail,
      password: testPassword,
      displayName: "Admin User",
      disabled: false,
    });

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: "admin",
      department: "Administration",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created! You can now sign in.",
        credentials: {
          email: testEmail,
          password: testPassword,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create admin user",
      },
      { status: 500 },
    );
  }
}

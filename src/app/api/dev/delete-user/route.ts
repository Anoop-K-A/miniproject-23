/**
 * Development API: Delete Test User from Firebase Auth & Firestore
 *
 * This endpoint deletes a user from both Firebase Authentication and Firestore
 * to allow re-registration during development.
 *
 * Usage:
 * - GET: http://localhost:3000/api/dev/delete-user?email=admin@college.edu
 * - POST: http://localhost:3000/api/dev/delete-user (with JSON body)
 *
 * ⚠️ SECURITY WARNING: Remove or protect this endpoint in production!
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is disabled in production" },
      { status: 403 },
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 },
      );
    }

    return await deleteUser(email);
  } catch (error: any) {
    console.error("Error in GET /dev/delete-user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete user",
      },
      { status: 500 },
    );
  }
}

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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required in request body" },
        { status: 400 },
      );
    }

    return await deleteUser(email);
  } catch (error: any) {
    console.error("Error in POST /dev/delete-user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete user",
      },
      { status: 500 },
    );
  }
}

async function deleteUser(email: string) {
  let deletedFromAuth = false;
  let deletedFromFirestore = false;
  let uid: string | undefined;

  try {
    // Try to get user from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    uid = userRecord.uid;

    // Delete from Firebase Authentication
    await adminAuth.deleteUser(uid);
    deletedFromAuth = true;
    console.log(`Deleted user from Firebase Auth: ${email}`);

    // Delete from Firestore
    try {
      await adminDb.collection("users").doc(uid).delete();
      deletedFromFirestore = true;
      console.log(`Deleted user from Firestore: ${email}`);
    } catch (firestoreError: any) {
      console.warn(
        `Could not delete from Firestore: ${firestoreError.message}`,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
        details: {
          email,
          uid,
          deletedFromAuth,
          deletedFromFirestore,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          email,
        },
        { status: 404 },
      );
    }

    throw error;
  }
}

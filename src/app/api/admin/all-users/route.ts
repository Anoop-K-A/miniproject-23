import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching all users directly from Firestore...");

    if (!adminDb) {
      console.error("Firestore database not initialized");
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    let snapshot;
    try {
      // Get ALL users regardless of approval status
      snapshot = await adminDb.collection("users").get();
    } catch (queryError: any) {
      // If collection doesn't exist, return empty array
      if (queryError.code === 5 || queryError.message?.includes("NOT_FOUND")) {
        console.log("Users collection not found");
        return NextResponse.json({
          allUsers: [],
          approvedUsers: [],
          pendingUsers: [],
          totalCount: 0,
        });
      }
      throw queryError;
    }

    console.log(`Found ${snapshot.size} total users`);

    // Categorize users
    const allUsers: any[] = [];
    const approvedUsers: any[] = [];
    const pendingUsers: any[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const user = {
        id: doc.id,
        email: data.email || "",
        name: data.name || data.displayName || "Unknown",
        department: data.department || "N/A",
        approved: data.approved || false,
        role: data.role || "faculty",
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      };

      allUsers.push(user);

      if (data.approved) {
        approvedUsers.push(user);
      } else {
        pendingUsers.push(user);
      }
    });

    return NextResponse.json({
      allUsers,
      approvedUsers,
      pendingUsers,
      totalCount: allUsers.length,
      approvedCount: approvedUsers.length,
      pendingCount: pendingUsers.length,
    });
  } catch (error: any) {
    console.error("Error fetching all users:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch all users",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

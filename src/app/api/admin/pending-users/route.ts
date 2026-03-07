import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// API endpoint to fetch pending user approvals
export async function GET(request: NextRequest) {
  try {
    console.log("=== Pending Users Query ===");
    console.log("Fetching pending users from Firestore...");

    if (!adminDb) {
      console.error("Firestore database not initialized");
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    // First, let's get ALL users to see what's in the database
    let allUsersSnapshot;
    try {
      allUsersSnapshot = await adminDb.collection("users").get();
      console.log(`Total users in Firestore: ${allUsersSnapshot.size}`);

      allUsersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${data.email} (approved: ${data.approved})`);
      });
    } catch (error: any) {
      if (error.code === 5 || error.message?.includes("NOT_FOUND")) {
        console.log("Users collection does not exist yet");
        return NextResponse.json({
          pendingUsers: [],
          count: 0,
          allUsers: [],
          debug: { message: "Users collection not found" },
        });
      }
      throw error;
    }

    // Now query for pending users specifically
    let snapshot;
    try {
      snapshot = await adminDb
        .collection("users")
        .where("approved", "==", false)
        .get();
    } catch (queryError: any) {
      // If collection doesn't exist, return empty array
      if (queryError.code === 5 || queryError.message?.includes("NOT_FOUND")) {
        console.log(
          "Users collection not found, returning empty pending users",
        );
        return NextResponse.json({
          pendingUsers: [],
          count: 0,
        });
      }
      throw queryError;
    }

    console.log(`Found ${snapshot.size} pending users`);

    const pendingUsers = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || "",
        name: data.name || data.displayName || "Unknown",
        department: data.department || "N/A",
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      };
    });

    return NextResponse.json({
      pendingUsers,
      count: pendingUsers.length,
      debug: {
        totalUsersInDatabase: allUsersSnapshot.size,
        pendingQuery: `approved == false`,
      },
    });
  } catch (error: any) {
    console.error("Error fetching pending users:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      fullError: error,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch pending users",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId and action are required" },
        { status: 400 },
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "approve") {
      await userRef.update({
        approved: true,
        approvedAt: new Date(),
      });

      return NextResponse.json({
        message: "User approved successfully",
        user: {
          id: userId,
          approved: true,
        },
      });
    } else if (action === "reject") {
      await userRef.update({
        approved: false,
        rejected: true,
        rejectedAt: new Date(),
      });

      return NextResponse.json({
        message: "User rejected successfully",
        user: {
          id: userId,
          approved: false,
          rejected: true,
        },
      });
    }
  } catch (error: any) {
    console.error("Error processing user approval:", {
      message: error?.message,
      code: error?.code,
      fullError: error,
    });
    return NextResponse.json(
      {
        error: "Failed to process user approval",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

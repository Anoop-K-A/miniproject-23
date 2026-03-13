import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

/**
 * Debug endpoint to show all users in Firestore with full details
 */
export async function GET(request: NextRequest) {
  try {
    console.log("=== Debug: Listing All Users ===");

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    let snapshot;
    try {
      snapshot = await adminDb.collection("users").get();
    } catch (error: any) {
      if (error.code === 5 || error.message?.includes("NOT_FOUND")) {
        return NextResponse.json({
          users: [],
          total: 0,
          message: "Users collection not found",
        });
      }
      throw error;
    }

    console.log(`Found ${snapshot.size} total users in Firestore`);

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(`User: ${data.email}`, {
        approved: data.approved,
        role: data.role,
        name: data.name,
        department: data.department,
        createdAt: data.createdAt,
      });

      return {
        id: doc.id,
        email: data.email,
        name: data.name || data.displayName,
        department: data.department,
        role: data.role,
        approved: data.approved,
        banned: data.banned,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        // Include all fields for debugging
        _raw: data,
      };
    });

    console.log("\n=== Summary ===");
    console.log(`Total Users: ${users.length}`);
    console.log(`Approved: ${users.filter((u) => u.approved).length}`);
    console.log(`Pending: ${users.filter((u) => !u.approved).length}`);

    return NextResponse.json({
      users,
      total: users.length,
      approved: users.filter((u) => u.approved).length,
      pending: users.filter((u) => !u.approved).length,
    });
  } catch (error: any) {
    console.error("Error fetching debug users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error?.message,
      },
      { status: 500 },
    );
  }
}

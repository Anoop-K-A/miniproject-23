import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, updateUserById } from "@/lib/userStore";

// API endpoint to fetch pending user approvals
export async function GET(request: NextRequest) {
  try {
    console.log("=== Pending Users Query ===");
    console.log("Fetching pending users from MongoDB...");

    // Get all users from MongoDB
    const allUsers = await getAllUsers();
    console.log(`Total users in MongoDB: ${allUsers.length}`);

    // Filter for users with status="pending" AND emailVerified=true
    const pendingUsers = allUsers
      .filter(
        (user) =>
          user.status === "pending" &&
          (user.emailVerified === true ||
            user.role === "admin" ||
            user.roles?.includes("admin")),
      )
      .map((user) => ({
        id: user.id,
        email: user.email || "",
        name: user.name || "Unknown",
        department: user.department || "N/A",
        role: user.role || "faculty",
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      }));

    console.log(`Found ${pendingUsers.length} pending verified users`);

    return NextResponse.json({
      pendingUsers,
      count: pendingUsers.length,
      debug: {
        totalUsersInDatabase: allUsers.length,
        pendingQuery: `status == "pending" AND emailVerified == true`,
      },
    });
  } catch (error: any) {
    console.error("Error fetching pending users:", {
      message: error?.message,
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

    // Update user in MongoDB
    if (action === "approve") {
      await updateUserById(userId, {
        status: "active",
        approvedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        message: "User approved successfully",
        user: {
          id: userId,
          status: "active",
        },
      });
    } else if (action === "reject") {
      await updateUserById(userId, {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        message: "User rejected successfully",
        user: {
          id: userId,
          status: "rejected",
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

import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/firestoreDb";

// PATCH /api/admin/users/{id}/approve - Approve a user
export async function PATCH(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;

    const user = await userDb.getById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await userDb.update(id, {
      approved: true,
    });

    return NextResponse.json({
      success: true,
      message: "User approved successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json(
      { error: "Failed to approve user" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/users/{id}/roles - Update user roles
export async function PUT(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const { roles, currentRole } = await request.json();

    if (!Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: "Roles must be a non-empty array" },
        { status: 400 },
      );
    }

    // Validate that faculty role is always present
    if (!roles.includes("faculty")) {
      return NextResponse.json(
        { error: "Faculty role must always be assigned" },
        { status: 400 },
      );
    }

    const user = await userDb.getById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user with new roles
    const updatedUser = await userDb.update(id, {
      roles: roles,
      role: currentRole || "faculty",
    });

    return NextResponse.json({
      success: true,
      message: "User roles updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { error: "Failed to update user roles" },
      { status: 500 },
    );
  }
}

// GET /api/admin/users/{id} - Get specific user
export async function GET(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;

    const user = await userDb.getById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

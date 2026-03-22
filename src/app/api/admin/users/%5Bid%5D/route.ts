import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/firestoreDb";
import {
  includesAdminRole,
  isPrimaryAdminEmail,
  sanitizeNonAdminRoles,
} from "@/lib/adminConfig";

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

    const user = await userDb.getById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPrimaryAdmin = isPrimaryAdminEmail(user.email);

    if (isPrimaryAdmin) {
      if (!includesAdminRole(roles)) {
        return NextResponse.json(
          { error: "Primary admin role cannot be modified" },
          { status: 403 },
        );
      }

      const updatedPrimaryAdmin = await userDb.update(id, {
        roles: ["admin"],
        role: "admin",
      });

      return NextResponse.json({
        success: true,
        message: "Primary admin role is fixed",
        data: updatedPrimaryAdmin,
      });
    }

    if (includesAdminRole(roles) || currentRole === "admin") {
      return NextResponse.json(
        { error: "Assigning admin role is disabled" },
        { status: 403 },
      );
    }

    const normalizedRoles = sanitizeNonAdminRoles(roles);

    // Update user with new roles
    const updatedUser = await userDb.update(id, {
      roles: normalizedRoles,
      role: normalizedRoles[0],
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

import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";
import { createUser, getAllUsers } from "@/lib/userStore";
import {
  includesAdminRole,
  normalizeRoleInput,
  sanitizeNonAdminRoles,
} from "@/lib/adminConfig";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Users load error:", error);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const requestedRole = normalizeRoleInput(payload.role);
    const requestedRoles = Array.isArray(payload.roles) ? payload.roles : [];

    if (requestedRole === "admin" || includesAdminRole(requestedRoles)) {
      return NextResponse.json(
        { error: "Assigning admin role is disabled" },
        { status: 403 },
      );
    }

    const normalizedRole: UserRole =
      requestedRole === "auditor" || requestedRole === "staff-advisor"
        ? requestedRole
        : "faculty";
    const normalizedRoles = sanitizeNonAdminRoles(
      requestedRoles.length > 0 ? requestedRoles : [normalizedRole],
    );

    await createUser({
      id: payload.id,
      username: payload.username ?? payload.name ?? payload.email,
      email: payload.email ?? payload.username,
      password: payload.password ?? "",
      name: payload.name ?? payload.username ?? payload.email,
      role: normalizedRoles[0],
      roles: normalizedRoles,
      department: payload.department,
      phone: payload.phone,
      status: payload.status ?? "active",
    });

    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_USER") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "ADMIN_ROLE_ASSIGNMENT_DISABLED"
    ) {
      return NextResponse.json(
        { error: "Assigning admin role is disabled" },
        { status: 403 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "PRIMARY_ADMIN_IDENTITY_RESERVED"
    ) {
      return NextResponse.json(
        { error: "This username is reserved" },
        { status: 403 },
      );
    }

    console.error("User create error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";
import { createUser, getAllUsers } from "@/lib/userStore";
import {
  includesAdminRole,
  normalizeRoleInput,
  sanitizeNonAdminRoles,
} from "@/lib/adminConfig";

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function toBooleanFlag(value: string | null, fallback: boolean) {
  if (value === null) {
    return fallback;
  }
  return value !== "0" && value.toLowerCase() !== "false";
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = String(searchParams.get("role") || "")
      .trim()
      .toLowerCase();
    const status = String(searchParams.get("status") || "")
      .trim()
      .toLowerCase();
    const department = String(searchParams.get("department") || "")
      .trim()
      .toLowerCase();
    const search = String(searchParams.get("search") || "")
      .trim()
      .toLowerCase();
    const limit = parsePositiveInt(searchParams.get("limit"), 0);
    const offset = parsePositiveInt(searchParams.get("offset"), 0);
    const includeTotal = toBooleanFlag(searchParams.get("includeTotal"), true);

    const users = await getAllUsers();
    const filteredUsers = users.filter((user) => {
      if (role) {
        const userRoles = [
          String(user.role || "").toLowerCase(),
          ...(user.roles || []).map((item) => String(item || "").toLowerCase()),
        ];
        if (!userRoles.includes(role)) {
          return false;
        }
      }

      if (status && String(user.status || "").toLowerCase() !== status) {
        return false;
      }

      if (
        department &&
        String(user.department || "")
          .trim()
          .toLowerCase() !== department
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [user.name, user.username, user.email, user.department]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });

    const pagedUsers =
      limit > 0
        ? filteredUsers.slice(offset, offset + limit)
        : filteredUsers.slice(offset);

    return NextResponse.json({
      users: pagedUsers,
      total: includeTotal ? filteredUsers.length : undefined,
      offset,
      limit,
    });
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
      requestedRole === "auditor" ||
      requestedRole === "staff-advisor" ||
      requestedRole === "user"
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

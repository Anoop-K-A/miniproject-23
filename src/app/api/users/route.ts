import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";
import { createUser, getAllUsers } from "@/lib/userStore";

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
    const requestedRole = payload.role;
    const normalizedRole: UserRole =
      requestedRole === "auditor" || requestedRole === "Auditor"
        ? "auditor"
        : requestedRole === "staff-advisor" ||
            requestedRole === "StaffAdvisor" ||
            requestedRole === "Staff Advisor"
          ? "staff-advisor"
          : requestedRole === "admin" || requestedRole === "Admin"
            ? "admin"
            : "faculty";

    await createUser({
      id: payload.id,
      username: payload.username ?? payload.email,
      email: payload.email ?? payload.username,
      password: payload.password ?? "",
      name: payload.name ?? payload.username ?? payload.email,
      role: normalizedRole,
      roles: payload.roles || [normalizedRole],
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

    console.error("User create error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/roles";
import { createUser } from "@/lib/userStore";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role, department } =
      await request.json();

    // Validate inputs
    if (!email || !password || !fullName || !role || !department) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const normalizedRole: UserRole =
      role === "Auditor"
        ? "auditor"
        : role === "StaffAdvisor" || role === "Staff Advisor"
          ? "staff-advisor"
          : "faculty";

    await createUser({
      username: email,
      email,
      password,
      name: fullName,
      role: normalizedRole,
      roles: [normalizedRole],
      department,
      status: normalizedRole === "faculty" ? "pending" : "active",
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_USER") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

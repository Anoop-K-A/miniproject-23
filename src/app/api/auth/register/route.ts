import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { UserRole } from "@/lib/roles";

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

    const users = await readJsonFile<any[]>("users.json");

    // Check for duplicate email
    if (users.some((user: any) => user.username === email)) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Generate unique id
    const id = Date.now().toString();
    const normalizedRole: UserRole =
      role === "Auditor"
        ? "auditor"
        : role === "StaffAdvisor" || role === "Staff Advisor"
          ? "staff-advisor"
          : "faculty";

    const timestamp = new Date().toISOString();

    const newUser = {
      id,
      username: email,
      password,
      name: fullName,
      role: normalizedRole,
      roles: [normalizedRole],
      department,
      status: normalizedRole === "faculty" ? "pending" : "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save user
    users.push(newUser);
    await writeJsonFile("users.json", users);

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

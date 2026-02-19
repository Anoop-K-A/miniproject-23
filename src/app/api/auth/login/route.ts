import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";

interface UserRecord {
  id: string;
  lastActiveAt?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const result = await verifyCredentials(email, password);
    if (!result) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const normalizedStatus = result.status?.toLowerCase();
    const isApproved =
      !normalizedStatus ||
      normalizedStatus === "active" ||
      normalizedStatus === "approved" ||
      normalizedStatus === "approval";

    if (!isApproved) {
      return NextResponse.json(
        { error: "Account pending approval" },
        { status: 403 },
      );
    }

    // Update lastActiveAt timestamp
    try {
      const users = await readJsonFile<UserRecord[]>("users.json");
      const updatedUsers = users.map((user) =>
        user.id === result.user.id
          ? { ...user, lastActiveAt: new Date().toISOString() }
          : user,
      );
      await writeJsonFile("users.json", updatedUsers);
    } catch (error) {
      console.error("Failed to update lastActiveAt:", error);
      // Continue with response even if this fails
    }

    return NextResponse.json({
      id: result.user.id,
      username: result.user.username,
      name: result.user.name,
      role: result.user.role,
      roles: result.user.roles || [result.user.role],
      department: result.user.department,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

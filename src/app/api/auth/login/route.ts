import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";

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

    return NextResponse.json({
      id: result.user.id,
      username: result.user.username,
      name: result.user.name,
      role: result.user.role,
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

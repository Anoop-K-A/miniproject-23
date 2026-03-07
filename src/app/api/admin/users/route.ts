import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/firestoreDb";

// GET /api/admin/users - List all users with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const approved = searchParams.get("approved");
    const role = searchParams.get("role");

    let users = await userDb.getAll();

    // Apply filters
    if (approved !== null) {
      const approvedBool = approved === "true";
      users = users.filter((u) => u.approved === approvedBool);
    }

    if (role) {
      users = users.filter((u) => u.roles?.includes(role));
    }

    // Sort by createdAt descending
    users.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

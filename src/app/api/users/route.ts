import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";

interface UserRecord {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "faculty" | "auditor" | "staff-advisor" | "admin" | string;
  roles?: ("faculty" | "auditor" | "staff-advisor" | "admin")[];
  department?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET() {
  try {
    const users = await readJsonFile<UserRecord[]>("users.json");
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
    const users = await readJsonFile<UserRecord[]>("users.json");
    const timestamp = new Date().toISOString();

    const rolesArray = payload.roles || [payload.role || "faculty"];

    const newUser: UserRecord = {
      id: Date.now().toString(),
      username: payload.username,
      password: payload.password ?? "",
      name: payload.name ?? payload.username,
      role: payload.role ?? "faculty",
      roles: rolesArray,
      department: payload.department,
      email: payload.email ?? payload.username,
      phone: payload.phone,
      status: payload.status ?? "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedUsers = [newUser, ...users];
    await writeJsonFile("users.json", updatedUsers);

    return NextResponse.json({ users: updatedUsers });
  } catch (error) {
    console.error("User create error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getFacultyDashboardData } from "@/lib/dashboardData";

export async function GET(request: NextRequest) {
  const username = request.cookies.get("auth_user")?.value ?? null;
  const data = await getFacultyDashboardData(username);
  return NextResponse.json(data);
}

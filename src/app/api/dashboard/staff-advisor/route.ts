import { NextRequest, NextResponse } from "next/server";
import { getStaffAdvisorDashboardData } from "@/lib/dashboardData";

export async function GET(request: NextRequest) {
  const queryUsername = request.nextUrl.searchParams.get("username");
  const cookieUsername = request.cookies.get("auth_user")?.value ?? null;
  const username = queryUsername ?? cookieUsername;
  const data = await getStaffAdvisorDashboardData(username);
  return NextResponse.json(data);
}

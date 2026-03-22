import { NextRequest, NextResponse } from "next/server";
import { getStaffAdvisorDashboardData } from "@/lib/dashboardData";
import { unstable_cache } from "next/cache";

const getCachedStaffAdvisorDashboardData = unstable_cache(
  async (username?: string | null) => getStaffAdvisorDashboardData(username),
  ["staff-advisor-dashboard-data-v1"],
  { revalidate: 20 },
);

export async function GET(request: NextRequest) {
  const queryUsername = request.nextUrl.searchParams.get("username");
  const cookieUsername = request.cookies.get("auth_user")?.value ?? null;
  const username = queryUsername ?? cookieUsername;
  const data = await getCachedStaffAdvisorDashboardData(username);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=15, stale-while-revalidate=45",
    },
  });
}

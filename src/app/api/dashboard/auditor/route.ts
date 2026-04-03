import { NextResponse } from "next/server";
import { getAuditorDashboardData } from "@/lib/dashboardData";
import { unstable_cache } from "next/cache";

const getCachedAuditorDashboardData = unstable_cache(
  async () => getAuditorDashboardData(),
  ["auditor-dashboard-data-v2"],
  { revalidate: 10 },
);

export async function GET() {
  const data = await getCachedAuditorDashboardData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=20, stale-while-revalidate=60",
    },
  });
}

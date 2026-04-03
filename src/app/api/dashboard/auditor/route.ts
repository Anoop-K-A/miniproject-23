import { NextResponse } from "next/server";
import { getAuditorDashboardData } from "@/lib/dashboardData";

export async function GET() {
  const data = await getAuditorDashboardData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=20, stale-while-revalidate=60",
    },
  });
}

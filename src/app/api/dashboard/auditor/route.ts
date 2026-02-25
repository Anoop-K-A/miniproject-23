import { NextResponse } from "next/server";
import { getAuditorDashboardData } from "@/lib/dashboardData";

export async function GET() {
  const data = await getAuditorDashboardData();
  return NextResponse.json(data);
}

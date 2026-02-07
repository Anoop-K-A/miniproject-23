import { StaffAdvisorDashboard } from "@/components/StaffAdvisorDashboard";
import { getStaffAdvisorDashboardData } from "@/lib/dashboardData";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function StaffAdvisorDashboardPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("auth_user")?.value ?? null;
  const { stats, careerStats, students } =
    await getStaffAdvisorDashboardData(username);
  return (
    <main className="space-y-6">
      <StaffAdvisorDashboard
        stats={stats}
        careerStats={careerStats}
        students={students}
      />
    </main>
  );
}

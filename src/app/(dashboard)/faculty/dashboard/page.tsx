import { cookies } from "next/headers";
import { FacultyDashboard } from "@/components/FacultyDashboard";
import { FacultySectionTabs } from "@/components/faculty/FacultySectionTabs";
import { getFacultyDashboardData } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function FacultyDashboardPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("auth_user")?.value ?? null;
  const { stats, facultyMembers } = await getFacultyDashboardData(username);

  return (
    <main className="space-y-6">
      <FacultySectionTabs>
        <FacultyDashboard stats={stats} facultyMembers={facultyMembers} />
      </FacultySectionTabs>
    </main>
  );
}

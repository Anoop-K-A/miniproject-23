import { AuditorDashboard } from "@/components/AuditorDashboard";
import { getAuditorDashboardData } from "@/lib/dashboardData";

export const revalidate = 30;

export default async function AuditorDashboardPage() {
  const { stats, facultyMembers, recentReviews } =
    await getAuditorDashboardData();
  return (
    <main className="space-y-6">
      <AuditorDashboard
        stats={stats}
        facultyMembers={facultyMembers}
        recentReviews={recentReviews}
      />
    </main>
  );
}

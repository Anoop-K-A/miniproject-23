import { Card, CardContent } from "@/components/ui/card";
import type { AdminUser } from "./types";

interface AdminStatsProps {
  users: AdminUser[];
}

export function AdminStats({ users }: AdminStatsProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;
  const facultyCount = users.filter((u) => u.role === "faculty").length;
  const avgEngagement = totalUsers
    ? Math.round(
        users.reduce((sum, u) => sum + u.completionRate, 0) / totalUsers,
      )
    : 0;

  const statCards = [
    { label: "Total Users", value: totalUsers, accent: "text-gray-900" },
    { label: "Active", value: activeUsers, accent: "text-green-600" },
    { label: "Pending", value: pendingUsers, accent: "text-amber-600" },
    { label: "Suspended", value: suspendedUsers, accent: "text-red-600" },
    { label: "Faculty", value: facultyCount, accent: "text-blue-600" },
    {
      label: "Avg Engagement",
      value: `${avgEngagement}%`,
      accent: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className={`text-2xl font-medium ${stat.accent}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

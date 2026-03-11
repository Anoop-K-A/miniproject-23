"use client";

import { useEffect, useState } from "react";
import { FacultyPortfolio } from "./FacultyPortfolio";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { PendingAlerts } from "./PendingAlerts";
import { ActivitySection } from "./ActivitySection";
import { AllFacultyMembers } from "./AllFacultyMembers";
import { DashboardStats, FacultyMember } from "@/types/faculty";
import { useAuth } from "@/context/AuthContext";

interface FacultyDashboardProps {
  stats: DashboardStats;
  facultyMembers: FacultyMember[];
}

export function FacultyDashboard({
  stats,
  facultyMembers,
}: FacultyDashboardProps) {
  const { user } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(
    null,
  );
  const [currentStats, setCurrentStats] = useState(stats);
  const [currentFacultyMembers, setCurrentFacultyMembers] =
    useState(facultyMembers);

  const dashboardKey = `${user?.id ?? ""}:${user?.username ?? ""}`;

  useEffect(() => {
    const refreshDashboard = async () => {
      try {
        const url = user?.username
          ? `/api/dashboard/faculty?username=${encodeURIComponent(user.username)}`
          : "/api/dashboard/faculty";
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          if (data?.stats) {
            setCurrentStats(data.stats);
          }
          if (data?.facultyMembers) {
            setCurrentFacultyMembers(data.facultyMembers);
          }
        }
      } catch (error) {
        console.error("Faculty dashboard refresh error:", error);
      }
    };

    refreshDashboard();

    if (typeof window !== "undefined") {
      const handler = () => {
        refreshDashboard();
      };
      window.addEventListener("dashboard:data-updated", handler);
      return () => {
        window.removeEventListener("dashboard:data-updated", handler);
      };
    }
  }, [dashboardKey]);

  if (selectedFaculty) {
    return (
      <FacultyPortfolio
        faculty={selectedFaculty}
        onBack={() => setSelectedFaculty(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsOverview stats={currentStats} />
      <PendingAlerts pendingReports={currentStats.pendingReports} />
      <ActivitySection
        activities={currentStats.recentActivity}
        facultyMembers={currentFacultyMembers}
        onSelectFaculty={setSelectedFaculty}
      />
      <AllFacultyMembers
        facultyMembers={currentFacultyMembers}
        onSelectFaculty={setSelectedFaculty}
      />
    </div>
  );
}

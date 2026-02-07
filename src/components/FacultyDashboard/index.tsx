"use client";

import { useState } from "react";
import { FacultyPortfolio } from "./FacultyPortfolio";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { PendingAlerts } from "./PendingAlerts";
import { ActivitySection } from "./ActivitySection";
import { AllFacultyMembers } from "./AllFacultyMembers";
import { DashboardStats, FacultyMember } from "@/types/faculty";

interface FacultyDashboardProps {
  stats: DashboardStats;
  facultyMembers: FacultyMember[];
}

export function FacultyDashboard({
  stats,
  facultyMembers,
}: FacultyDashboardProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(
    null,
  );

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
      <StatsOverview stats={stats} />
      <PendingAlerts pendingReports={stats.pendingReports} />
      <ActivitySection
        activities={stats.recentActivity}
        facultyMembers={facultyMembers}
        onSelectFaculty={setSelectedFaculty}
      />
      <AllFacultyMembers
        facultyMembers={facultyMembers}
        onSelectFaculty={setSelectedFaculty}
      />
    </div>
  );
}

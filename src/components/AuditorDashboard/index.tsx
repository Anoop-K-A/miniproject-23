"use client";

import { useState } from "react";
import { FacultyAuditPortfolio } from "./FacultyAuditPortfolio";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { PendingReviewsAlert } from "./PendingReviewsAlert";
import { ReviewStatistics } from "./ReviewStatistics";
import { RecentActivity } from "./RecentActivity";
import { FacultySubmissionStatus } from "./FacultySubmissionStatus";
import { DashboardStats, FacultyMember, RecentReview } from "./types";

interface AuditorDashboardProps {
  stats: DashboardStats;
  facultyMembers: FacultyMember[];
  recentReviews: RecentReview[];
}

export function AuditorDashboard({
  stats,
  facultyMembers,
  recentReviews,
}: AuditorDashboardProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(
    null,
  );

  if (selectedFaculty) {
    return (
      <FacultyAuditPortfolio
        faculty={selectedFaculty}
        onBack={() => setSelectedFaculty(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsOverview stats={stats} />
      <PendingReviewsAlert stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewStatistics stats={stats} />
        <RecentActivity reviews={recentReviews} />
      </div>

      <FacultySubmissionStatus
        facultyMembers={facultyMembers}
        onSelectFaculty={setSelectedFaculty}
      />
    </div>
  );
}

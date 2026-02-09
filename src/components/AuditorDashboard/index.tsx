"use client";

import { useEffect, useState } from "react";
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
  const [currentStats, setCurrentStats] = useState(stats);
  const [currentFacultyMembers, setCurrentFacultyMembers] =
    useState(facultyMembers);
  const [currentRecentReviews, setCurrentRecentReviews] =
    useState(recentReviews);

  useEffect(() => {
    const refreshDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard/auditor");
        const data = await response.json();
        if (!response.ok) return;
        if (data?.stats) {
          setCurrentStats(data.stats);
        }
        if (data?.facultyMembers) {
          setCurrentFacultyMembers(data.facultyMembers);
        }
        if (data?.recentReviews) {
          setCurrentRecentReviews(data.recentReviews);
        }
      } catch (error) {
        console.error("Auditor dashboard refresh error:", error);
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
  }, []);

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
      <StatsOverview stats={currentStats} />
      <PendingReviewsAlert stats={currentStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewStatistics stats={currentStats} />
        <RecentActivity reviews={currentRecentReviews} />
      </div>

      <FacultySubmissionStatus
        facultyMembers={currentFacultyMembers}
        onSelectFaculty={setSelectedFaculty}
      />
    </div>
  );
}

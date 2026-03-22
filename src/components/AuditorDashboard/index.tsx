"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { DashboardStats, FacultyMember, RecentReview } from "./types";

const REFRESH_THROTTLE_MS = 1200;

const FacultyAuditPortfolio = dynamic(
  () =>
    import("./FacultyAuditPortfolio").then((mod) => mod.FacultyAuditPortfolio),
  { ssr: false },
);

const PendingReviewsAlert = dynamic(
  () => import("./PendingReviewsAlert").then((mod) => mod.PendingReviewsAlert),
  { ssr: false },
);

const ReviewStatistics = dynamic(
  () => import("./ReviewStatistics").then((mod) => mod.ReviewStatistics),
  { ssr: false },
);

const RecentActivity = dynamic(
  () => import("./RecentActivity").then((mod) => mod.RecentActivity),
  { ssr: false },
);

const FacultySubmissionStatus = dynamic(
  () =>
    import("./FacultySubmissionStatus").then(
      (mod) => mod.FacultySubmissionStatus,
    ),
  { ssr: false },
);

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
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  useEffect(() => {
    let activeController: AbortController | null = null;
    let lastRefreshAt = 0;

    const refreshDashboard = async () => {
      const now = Date.now();
      if (now - lastRefreshAt < REFRESH_THROTTLE_MS) {
        return;
      }
      lastRefreshAt = now;

      try {
        activeController?.abort();
        activeController = new AbortController();

        const response = await fetch("/api/dashboard/auditor", {
          signal: activeController.signal,
        });
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
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Auditor dashboard refresh error:", error);
      }
    };

    if (typeof window !== "undefined") {
      const handler = () => {
        void refreshDashboard();
      };
      window.addEventListener("dashboard:data-updated", handler);
      return () => {
        activeController?.abort();
        window.removeEventListener("dashboard:data-updated", handler);
      };
    }

    return () => {
      activeController?.abort();
    };
  }, []);

  useEffect(() => {
    const run = () => setShowDeferredSections(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(run, { timeout: 500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = window.setTimeout(run, 150);
    return () => window.clearTimeout(timerId);
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
      {showDeferredSections && (
        <>
          <PendingReviewsAlert stats={currentStats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReviewStatistics stats={currentStats} />
            <RecentActivity reviews={currentRecentReviews} />
          </div>

          <FacultySubmissionStatus
            facultyMembers={currentFacultyMembers}
            onSelectFaculty={setSelectedFaculty}
          />
        </>
      )}
    </div>
  );
}

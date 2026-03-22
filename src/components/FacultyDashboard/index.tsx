"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { DashboardStats, FacultyMember } from "@/types/faculty";
import { useAuth } from "@/context/AuthContext";

const REFRESH_THROTTLE_MS = 1200;

const FacultyPortfolio = dynamic(
  () => import("./FacultyPortfolio").then((mod) => mod.FacultyPortfolio),
  { ssr: false },
);

const PendingAlerts = dynamic(
  () => import("./PendingAlerts").then((mod) => mod.PendingAlerts),
  { ssr: false },
);

const ActivitySection = dynamic(
  () => import("./ActivitySection").then((mod) => mod.ActivitySection),
  { ssr: false },
);

const AllFacultyMembers = dynamic(
  () => import("./AllFacultyMembers").then((mod) => mod.AllFacultyMembers),
  { ssr: false },
);

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
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  const dashboardKey = `${user?.id ?? ""}:${user?.username ?? ""}`;

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

        const url = user?.username
          ? `/api/dashboard/faculty?username=${encodeURIComponent(user.username)}`
          : "/api/dashboard/faculty";
        const response = await fetch(url, {
          signal: activeController.signal,
        });
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
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Faculty dashboard refresh error:", error);
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
  }, [dashboardKey]);

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
      {showDeferredSections && (
        <>
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
        </>
      )}
    </div>
  );
}

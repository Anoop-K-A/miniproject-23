"use client";

import { useEffect, useMemo, useState } from "react";
import { FacultyDashboard } from "@/components/FacultyDashboard";
import { FacultySectionTabs } from "@/components/faculty/FacultySectionTabs";
import { useAuth } from "@/context/AuthContext";
import type { DashboardStats, FacultyMember } from "@/types/faculty";

const EMPTY_STATS: DashboardStats = {
  totalFiles: 0,
  totalReports: 0,
  pendingReports: 0,
  totalParticipants: 0,
  recentActivity: [],
};

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const requestUrl = useMemo(() => {
    if (!user?.username) {
      return "/api/dashboard/faculty";
    }

    return `/api/dashboard/faculty?username=${encodeURIComponent(user.username)}`;
  }, [user?.username]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(requestUrl, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !isActive) {
          return;
        }

        if (data?.stats) {
          setStats(data.stats);
        }

        if (Array.isArray(data?.facultyMembers)) {
          setFacultyMembers(data.facultyMembers);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Faculty dashboard initial load error:", error);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requestUrl]);

  return (
    <main className="space-y-6">
      <FacultySectionTabs>
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-8 w-56 animate-pulse rounded-md bg-slate-200" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          </div>
        ) : (
          <FacultyDashboard stats={stats} facultyMembers={facultyMembers} />
        )}
      </FacultySectionTabs>
    </main>
  );
}

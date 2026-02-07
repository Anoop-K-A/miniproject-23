"use client";

import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
  const { user } = useAuth();
  const displayName = user?.name ?? "";

  return (
    <div>
      <h2>Faculty Dashboard</h2>
      <p className="text-gray-600">Welcome back, {displayName}</p>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/roles";
import { safelyNavigate } from "@/lib/safeNavigation";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        safelyNavigate(() => router.push(getDashboardPath(userRole)));
      } else {
        safelyNavigate(() => router.push("/login"));
      }
    }
  }, [isAuthenticated, userRole, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}

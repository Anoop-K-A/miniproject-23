"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/roles";
import { safelyNavigate } from "@/lib/safeNavigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRole, isAuthenticated, isLoading, assignedRoles } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !assignedRoles.includes("admin")) {
      safelyNavigate(() => router.replace(getDashboardPath(userRole)));
    }
  }, [isAuthenticated, isLoading, router, userRole, assignedRoles]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {children}
    </div>
  );
}

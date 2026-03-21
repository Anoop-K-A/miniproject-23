"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { RoleSwitcher } from "@/components/App/RoleSwitcher";
import { useRouter } from "next/navigation";
import { getDashboardPath } from "@/lib/roles";
import { safelyNavigate } from "@/lib/safeNavigation";

export default function StaffAdvisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    userRole,
    switchRole,
    isAuthenticated,
    isLoading,
    assignedRoles,
    user,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      !assignedRoles.includes("staff-advisor")
    ) {
      safelyNavigate(() => router.replace(getDashboardPath(userRole)));
    }
  }, [isAuthenticated, isLoading, router, userRole, assignedRoles]);

  const handleRoleChange = (role: typeof userRole) => {
    switchRole(role);
    document.cookie = `auth_role=${role}; path=/`;
    if (user?.username) {
      document.cookie = `auth_user=${user.username}; path=/`;
    }
    safelyNavigate(() => router.push(getDashboardPath(role)));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <RoleSwitcher
        currentRole={userRole}
        assignedRoles={assignedRoles}
        onRoleChange={handleRoleChange}
      />
      {children}
    </div>
  );
}

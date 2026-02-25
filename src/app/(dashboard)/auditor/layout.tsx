"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { RoleSwitcher } from "@/components/App/RoleSwitcher";
import { useRouter } from "next/navigation";
import { getDashboardPath } from "@/lib/roles";

export default function AuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRole, switchRole, isAuthenticated, isLoading, assignedRoles } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !assignedRoles.includes("auditor")) {
      router.replace(getDashboardPath(userRole));
    }
  }, [isAuthenticated, isLoading, router, userRole, assignedRoles]);

  const handleRoleChange = (role: typeof userRole) => {
    switchRole(role);
    document.cookie = `auth_role=${role}; path=/`;
    router.push(getDashboardPath(role));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RoleSwitcher
        currentRole={userRole}
        assignedRoles={assignedRoles}
        onRoleChange={handleRoleChange}
      />
      {children}
    </div>
  );
}

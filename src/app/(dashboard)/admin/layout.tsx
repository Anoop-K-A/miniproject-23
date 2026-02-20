"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/roles";
import { RoleSwitcher } from "@/components/App/RoleSwitcher";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRole, switchRole, isAuthenticated, isLoading, assignedRoles } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !assignedRoles.includes("admin")) {
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

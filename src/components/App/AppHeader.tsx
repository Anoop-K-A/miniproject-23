"use client";

import { UserRole, getRoleInfo } from "@/components/App/config";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  userRole: UserRole;
}

export function AppHeader({ userRole }: AppHeaderProps) {
  const roleInfo = getRoleInfo(userRole);
  const { user, logout } = useAuth();
  const router = useRouter();
  const displayName = user?.name ?? "";
  const department = user?.department ?? "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const handleLogout = () => {
    logout();
    document.cookie = "auth_authenticated=; path=/; max-age=0";
    document.cookie = "auth_role=; path=/; max-age=0";
    document.cookie = "auth_user=; path=/; max-age=0";
    router.replace("/login");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 ${roleInfo.color} rounded-lg flex items-center justify-center`}
            >
              <roleInfo.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">Faculty Management</h1>
              <p className="text-sm text-gray-500">College</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm">{displayName}</p>
              <p className="text-xs text-gray-500">{department}</p>
            </div>
            <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

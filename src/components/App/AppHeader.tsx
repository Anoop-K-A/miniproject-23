"use client";

import { UserRole, getRoleInfo } from "@/components/App/config";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfileDialog } from "@/components/App/ProfileDialog";
import { safelyNavigate } from "@/lib/safeNavigation";

interface AppHeaderProps {
  userRole: UserRole;
}

export function AppHeader({ userRole }: AppHeaderProps) {
  const roleInfo = getRoleInfo(userRole);
  const { user, logout } = useAuth();
  const router = useRouter();
  const displayName = user?.name ?? "User";
  const department = user?.department ?? "College";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    document.cookie = "auth_authenticated=; path=/; max-age=0";
    document.cookie = "auth_role=; path=/; max-age=0";
    document.cookie = "auth_user=; path=/; max-age=0";
    safelyNavigate(() => router.push("/login"));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`h-10 w-10 ${roleInfo.color} rounded-xl text-white flex items-center justify-center font-semibold shadow-sm shrink-0`}
            >
              {initials || "U"}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                Faculty Management
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="truncate">{department}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="truncate font-medium text-slate-700">
                  {roleInfo.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium text-slate-800">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">{department}</p>
            </div>

            <ProfileDialog />

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="inline-flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

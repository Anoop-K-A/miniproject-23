"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserRole, getRoleInfo } from "@/components/App/config";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfileDialog } from "@/components/App/ProfileDialog";
import { safelyNavigate } from "@/lib/safeNavigation";

interface AppHeaderProps {
  userRole: UserRole;
}

interface AuditorMessage {
  id: string;
  facultyId: string;
  auditorId?: string;
  entityType: "course-file" | "event-report" | string;
  entityId: string;
  threadId?: string;
  senderRole?: "auditor" | "faculty" | string;
  senderName?: string;
  message: string;
  createdAt?: string;
}

interface ThreadSummary {
  threadId: string;
  message: string;
  senderRole: string;
  senderName: string;
  entityType: string;
  createdAt?: string;
}

const resolveThreadId = (message: AuditorMessage) =>
  message.threadId ?? `${message.entityType}:${message.entityId}`;

function getUnreadThreadSummaries(
  messages: AuditorMessage[],
  userRole: UserRole,
): ThreadSummary[] {
  const targetSender = userRole === "faculty" ? "auditor" : "faculty";
  const latestByThread = new Map<string, AuditorMessage>();

  for (const message of messages) {
    const threadId = resolveThreadId(message);
    const current = latestByThread.get(threadId);
    const currentTime = new Date(current?.createdAt ?? 0).getTime();
    const nextTime = new Date(message.createdAt ?? 0).getTime();

    if (!current || nextTime >= currentTime) {
      latestByThread.set(threadId, message);
    }
  }

  return [...latestByThread.entries()]
    .map(([threadId, message]) => ({
      threadId,
      message: message.message,
      senderRole: String(message.senderRole ?? ""),
      senderName:
        message.senderName ??
        (message.senderRole === "auditor" ? "Auditor" : "Faculty"),
      entityType: message.entityType,
      createdAt: message.createdAt,
    }))
    .filter((thread) => thread.senderRole === targetSender)
    .sort((a, b) => {
      const aTime = new Date(a.createdAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
}

export function AppHeader({ userRole }: AppHeaderProps) {
  const roleInfo = getRoleInfo(userRole);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadThreads, setUnreadThreads] = useState<ThreadSummary[]>([]);
  const displayName = user?.name ?? "User";
  const department = user?.department ?? "College";
  const showMessageNotifications = useMemo(
    () => userRole === "faculty" || userRole === "auditor",
    [userRole],
  );

  const unreadCount = unreadThreads.length;

  const loadMessageNotifications = useCallback(async () => {
    if (!showMessageNotifications) {
      setUnreadThreads([]);
      return;
    }

    if (userRole === "faculty" && !user?.id) {
      setUnreadThreads([]);
      return;
    }

    try {
      const searchParams = new URLSearchParams();

      if (userRole === "faculty" && user?.id) {
        searchParams.set("facultyId", user.id);
      }

      if (userRole === "auditor" && user?.id) {
        searchParams.set("auditorId", user.id);
      }

      const queryString = searchParams.toString();
      const response = await fetch(
        queryString ? `/api/messages?${queryString}` : "/api/messages",
        {
          cache: "no-store",
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setUnreadThreads([]);
        return;
      }

      const messages = Array.isArray(data.messages)
        ? (data.messages as AuditorMessage[])
        : [];
      setUnreadThreads(getUnreadThreadSummaries(messages, userRole));
    } catch (error) {
      console.error("Message notification load error:", error);
      setUnreadThreads([]);
    }
  }, [showMessageNotifications, userRole, user?.id]);

  useEffect(() => {
    void loadMessageNotifications();

    if (typeof window === "undefined" || !showMessageNotifications) {
      return;
    }

    const onDataUpdated = () => {
      void loadMessageNotifications();
    };

    const intervalId = window.setInterval(() => {
      void loadMessageNotifications();
    }, 30000);

    window.addEventListener("dashboard:data-updated", onDataUpdated);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("dashboard:data-updated", onDataUpdated);
    };
  }, [loadMessageNotifications, showMessageNotifications]);

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

            {showMessageNotifications && (
              <Dialog
                open={showNotifications}
                onOpenChange={setShowNotifications}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="relative"
                  aria-label="Message notifications"
                  onClick={() => setShowNotifications(true)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>New Messages</DialogTitle>
                    <DialogDescription>
                      {unreadCount > 0
                        ? `You have ${unreadCount} unread thread${unreadCount === 1 ? "" : "s"}.`
                        : "No new messages yet."}
                    </DialogDescription>
                  </DialogHeader>
                  {unreadCount > 0 && (
                    <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                      {unreadThreads.map((thread) => (
                        <div
                          key={thread.threadId}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {thread.entityType.replace("-", " ")}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {thread.senderName}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                            {thread.message}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {thread.createdAt
                              ? new Date(thread.createdAt).toLocaleString()
                              : "Recently"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}

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

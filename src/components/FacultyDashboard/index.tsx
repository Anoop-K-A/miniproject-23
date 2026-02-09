"use client";

import { useEffect, useState } from "react";
import { FacultyPortfolio } from "./FacultyPortfolio";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { PendingAlerts } from "./PendingAlerts";
import { ActivitySection } from "./ActivitySection";
import { AllFacultyMembers } from "./AllFacultyMembers";
import { DashboardStats, FacultyMember } from "@/types/faculty";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface FacultyDashboardProps {
  stats: DashboardStats;
  facultyMembers: FacultyMember[];
}

export function FacultyDashboard({
  stats,
  facultyMembers,
}: FacultyDashboardProps) {
  const { user } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(
    null,
  );
  const [currentStats, setCurrentStats] = useState(stats);
  const [currentFacultyMembers, setCurrentFacultyMembers] =
    useState(facultyMembers);
  const [messages, setMessages] = useState<
    {
      id: string;
      facultyId: string;
      auditorId?: string;
      entityType: string;
      entityId: string;
      threadId?: string;
      senderRole?: string;
      senderName?: string;
      message: string;
      status?: string;
      createdAt?: string;
    }[]
  >([]);

  const normalizeThreadId = (message: {
    threadId?: string;
    entityType: string;
    entityId: string;
  }) => message.threadId ?? `${message.entityType}:${message.entityId}`;

  const groupedThreads = messages.reduce<Record<string, typeof messages>>(
    (acc, message) => {
      const threadId = normalizeThreadId(message);
      if (!acc[threadId]) {
        acc[threadId] = [];
      }
      acc[threadId].push({ ...message, threadId });
      return acc;
    },
    {},
  );

  const threads = Object.entries(groupedThreads)
    .map(([threadId, threadMessages]) => {
      const sortedMessages = [...threadMessages].sort((a, b) => {
        const aTime = new Date(a.createdAt ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? 0).getTime();
        return aTime - bTime;
      });
      const lastMessage = sortedMessages[sortedMessages.length - 1];
      return {
        threadId,
        messages: sortedMessages,
        lastMessage,
      };
    })
    .sort((a, b) => {
      const aTime = new Date(a.lastMessage?.createdAt ?? 0).getTime();
      const bTime = new Date(b.lastMessage?.createdAt ?? 0).getTime();
      return bTime - aTime;
    });

  useEffect(() => {
    const refreshDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard/faculty");
        const data = await response.json();
        if (response.ok) {
          if (data?.stats) {
            setCurrentStats(data.stats);
          }
          if (data?.facultyMembers) {
            setCurrentFacultyMembers(data.facultyMembers);
          }
        }

        if (user?.id) {
          const messagesResponse = await fetch(
            `/api/messages?facultyId=${user.id}`,
          );
          const messagesData = await messagesResponse.json();
          if (messagesResponse.ok) {
            setMessages(messagesData.messages ?? []);
          } else {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Faculty dashboard refresh error:", error);
      }
    };

    refreshDashboard();

    if (typeof window !== "undefined") {
      const handler = () => {
        refreshDashboard();
      };
      window.addEventListener("dashboard:data-updated", handler);
      return () => {
        window.removeEventListener("dashboard:data-updated", handler);
      };
    }
  }, [user?.id]);

  if (selectedFaculty) {
    return (
      <FacultyPortfolio
        faculty={selectedFaculty}
        onBack={() => setSelectedFaculty(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsOverview stats={currentStats} />
      <PendingAlerts pendingReports={currentStats.pendingReports} />
      {user?.id && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Auditor Messages</h3>
              <Badge variant="outline">{threads.length}</Badge>
            </div>
            {threads.length === 0 ? (
              <p className="text-sm text-gray-500">No auditor messages yet.</p>
            ) : (
              <div className="space-y-3">
                {threads.map((thread) => (
                  <div
                    key={thread.threadId}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {thread.lastMessage?.entityType === "course-file"
                          ? "Course File"
                          : "Event Report"}
                      </span>
                      {thread.lastMessage?.status && (
                        <Badge variant="secondary">
                          {thread.lastMessage.status}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      {thread.messages.map((msg) => (
                        <div key={msg.id} className="rounded-md bg-white p-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {msg.senderName || msg.senderRole || "Message"}
                            </span>
                            {msg.createdAt && (
                              <span>
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <ActivitySection
        activities={currentStats.recentActivity}
        facultyMembers={currentFacultyMembers}
        onSelectFaculty={setSelectedFaculty}
      />
      <AllFacultyMembers
        facultyMembers={currentFacultyMembers}
        onSelectFaculty={setSelectedFaculty}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { AuditReviewInterface } from "@/components/AuditorDashboard/AuditReviewInterface";
import { BackButton } from "./BackButton";
import { FacultyHeader } from "./FacultyHeader";
import { PortfolioTabs } from "./PortfolioTabs";
import { CourseFile, EventReport, FacultyAuditPortfolioProps } from "./types";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { ResponseDialog } from "@/components/shared/dialogs/ResponseDialog";
import { useAuth } from "@/context/AuthContext";

// Mock data
const courseFileChecklist = [
  { id: "format", label: "Document format is correct and readable" },
  { id: "content", label: "Content is complete and comprehensive" },
];

const eventReportChecklist = [
  { id: "details", label: "Event details are complete and accurate" },
  { id: "objectives", label: "Objectives are clearly stated" },
];

export function FacultyAuditPortfolio({
  faculty,
  onBack,
}: FacultyAuditPortfolioProps) {
  const { user } = useAuth();
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<CourseFile | null>(null);
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(
    null,
  );
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewType, setReviewType] = useState<"file" | "report">("file");
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [eventReports, setEventReports] = useState<EventReport[]>([]);
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
        return bTime - aTime;
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

  const fileNameById = courseFiles.reduce<Record<string, string>>(
    (acc, file) => {
      acc[file.id] = file.fileName;
      return acc;
    },
    {},
  );

  const reportNameById = eventReports.reduce<Record<string, string>>(
    (acc, report) => {
      acc[report.id] = report.eventName;
      return acc;
    },
    {},
  );

  const groupedByFile = threads.reduce<
    Record<
      string,
      {
        fileId: string;
        fileName: string;
        threads: typeof threads;
      }
    >
  >((acc, thread) => {
    if (thread.lastMessage?.entityType !== "course-file") {
      return acc;
    }
    const fileId = thread.lastMessage.entityId;
    const fileName = fileNameById[fileId] ?? "Course File";
    if (!acc[fileId]) {
      acc[fileId] = { fileId, fileName, threads: [] };
    }
    acc[fileId].threads.push(thread);
    return acc;
  }, {});

  Object.values(groupedByFile).forEach((group) => {
    group.threads.sort((a, b) => {
      const aTime = new Date(a.lastMessage?.createdAt ?? 0).getTime();
      const bTime = new Date(b.lastMessage?.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
  });

  const groupedByReport = threads.reduce<
    Record<
      string,
      {
        reportId: string;
        reportName: string;
        threads: typeof threads;
      }
    >
  >((acc, thread) => {
    if (thread.lastMessage?.entityType !== "event-report") {
      return acc;
    }
    const reportId = thread.lastMessage.entityId;
    const reportName = reportNameById[reportId] ?? "Event Report";
    if (!acc[reportId]) {
      acc[reportId] = { reportId, reportName, threads: [] };
    }
    acc[reportId].threads.push(thread);
    return acc;
  }, {});

  Object.values(groupedByReport).forEach((group) => {
    group.threads.sort((a, b) => {
      const aTime = new Date(a.lastMessage?.createdAt ?? 0).getTime();
      const bTime = new Date(b.lastMessage?.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
  });

  const fileThreadGroups = Object.values(groupedByFile).sort((a, b) => {
    const aLast = a.threads[0]?.lastMessage?.createdAt ?? 0;
    const bLast = b.threads[0]?.lastMessage?.createdAt ?? 0;
    return new Date(bLast).getTime() - new Date(aLast).getTime();
  });

  const reportThreadGroups = Object.values(groupedByReport).sort((a, b) => {
    const aLast = a.threads[0]?.lastMessage?.createdAt ?? 0;
    const bLast = b.threads[0]?.lastMessage?.createdAt ?? 0;
    return new Date(bLast).getTime() - new Date(aLast).getTime();
  });

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const [filesResponse, reportsResponse, messagesResponse] =
          await Promise.all([
            fetch("/api/course-files"),
            fetch("/api/event-reports"),
            fetch(`/api/messages?facultyId=${faculty.id}`),
          ]);

        const filesData = await filesResponse.json();
        const reportsData = await reportsResponse.json();
        const messagesData = await messagesResponse.json();

        if (!filesResponse.ok || !reportsResponse.ok || !messagesResponse.ok) {
          return;
        }

        const scopedFiles: CourseFile[] = (filesData.files ?? []).filter(
          (file: CourseFile) => file.facultyId === faculty.id,
        );
        const scopedReports: EventReport[] = (reportsData.reports ?? []).filter(
          (report: EventReport) => report.facultyId === faculty.id,
        );

        setCourseFiles(scopedFiles);
        setEventReports(scopedReports);
        setMessages(messagesData.messages ?? []);
      } catch (error) {
        console.error("Load faculty portfolio error:", error);
      }
    };

    loadPortfolioData();

    if (typeof window !== "undefined") {
      const handler = () => {
        loadPortfolioData();
      };
      window.addEventListener("dashboard:data-updated", handler);
      return () => {
        window.removeEventListener("dashboard:data-updated", handler);
      };
    }
  }, [faculty.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Submitted":
        return "bg-blue-100 text-blue-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleReviewFile = (file: CourseFile) => {
    setSelectedFile(file);
    setReviewType("file");
    setIsReviewOpen(true);
  };

  const handleReviewReport = (report: EventReport) => {
    setSelectedReport(report);
    setReviewType("report");
    setIsReviewOpen(true);
  };

  const handleReviewCompleted = (updatedItem: CourseFile | EventReport) => {
    if (reviewType === "file") {
      setCourseFiles((prev) =>
        prev.map((file) =>
          file.id === updatedItem.id ? (updatedItem as CourseFile) : file,
        ),
      );
      setSelectedFile(updatedItem as CourseFile);
    } else {
      setEventReports((prev) =>
        prev.map((report) =>
          report.id === updatedItem.id ? (updatedItem as EventReport) : report,
        ),
      );
      setSelectedReport(updatedItem as EventReport);
    }
  };

  const activeThread =
    threads.find((thread) => thread.threadId === activeThreadId) ?? null;

  const handleReplySubmit = async (response: string) => {
    if (!user?.id || !activeThread) return;

    const baseMessage = activeThread.messages[0];
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyId: faculty.id,
        auditorId: user.id,
        entityType: baseMessage.entityType,
        entityId: baseMessage.entityId,
        threadId: activeThread.threadId,
        senderRole: "auditor",
        senderName: user.name,
        message: response,
      }),
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dashboard:data-updated"));
    }
  };

  const handleResolveThread = async (threadId: string) => {
    await fetch(`/api/messages?threadId=${threadId}`, { method: "DELETE" });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dashboard:data-updated"));
    }
  };

  if (isReviewOpen && (selectedFile || selectedReport)) {
    return (
      <AuditReviewInterface
        type={reviewType}
        item={reviewType === "file" ? selectedFile! : selectedReport!}
        facultyName={faculty.name}
        facultyId={faculty.id}
        onBack={() => setIsReviewOpen(false)}
        onReviewCompleted={handleReviewCompleted}
      />
    );
  }

  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <FacultyHeader faculty={faculty} />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Auditor Messages</h3>
            <Badge variant="outline">{threads.length}</Badge>
          </div>
          {fileThreadGroups.length === 0 && reportThreadGroups.length === 0 ? (
            <p className="text-sm text-gray-500">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {fileThreadGroups.map((group) => (
                <div key={group.fileId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{group.fileName}</p>
                      <p className="text-xs text-gray-500">Course File</p>
                    </div>
                    <Badge variant="outline">
                      {group.threads.reduce(
                        (count, thread) => count + thread.messages.length,
                        0,
                      )}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-3">
                    {group.threads.map((thread) => (
                      <div
                        key={thread.threadId}
                        className="rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Thread</span>
                          <div className="flex items-center gap-2">
                            {thread.lastMessage?.status && (
                              <Badge variant="secondary">
                                {thread.lastMessage.status}
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveThreadId(thread.threadId);
                                setIsReplyOpen(true);
                              }}
                            >
                              Reply
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleResolveThread(thread.threadId)
                              }
                            >
                              OK
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {thread.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className="rounded-md bg-white p-2"
                            >
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  {msg.senderName ||
                                    msg.senderRole ||
                                    "Message"}
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
                </div>
              ))}
              {reportThreadGroups.map((group) => (
                <div key={group.reportId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{group.reportName}</p>
                      <p className="text-xs text-gray-500">Event Report</p>
                    </div>
                    <Badge variant="outline">
                      {group.threads.reduce(
                        (count, thread) => count + thread.messages.length,
                        0,
                      )}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-3">
                    {group.threads.map((thread) => (
                      <div
                        key={thread.threadId}
                        className="rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Thread</span>
                          <div className="flex items-center gap-2">
                            {thread.lastMessage?.status && (
                              <Badge variant="secondary">
                                {thread.lastMessage.status}
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveThreadId(thread.threadId);
                                setIsReplyOpen(true);
                              }}
                            >
                              Reply
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleResolveThread(thread.threadId)
                              }
                            >
                              OK
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {thread.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className="rounded-md bg-white p-2"
                            >
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  {msg.senderName ||
                                    msg.senderRole ||
                                    "Message"}
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <PortfolioTabs
        courseFiles={courseFiles}
        eventReports={eventReports}
        onReviewFile={handleReviewFile}
        onReviewReport={handleReviewReport}
        getStatusColor={getStatusColor}
      />
      <ResponseDialog
        open={isReplyOpen}
        onOpenChange={setIsReplyOpen}
        onSubmit={handleReplySubmit}
        itemType={
          activeThread?.lastMessage?.entityType === "course-file"
            ? "file"
            : "report"
        }
      />
    </div>
  );
}

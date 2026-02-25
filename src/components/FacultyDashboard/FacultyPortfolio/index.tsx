import { useEffect, useState } from "react";
import { BackButton } from "./BackButton";
import { ProfileHeader } from "./ProfileHeader";
import { PortfolioTabs } from "./PortfolioTabs";
import { FileViewDialog } from "./FileViewDialog";
import { ReportViewDialog } from "./ReportViewDialog";
import {
  CourseFile,
  EventReport,
  FacultyPortfolioProps,
  Student,
} from "./types";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { useAuth } from "@/context/AuthContext";

export function FacultyPortfolio({ faculty, onBack }: FacultyPortfolioProps) {
  const { user, userRole } = useAuth();
  const showStudents = faculty.isStaffAdvisor === true;
  const [selectedFile, setSelectedFile] = useState<CourseFile | null>(null);
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(
    null,
  );
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [isReportViewOpen, setIsReportViewOpen] = useState(false);
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [eventReports, setEventReports] = useState<EventReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<
    {
      id: string;
      facultyId: string;
      auditorId?: string;
      entityType: string;
      entityId: string;
      message: string;
      status?: string;
      createdAt?: string;
    }[]
  >([]);
  const canViewMessages = userRole !== "faculty";

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const requests = [
          fetch("/api/course-files"),
          fetch("/api/event-reports"),
        ];
        if (showStudents) {
          requests.push(fetch("/api/students"));
        }
        const responses = await Promise.all(requests);

        const filesResponse = responses[0];
        const reportsResponse = responses[1];
        const studentsResponse = responses[2];

        const filesData = await filesResponse.json();
        const reportsData = await reportsResponse.json();
        const studentsData = studentsResponse
          ? await studentsResponse.json()
          : null;

        if (!filesResponse.ok || !reportsResponse.ok) {
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

        if (showStudents && studentsResponse?.ok) {
          const allStudents: Student[] = studentsData?.students ?? [];
          const advisorStudents = allStudents.filter(
            (student) => student.advisorId === faculty.id,
          );
          const scopedStudents =
            advisorStudents.length > 0
              ? advisorStudents
              : allStudents.filter(
                  (student) =>
                    student.department?.toLowerCase() ===
                    faculty.department.toLowerCase(),
                );
          setStudents(scopedStudents);
        } else {
          setStudents([]);
        }

        if (canViewMessages) {
          const messagesResponse = await fetch(
            `/api/messages?facultyId=${faculty.id}`,
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
  }, [faculty.id, faculty.department, showStudents, canViewMessages]);

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

  const handleViewFile = (file: CourseFile) => {
    setSelectedFile(file);
    setIsFileViewOpen(true);
  };

  const handleViewReport = (report: EventReport) => {
    setSelectedReport(report);
    setIsReportViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <ProfileHeader faculty={faculty} />
      {canViewMessages && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Auditor Messages</h3>
              <Badge variant="outline">{messages.length}</Badge>
            </div>
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">No auditor messages yet.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {msg.entityType === "course-file"
                          ? "Course File"
                          : "Event Report"}
                      </span>
                      {msg.status && (
                        <Badge variant="secondary">{msg.status}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{msg.message}</p>
                    {msg.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <PortfolioTabs
        courseFiles={courseFiles}
        eventReports={eventReports}
        students={students}
        showStudents={showStudents}
        onViewFile={handleViewFile}
        onViewReport={handleViewReport}
        getStatusColor={getStatusColor}
      />

      <FileViewDialog
        open={isFileViewOpen}
        onOpenChange={setIsFileViewOpen}
        file={selectedFile}
        getStatusColor={getStatusColor}
      />

      <ReportViewDialog
        open={isReportViewOpen}
        onOpenChange={setIsReportViewOpen}
        report={selectedReport}
        getStatusColor={getStatusColor}
      />
    </div>
  );
}

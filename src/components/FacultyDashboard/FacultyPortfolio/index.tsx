import { useEffect, useState } from "react";
import { BackButton } from "./BackButton";
import { ProfileHeader } from "./ProfileHeader";
import { PortfolioTabs } from "./PortfolioTabs";
import { FileViewDialog } from "./FileViewDialog";
import { ReportViewDialog } from "./ReportViewDialog";
import { CourseFile, EventReport, FacultyPortfolioProps } from "./types";

export function FacultyPortfolio({ faculty, onBack }: FacultyPortfolioProps) {
  const [selectedFile, setSelectedFile] = useState<CourseFile | null>(null);
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(
    null,
  );
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [isReportViewOpen, setIsReportViewOpen] = useState(false);
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [eventReports, setEventReports] = useState<EventReport[]>([]);

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const [filesResponse, reportsResponse] = await Promise.all([
          fetch("/api/course-files"),
          fetch("/api/event-reports"),
        ]);

        const filesData = await filesResponse.json();
        const reportsData = await reportsResponse.json();

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
      } catch (error) {
        console.error("Load faculty portfolio error:", error);
      }
    };

    loadPortfolioData();
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
      <PortfolioTabs
        courseFiles={courseFiles}
        eventReports={eventReports}
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

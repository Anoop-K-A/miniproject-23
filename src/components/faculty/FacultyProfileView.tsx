"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FacultyMember } from "@/types/faculty";
import type {
  CourseFile,
  EventReport,
} from "@/components/FacultyDashboard/FacultyPortfolio/types";
import { ProfileHeader } from "@/components/FacultyDashboard/FacultyPortfolio/ProfileHeader";
import { PortfolioTabs } from "@/components/FacultyDashboard/FacultyPortfolio/PortfolioTabs";
import { FileViewDialog } from "@/components/FacultyDashboard/FacultyPortfolio/FileViewDialog";
import { ReportViewDialog } from "@/components/FacultyDashboard/FacultyPortfolio/ReportViewDialog";

interface FacultyProfileViewProps {
  faculty: FacultyMember;
  courseFiles: CourseFile[];
  eventReports: EventReport[];
}

export function FacultyProfileView({
  faculty: initialFaculty,
  courseFiles: initialCourseFiles,
  eventReports: initialEventReports,
}: FacultyProfileViewProps) {
  const [selectedFile, setSelectedFile] = useState<CourseFile | null>(null);
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(
    null,
  );
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [isReportViewOpen, setIsReportViewOpen] = useState(false);
  const [courseFiles, setCourseFiles] = useState(initialCourseFiles);
  const [eventReports, setEventReports] = useState(initialEventReports);
  const [faculty, setFaculty] = useState(initialFaculty);
  const [isLoading, setIsLoading] = useState(false);

  // Load additional faculty profile data on client side
  useEffect(() => {
    const loadFacultyProfile = async () => {
      try {
        const response = await fetch(
          `/api/profile?userId=${encodeURIComponent(faculty.id)}`,
          {
            cache: "no-store",
          },
        );
        const data = (await response.json()) as {
          user?: {
            name?: string;
            department?: string;
            email?: string;
            phone?: string;
            experience?: string;
            profileImageUrl?: string;
            resumeUrl?: string;
            resumeFileName?: string;
          };
        };

        if (response.ok && data.user) {
          setFaculty((prev) => ({
            ...prev,
            name: data.user?.name ?? prev.name,
            department: data.user?.department ?? prev.department,
            email: data.user?.email ?? prev.email,
            phone: data.user?.phone ?? prev.phone,
            experience: data.user?.experience ?? prev.experience,
            profileImageUrl: data.user?.profileImageUrl ?? "",
            resumeUrl: data.user?.resumeUrl ?? "",
            resumeFileName: data.user?.resumeFileName ?? "",
          }));
        }
      } catch (error) {
        console.error("Load faculty profile error:", error);
      }
    };

    loadFacultyProfile();
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
      {/* Back Button */}
      <div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <ProfileHeader faculty={faculty} />

      {/* Portfolio Tabs */}
      <PortfolioTabs
        courseFiles={courseFiles}
        eventReports={eventReports}
        courseFilesPage={1}
        eventReportsPage={1}
        pageSize={10}
        totalCourseFiles={courseFiles.length}
        totalEventReports={eventReports.length}
        onCourseFilesPageChange={() => {}}
        onEventReportsPageChange={() => {}}
        students={[]}
        showStudents={false}
        onViewFile={handleViewFile}
        onViewReport={handleViewReport}
        getStatusColor={getStatusColor}
      />

      {/* File View Dialog */}
      <FileViewDialog
        open={isFileViewOpen}
        onOpenChange={setIsFileViewOpen}
        file={selectedFile}
        getStatusColor={getStatusColor}
      />

      {/* Report View Dialog */}
      <ReportViewDialog
        open={isReportViewOpen}
        onOpenChange={setIsReportViewOpen}
        report={selectedReport}
        getStatusColor={getStatusColor}
      />

      {/* No Data Message */}
      {courseFiles.length === 0 && eventReports.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No course files or event reports available yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

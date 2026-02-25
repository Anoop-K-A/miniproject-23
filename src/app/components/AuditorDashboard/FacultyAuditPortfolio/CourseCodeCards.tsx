import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  FileText,
  Eye,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { CourseFile } from "./types";

interface CourseCodeCardsProps {
  courseFiles: CourseFile[];
  onReviewFile: (file: CourseFile) => void;
  getStatusColor: (status: string) => string;
}

// Helper function to group files by course code
const groupByCourseCode = (files: CourseFile[]) => {
  const grouped: Record<string, CourseFile[]> = {};

  files.forEach((file) => {
    const courseCode = file.courseCode || "Unknown";
    if (!grouped[courseCode]) {
      grouped[courseCode] = [];
    }
    grouped[courseCode].push(file);
  });

  return grouped;
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Approved":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "Rejected":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "Pending":
    case "Submitted":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

export function CourseCodeCards({
  courseFiles,
  onReviewFile,
  getStatusColor,
}: CourseCodeCardsProps) {
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const groupedFiles = groupByCourseCode(courseFiles);
  const courseCodes = Object.keys(groupedFiles).sort();

  const toggleExpand = (courseCode: string) => {
    setExpandedCodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseCode)) {
        newSet.delete(courseCode);
      } else {
        newSet.add(courseCode);
      }
      return newSet;
    });
  };

  if (courseCodes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No course files available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {courseCodes.map((courseCode) => {
        const files = groupedFiles[courseCode];
        const approvedCount = files.filter(
          (f) => f.status === "Approved",
        ).length;
        const pendingCount = files.filter(
          (f) => f.status === "Pending" || f.status === "Submitted",
        ).length;
        const rejectedCount = files.filter(
          (f) => f.status === "Rejected",
        ).length;
        const needsReviewCount = files.filter(
          (f) => f.status === "Submitted" || f.status === "Pending",
        ).length;

        // Get course name from first file
        const courseName = files[0]?.courseName || courseCode;
        const isExpanded = expandedCodes.has(courseCode);

        return (
          <Card
            key={courseCode}
            className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow"
          >
            <CardHeader
              className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(courseCode)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {courseCode}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{courseName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {files.length} {files.length === 1 ? "File" : "Files"}
                  </Badge>
                  {needsReviewCount > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {needsReviewCount} To Review
                    </Badge>
                  )}
                  {approvedCount > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {approvedCount}
                    </Badge>
                  )}
                  {rejectedCount > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      {rejectedCount}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getStatusIcon(file.status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {file.fileName}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {file.fileType}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(file.uploadDate).toLocaleDateString()}
                            </span>
                            {file.semester && <span>{file.semester}</span>}
                          </div>
                          {file.auditorRemarks && (
                            <p className="text-xs text-gray-600 mt-1 italic">
                              Remarks: {file.auditorRemarks}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(file.status)}>
                          {file.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Button
                          size="sm"
                          variant={
                            file.status === "Submitted" ||
                            file.status === "Pending"
                              ? "default"
                              : "outline"
                          }
                          onClick={() => onReviewFile(file)}
                          className="h-8 px-3"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {file.status === "Submitted" ||
                          file.status === "Pending"
                            ? "Review"
                            : "View"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

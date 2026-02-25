"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseFile } from "./types";
import { cn } from "@/components/ui/utils";

interface TreeViewProps {
  files: CourseFile[];
  onView?: (file: CourseFile) => void;
  onDownload?: (file: CourseFile) => void;
  onDelete?: (file: CourseFile) => void;
  canDelete?: boolean;
}

interface CourseFolder {
  courseCode: string;
  courseName: string;
  files: CourseFile[];
}

export function TreeView({
  files,
  onView,
  onDownload,
  onDelete,
  canDelete = false,
}: TreeViewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  // Group files by course code
  const courseFolders: CourseFolder[] = files.reduce((acc, file) => {
    const existingFolder = acc.find((f) => f.courseCode === file.courseCode);
    if (existingFolder) {
      existingFolder.files.push(file);
    } else {
      acc.push({
        courseCode: file.courseCode,
        courseName: file.courseName,
        files: [file],
      });
    }
    return acc;
  }, [] as CourseFolder[]);

  // Sort folders by course code
  courseFolders.sort((a, b) => a.courseCode.localeCompare(b.courseCode));

  const toggleFolder = (courseCode: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(courseCode)) {
      newExpanded.delete(courseCode);
    } else {
      newExpanded.add(courseCode);
    }
    setExpandedFolders(newExpanded);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (courseFolders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Folder className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg">No course files found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {courseFolders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.courseCode);
        return (
          <div
            key={folder.courseCode}
            className="border rounded-lg overflow-hidden"
          >
            {/* Folder Header */}
            <div
              className={cn(
                "flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                isExpanded && "bg-gray-50",
              )}
              onClick={() => toggleFolder(folder.courseCode)}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <Folder
                className={cn(
                  "h-5 w-5",
                  isExpanded ? "text-blue-500" : "text-gray-400",
                )}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {folder.courseCode}
                  </span>
                  <span className="text-sm text-gray-500">
                    {folder.courseName}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="ml-auto">
                {folder.files.length}{" "}
                {folder.files.length === 1 ? "file" : "files"}
              </Badge>
            </div>

            {/* Files List */}
            {isExpanded && (
              <div className="bg-gray-50 border-t">
                {folder.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 p-3 pl-12 hover:bg-white transition-colors border-b last:border-b-0"
                  >
                    <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {file.fileName}
                        </p>
                        {file.status && (
                          <Badge
                            className={cn(
                              "text-xs",
                              getStatusColor(file.status),
                            )}
                          >
                            {file.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{file.fileType}</span>
                        <span>•</span>
                        <span>
                          {file.semester} {file.academicYear}
                        </span>
                        <span>•</span>
                        <span>{file.uploadDate}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(file)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onDownload && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownload(file)}
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(file)}
                          title="Delete file"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

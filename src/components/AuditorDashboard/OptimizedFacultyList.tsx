"use client";

import { useMemo, useState, useCallback } from "react";
import { VirtualList } from "@/components/shared/VirtualList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  department: string;
  totalFiles: number;
  totalReports: number;
  approvedFiles?: number;
  pendingFiles?: number;
}

interface OptimizedFacultyListProps {
  facultyMembers: FacultyMember[];
  onSelectFaculty: (faculty: FacultyMember) => void;
  isLoading?: boolean;
}

export function OptimizedFacultyList({
  facultyMembers,
  onSelectFaculty,
  isLoading = false,
}: OptimizedFacultyListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) {
      return facultyMembers;
    }

    const needle = searchTerm.toLowerCase();
    return facultyMembers.filter(
      (faculty) =>
        faculty.name.toLowerCase().includes(needle) ||
        faculty.department.toLowerCase().includes(needle),
    );
  }, [facultyMembers, searchTerm]);

  const renderFacultyItem = useCallback(
    (faculty: FacultyMember) => (
      <button
        onClick={() => onSelectFaculty(faculty)}
        className="w-full px-4 py-3 border rounded-lg bg-white text-left hover:bg-gray-50 transition-colors"
        type="button"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 truncate">
              {faculty.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {faculty.department || "N/A"}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                Files: {faculty.totalFiles}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Reports: {faculty.totalReports}
              </Badge>
              {faculty.approvedFiles !== undefined && (
                <Badge className="text-xs bg-green-100 text-green-800">
                  Approved: {faculty.approvedFiles}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </button>
    ),
    [onSelectFaculty],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading faculty members...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (filteredMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No faculty found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "No faculty members available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <CardTitle>Faculty Members ({filteredMembers.length})</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMembers.length > 15 ? (
          <VirtualList
            items={filteredMembers}
            itemHeight={100}
            containerHeight={600}
            gap={8}
            renderItem={renderFacultyItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((faculty) => (
              <div key={faculty.id}>{renderFacultyItem(faculty)}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

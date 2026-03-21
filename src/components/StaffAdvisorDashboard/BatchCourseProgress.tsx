import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type {
  BatchCourseGroup,
  BatchCourseProgress,
  BatchFacultySummary,
} from "./types";

interface BatchCourseProgressProps {
  groups: BatchCourseGroup[];
}

export function BatchCourseProgress({ groups }: BatchCourseProgressProps) {
  const [selectedFaculty, setSelectedFaculty] =
    useState<BatchFacultySummary | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Course File Progress</CardTitle>
        <CardDescription>Individual batch completion tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No batches found. Add students to see course file progress.
          </p>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div
                key={group.progress.batchYear}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                {/* Left: Batch Progress */}
                <div className="lg:col-span-2 space-y-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        Batch {group.progress.batchYear || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.progress.totalFiles} files tracked
                      </p>
                    </div>
                    <Badge variant="outline" className="font-semibold">
                      {group.progress.completionRate}% approved
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${group.progress.completionRate}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">
                      Total {group.progress.totalFiles}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      Approved {group.progress.approvedFiles}
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      In Review {group.progress.inReviewFiles}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800">
                      Rejected {group.progress.rejectedFiles}
                    </Badge>
                  </div>
                </div>

                {/* Right: Faculty List */}
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700">
                      Faculty Teaching
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {group.faculty.length}
                    </Badge>
                  </div>
                  {group.faculty.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-2">
                      No faculty assigned
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-50 overflow-y-auto">
                      {group.faculty.map((member) => (
                        <button
                          key={member.id}
                          className="flex w-full items-start gap-2 rounded-md p-2 text-left transition-colors hover:bg-gray-50"
                          type="button"
                          onClick={() => setSelectedFaculty(member)}
                        >
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {member.department}
                            </p>
                            <div className="flex gap-1 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0 h-4"
                              >
                                {member.filesTotal} files
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0 h-4"
                              >
                                View profile
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog
        open={Boolean(selectedFaculty)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFaculty(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          {selectedFaculty && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFaculty.name}</DialogTitle>
                <DialogDescription>
                  Faculty profile for this batch
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium text-gray-800">
                      {selectedFaculty.department || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium text-gray-800">
                      {selectedFaculty.role || "Faculty"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-800 break-all">
                      {selectedFaculty.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">
                      {selectedFaculty.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Specialization</p>
                  <p className="font-medium text-gray-800">
                    {selectedFaculty.specialization || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="font-medium text-gray-800">
                    {selectedFaculty.experience || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Courses</p>
                  <p className="font-medium text-gray-800">
                    {selectedFaculty.courses &&
                    selectedFaculty.courses.length > 0
                      ? selectedFaculty.courses.join(", ")
                      : "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Badge variant="outline">
                    Total files: {selectedFaculty.filesTotal}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    Approved: {selectedFaculty.filesApproved}
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    In review: {selectedFaculty.filesInReview}
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    Rejected: {selectedFaculty.filesRejected}
                  </Badge>
                </div>

                {selectedFaculty.resumeUrl ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <a
                      href={selectedFaculty.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Resume
                    </a>
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

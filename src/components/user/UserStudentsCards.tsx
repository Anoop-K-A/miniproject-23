"use client";

import { useMemo, useState, useCallback, memo } from "react";
import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Target,
  UserRound,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface UserStudentRecord {
  id: string;
  name: string;
  rollNumber?: string;
  email?: string;
  phone?: string;
  department?: string;
  semester?: string;
  batchYear?: string;
  cgpa?: number;
  attendance?: number;
  careerInterest?: string;
  skillsAcquired?: string[];
  placementStatus?: "Placed" | "In Process" | "Not Started" | string;
  companyName?: string;
  activityPoints?: number;
  activities?: Array<{
    id?: string;
    name?: string;
    points?: number;
    community?: string;
    date?: string;
  }>;
}

export interface UserStudentBatchGroup {
  batch: string;
  students: UserStudentRecord[];
}

interface UserStudentsCardsProps {
  batchGroups: UserStudentBatchGroup[];
}

function getPlacementColor(status?: string) {
  switch (String(status || "Not Started")) {
    case "Placed":
      return "bg-green-100 text-green-800";
    case "In Process":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function UserStudentsCards({ batchGroups }: UserStudentsCardsProps) {
  const [selectedStudent, setSelectedStudent] =
    useState<UserStudentRecord | null>(null);

  const hasStudents = useMemo(
    () => batchGroups.some((group) => group.students.length > 0),
    [batchGroups],
  );

  const handleSelectStudent = useCallback((student: UserStudentRecord) => {
    setSelectedStudent(student);
  }, []);

  const handleCloseDialog = useCallback((open: boolean) => {
    if (!open) {
      setSelectedStudent(null);
    }
  }, []);

  if (!hasStudents) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-800">
          No students available yet
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Students added by staff advisors will appear here by batch.
        </p>
      </div>
    );
  }

  return (
    <>
      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-slate-900">Students</CardTitle>
          <p className="text-sm text-slate-600">
            Click a student card to view the full profile details.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batchGroups.map((group) => (
              <details
                key={group.batch}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500 group-open:hidden">
                      [+]
                    </span>
                    <span className="font-mono text-xs text-slate-500 hidden group-open:inline">
                      [-]
                    </span>
                    <span>Batch {group.batch}</span>
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {group.students.length} student
                    {group.students.length === 1 ? "" : "s"}
                  </Badge>
                </summary>

                <div className="bg-white px-4 py-3">
                  <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {group.students.map((student) => (
                      <li key={student.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectStudent(student)}
                          className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 bg-linear-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                                {student.name
                                  .split(" ")
                                  .map((part) => part[0])
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase() || "S"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {student.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {student.rollNumber || "Roll: N/A"}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={getPlacementColor(
                                student.placementStatus,
                              )}
                            >
                              {student.placementStatus || "Not Started"}
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p className="inline-flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-slate-500" />
                              {student.department || "N/A"}
                            </p>
                            <p className="inline-flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-slate-500" />
                              Semester: {student.semester || "N/A"}
                            </p>
                            <p className="inline-flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-slate-500" />
                              {student.companyName
                                ? `Placed at ${student.companyName}`
                                : "Student Profile: View Only"}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedStudent)} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>
              Complete information and progress tracking (read-only)
            </DialogDescription>
          </DialogHeader>

          {selectedStudent ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-linear-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl shrink-0">
                  {selectedStudent.name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-gray-600">
                    {selectedStudent.rollNumber || "N/A"} •{" "}
                    {selectedStudent.department || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Batch {selectedStudent.batchYear || "Not set"}
                  </p>
                  <Badge
                    className={
                      getPlacementColor(selectedStudent.placementStatus) +
                      " mt-2"
                    }
                  >
                    {selectedStudent.placementStatus || "Not Started"}
                  </Badge>
                  {selectedStudent.companyName ? (
                    <p className="text-sm text-green-600 mt-2">
                      <Briefcase className="h-4 w-4 inline mr-1" />
                      Placed at {selectedStudent.companyName}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedStudent.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedStudent.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Academic Performance</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">CGPA</p>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {Number.isFinite(selectedStudent.cgpa)
                        ? selectedStudent.cgpa
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Attendance</p>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {Number.isFinite(selectedStudent.attendance)
                        ? `${selectedStudent.attendance}%`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Career Development</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Career Interest</p>
                    <Badge variant="outline" className="mt-1">
                      <Target className="h-3 w-3 mr-1" />
                      {selectedStudent.careerInterest || "Not set"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Skills Acquired
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {!selectedStudent.skillsAcquired ||
                      selectedStudent.skillsAcquired.length === 0 ? (
                        <Badge variant="outline" className="bg-gray-50">
                          Not set
                        </Badge>
                      ) : (
                        selectedStudent.skillsAcquired.map((skill, idx) => (
                          <Badge
                            key={`${skill}-${idx}`}
                            variant="outline"
                            className="bg-blue-50"
                          >
                            {skill}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Activity Points</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Total Points</p>
                    <Badge variant="outline" className="mt-1">
                      <Award className="h-3 w-3 mr-1" />
                      {selectedStudent.activityPoints ?? 0}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Activities</p>
                    <div className="flex flex-wrap gap-2">
                      {!selectedStudent.activities ||
                      selectedStudent.activities.length === 0 ? (
                        <Badge variant="outline" className="bg-gray-50">
                          No activities recorded
                        </Badge>
                      ) : (
                        selectedStudent.activities.map((activity, idx) => (
                          <Badge
                            key={`${activity.name || "activity"}-${idx}`}
                            variant="outline"
                            className="bg-blue-50"
                          >
                            {activity.name || "Activity"} (
                            {activity.points ?? 0} points)
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedStudent(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(UserStudentsCards);

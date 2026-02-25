import { useMemo, useState } from "react";
import { Search, Target, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import type { Student } from "./types";
import { StudentDetailDialogReadOnly } from "./StudentDetailDialogReadOnly";

interface StudentListTabProps {
  students: Student[];
}

const getPlacementColor = (status: Student["placementStatus"]) => {
  switch (status) {
    case "Placed":
      return "bg-green-100 text-green-800";
    case "In Process":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function StudentListTab({ students }: StudentListTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(
    new Set(students.map((s) => s.batchYear).filter(Boolean)),
  );

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.careerInterest
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    [students, searchTerm],
  );

  const groupedStudents = useMemo(() => {
    const groups: Record<string, Student[]> = {};
    filteredStudents.forEach((student) => {
      const batch = student.batchYear || "Unknown";
      if (!groups[batch]) {
        groups[batch] = [];
      }
      groups[batch].push(student);
    });
    return Object.entries(groups)
      .sort(([batchA], [batchB]) => batchB.localeCompare(batchA))
      .map(([batch, students]) => ({
        batch,
        students: students.sort((a, b) =>
          a.rollNumber.localeCompare(b.rollNumber),
        ),
      }));
  }, [filteredStudents]);

  const toggleBatch = (batch: string) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batch)) {
      newExpanded.delete(batch);
    } else {
      newExpanded.add(batch);
    }
    setExpandedBatches(newExpanded);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student List - Grouped by Batch</CardTitle>
            <CardDescription>
              Manage and track student progress and placements
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" disabled>
            View Only
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, roll number, or career interest..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No students assigned yet.
          </p>
        ) : (
          <div className="space-y-4">
            {groupedStudents.map(({ batch, students: batchStudents }) => (
              <div key={batch} className="border rounded-lg overflow-hidden">
                {/* Batch Header */}
                <button
                  onClick={() => toggleBatch(batch)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-blue-900">
                      Batch {batch}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-200 text-blue-800"
                    >
                      {batchStudents.length} student
                      {batchStudents.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="text-blue-900">
                    {expandedBatches.has(batch) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {/* Batch Students */}
                {expandedBatches.has(batch) && (
                  <div className="space-y-2 p-4 bg-white">
                    {batchStudents.map((student) => (
                      <Card
                        key={student.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewDetails(student)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0 text-sm font-medium">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">
                                    {student.name}
                                  </p>
                                  <Badge
                                    className={getPlacementColor(
                                      student.placementStatus,
                                    )}
                                  >
                                    {student.placementStatus}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {student.rollNumber} • {student.semester}{" "}
                                  Semester
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-center hidden sm:block">
                                <p className="text-xs text-gray-500">CGPA</p>
                                <p className="text-sm font-medium">
                                  {student.cgpa}
                                </p>
                              </div>
                              <div className="text-center hidden md:block">
                                <p className="text-xs text-gray-500">
                                  Attendance
                                </p>
                                <p className="text-sm font-medium">
                                  {student.attendance}%
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <StudentDetailDialogReadOnly
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        student={selectedStudent}
      />
    </Card>
  );
}

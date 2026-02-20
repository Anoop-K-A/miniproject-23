import { useMemo, useState } from "react";
import { Search, Target } from "lucide-react";
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

  const batchLabel = useMemo(
    () => students.find((student) => student.batchYear)?.batchYear ?? "",
    [students],
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

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              Student List{batchLabel ? ` - Batch ${batchLabel}` : ""}
            </CardTitle>
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
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(student)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{student.name}</p>
                          <Badge
                            className={getPlacementColor(
                              student.placementStatus,
                            )}
                          >
                            {student.placementStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {student.rollNumber} • {student.semester} Semester
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">CGPA</p>
                        <p className="font-medium">{student.cgpa}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Attendance</p>
                        <p className="font-medium">{student.attendance}%</p>
                      </div>
                      <div className="text-center min-w-[120px]">
                        <p className="text-xs text-gray-500 mb-1">
                          Career Interest
                        </p>
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {student.careerInterest || "Not set"}
                        </Badge>
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
      </CardContent>

      <StudentDetailDialogReadOnly
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        student={selectedStudent}
      />
    </Card>
  );
}

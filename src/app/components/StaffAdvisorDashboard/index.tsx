import { useState, useMemo } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { FacultyStatusOverview } from "./FacultyStatusOverview";
import { CareerExplorationStats } from "./CareerExplorationStats";
import { StudentList } from "./StudentList";
import { BatchCourseProgress } from "./BatchCourseProgress";
import { StudentDetailDialog } from "./StudentDetailDialog";
import { AddActivityDialog } from "./AddActivityDialog";
import { BatchCourseOverview, Student } from "./types";
import { mockStats, mockCareerStats, mockStudents } from "./mockData";
import { toast } from "sonner";

export function StaffAdvisorDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentList, setStudentList] = useState<Student[]>(mockStudents);
  const [isStudentViewOpen, setIsStudentViewOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [activityPoints, setActivityPoints] = useState("");
  const totalStudents = studentList.length;
  const placedStudents = studentList.filter(
    (student) => student.placementStatus === "Placed",
  ).length;
  const inProcess = studentList.filter(
    (student) => student.placementStatus === "In Process",
  ).length;
  const averageCGPA = totalStudents
    ? Number(
        (
          studentList.reduce((sum, student) => sum + student.cgpa, 0) /
          totalStudents
        ).toFixed(1),
      )
    : 0;
  const averageAttendance = totalStudents
    ? Math.round(
        studentList.reduce((sum, student) => sum + student.attendance, 0) /
          totalStudents,
      )
    : 0;
  const batchYear =
    studentList.find((student) => student.batchYear)?.batchYear ??
    mockStats.batchYear;
  const derivedStats = {
    ...mockStats,
    totalStudents,
    placedStudents,
    inProcess,
    averageCGPA,
    averageAttendance,
    batchYear,
  };

  // Compute batch course overview from current student list
  const batchCourseOverview: BatchCourseOverview = useMemo(() => {
    const currentBatchYears = Array.from(
      new Set(studentList.map((s) => s.batchYear).filter(Boolean)),
    ) as string[];

    const groups = currentBatchYears
      .map((year) => ({
        progress: {
          batchYear: year,
          totalFiles: 0,
          approvedFiles: 0,
          inReviewFiles: 0,
          rejectedFiles: 0,
          completionRate: 0,
        },
        faculty: [],
      }))
      .sort((a, b) =>
        (b.progress.batchYear || "").localeCompare(a.progress.batchYear || ""),
      );

    return {
      overall: {
        batchYear: "All",
        totalFiles: 0,
        approvedFiles: 0,
        inReviewFiles: 0,
        rejectedFiles: 0,
        completionRate: 0,
      },
      groups,
    };
  }, [studentList]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentViewOpen(true);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudentList((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student,
      ),
    );
    setSelectedStudent(updatedStudent);
    toast.success("Student updated successfully");
  };

  const handleAddActivity = () => {
    if (!selectedStudent) return;
    if (!selectedActivity || !selectedCommunity || !activityPoints) {
      toast.error("Please fill in all fields");
      return;
    }
    const newActivity = {
      id: (selectedStudent.activities.length + 1).toString(),
      name: selectedActivity,
      community: selectedCommunity,
      points: parseInt(activityPoints, 10),
      date: new Date().toISOString().split("T")[0],
    };
    const updatedStudent = {
      ...selectedStudent,
      activities: [...selectedStudent.activities, newActivity],
      activityPoints:
        selectedStudent.activityPoints + parseInt(activityPoints, 10),
    };
    setStudentList((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student,
      ),
    );
    setSelectedStudent(updatedStudent);
    setIsActivityDialogOpen(false);
    setSelectedActivity("");
    setSelectedCommunity("");
    setActivityPoints("");
    toast.success("Activity added successfully");
  };

  const handleAddStudent = (student: Student) => {
    setStudentList((prev) => [student, ...prev]);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader stats={derivedStats} />
      <StatsOverview stats={derivedStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FacultyStatusOverview stats={derivedStats} />
        <CareerExplorationStats careerStats={mockCareerStats} />
      </div>

      <BatchCourseProgress groups={batchCourseOverview.groups} />

      <StudentList
        students={studentList}
        stats={derivedStats}
        onSelectStudent={handleViewStudent}
        onAddStudent={handleAddStudent}
      />

      <StudentDetailDialog
        isOpen={isStudentViewOpen}
        onOpenChange={setIsStudentViewOpen}
        student={selectedStudent}
        onAddActivity={() => setIsActivityDialogOpen(true)}
        onUpdateStudent={handleUpdateStudent}
      />

      <AddActivityDialog
        isOpen={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        student={selectedStudent}
        activityName={selectedActivity}
        onActivityNameChange={setSelectedActivity}
        community={selectedCommunity}
        onCommunityChange={setSelectedCommunity}
        activityPoints={activityPoints}
        onActivityPointsChange={setActivityPoints}
        onAddActivity={handleAddActivity}
      />
    </div>
  );
}

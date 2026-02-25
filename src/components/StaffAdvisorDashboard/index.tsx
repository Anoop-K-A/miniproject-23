"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { FacultyStatusOverview } from "./FacultyStatusOverview";
import { CareerExplorationStats } from "./CareerExplorationStats";
import { StudentList } from "./StudentList";
import { BatchCourseProgress } from "./BatchCourseProgress";
import { StudentDetailDialog } from "./StudentDetailDialog";
import { AddActivityDialog } from "./AddActivityDialog";
import {
  BatchCourseOverview,
  CareerStats,
  DashboardStats,
  Student,
} from "./types";
import { toast } from "sonner";

interface StaffAdvisorDashboardProps {
  stats: DashboardStats;
  careerStats: CareerStats;
  students: Student[];
  batchCourseOverview: BatchCourseOverview;
}

export function StaffAdvisorDashboard({
  stats,
  careerStats,
  students,
  batchCourseOverview,
}: StaffAdvisorDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentList, setStudentList] = useState<Student[]>(students);
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
    stats.batchYear;
  const derivedStats: DashboardStats = {
    ...stats,
    totalStudents,
    placedStudents,
    inProcess,
    averageCGPA,
    averageAttendance,
    batchYear,
  };

  // Ensure all batches in student list appear in course progress
  const derivedBatchCourseOverview = useMemo<BatchCourseOverview>(() => {
    const currentBatchYears = Array.from(
      new Set(studentList.map((s) => s.batchYear).filter(Boolean)),
    ) as string[];

    // Keep existing groups and add missing batches with 0 files
    const existingBatchYears = new Set(
      batchCourseOverview.groups.map((g) => g.progress.batchYear),
    );

    const missingBatches = currentBatchYears
      .filter((year) => !existingBatchYears.has(year))
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
      }));

    const allGroups = [...batchCourseOverview.groups, ...missingBatches].sort(
      (a, b) =>
        (b.progress.batchYear || "").localeCompare(a.progress.batchYear || ""),
    );

    return {
      overall: batchCourseOverview.overall,
      groups: allGroups,
    };
  }, [studentList, batchCourseOverview]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentViewOpen(true);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
      const response = await fetch(`/api/students/${updatedStudent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStudent),
      });

      if (response.ok) {
        setStudentList((prev) =>
          prev.map((student) =>
            student.id === updatedStudent.id ? updatedStudent : student,
          ),
        );
        setSelectedStudent(updatedStudent);
        toast.success("Student updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  const handleAddActivity = async () => {
    if (!selectedStudent) return;
    if (!selectedActivity || !selectedCommunity || !activityPoints) {
      toast.error("Please fill in all fields");
      return;
    }
    const newActivity = {
      id: `act-${Date.now()}`,
      name: selectedActivity,
      community: selectedCommunity,
      points: parseInt(activityPoints, 10),
      date: new Date().toISOString().split("T")[0],
    };
    const updatedStudent = {
      ...selectedStudent,
      activities: [...selectedStudent.activities, newActivity],
      activityPoints: selectedStudent.activityPoints + newActivity.points,
    };

    try {
      const response = await fetch(`/api/students/${updatedStudent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStudent),
      });

      if (response.ok) {
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
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add activity");
      }
    } catch (error) {
      console.error("Error adding activity:", error);
      toast.error("Failed to add activity");
    }
  };

  const handleAddStudent = async (student: Student) => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          advisorId: "",
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          phone: student.phone,
          department: student.department,
          semester: student.semester,
          batchYear: student.batchYear,
          cgpa: student.cgpa,
          attendance: student.attendance,
          careerInterest: student.careerInterest,
          skillsAcquired: student.skillsAcquired,
          placementStatus: student.placementStatus,
          companyName: student.companyName,
          activityPoints: student.activityPoints,
          activities: student.activities,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Use the student returned from API which has proper ID and timestamps
        const savedStudent = (data.students && data.students[0]) || student;
        setStudentList((prev) => [savedStudent, ...prev]);
        toast.success("Student added successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader stats={derivedStats} />
      <StatsOverview stats={derivedStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FacultyStatusOverview stats={derivedStats} />
        <CareerExplorationStats careerStats={careerStats} />
      </div>

      <BatchCourseProgress groups={derivedBatchCourseOverview.groups} />

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

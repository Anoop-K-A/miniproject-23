"use client";

import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { StatsOverview } from "./StatsOverview";
import { FacultyStatusOverview } from "./FacultyStatusOverview";
import { CareerExplorationStats } from "./CareerExplorationStats";
import { StudentList } from "./StudentList";
import { StudentDetailDialog } from "./StudentDetailDialog";
import { AddActivityDialog } from "./AddActivityDialog";
import { CareerStats, DashboardStats, Student } from "./types";
import { toast } from "sonner";

interface StaffAdvisorDashboardProps {
  stats: DashboardStats;
  careerStats: CareerStats;
  students: Student[];
}

export function StaffAdvisorDashboard({
  stats,
  careerStats,
  students,
}: StaffAdvisorDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentList, setStudentList] = useState<Student[]>(students);
  const [isStudentViewOpen, setIsStudentViewOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [activityPoints, setActivityPoints] = useState("");

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentViewOpen(true);
  };

  const handleAddActivity = async () => {
    if (!selectedStudent) return;
    if (!selectedActivity || !selectedCommunity || !activityPoints) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const response = await fetch(
        `/api/students/${selectedStudent.id}/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: selectedActivity,
            community: selectedCommunity,
            points: parseInt(activityPoints, 10),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Activity update failed");
        return;
      }
      setStudentList(data.students);
      const updatedStudent = data.students.find(
        (student: Student) => student.id === selectedStudent.id,
      );
      setSelectedStudent(updatedStudent ?? null);
      setIsActivityDialogOpen(false);
      setSelectedActivity("");
      setSelectedCommunity("");
      setActivityPoints("");
      toast.success("Activity added successfully");
    } catch (error) {
      console.error("Activity error:", error);
      toast.error("An error occurred while updating activity");
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader stats={stats} />
      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FacultyStatusOverview stats={stats} />
        <CareerExplorationStats careerStats={careerStats} />
      </div>

      <StudentList
        students={studentList}
        stats={stats}
        onSelectStudent={handleViewStudent}
      />

      <StudentDetailDialog
        isOpen={isStudentViewOpen}
        onOpenChange={setIsStudentViewOpen}
        student={selectedStudent}
        onAddActivity={() => setIsActivityDialogOpen(true)}
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

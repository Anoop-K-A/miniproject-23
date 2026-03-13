import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { Student } from "@/components/StaffAdvisorDashboard/types";
import { resolveStaffAdvisorScope } from "@/lib/staffAdvisorScope";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const advisorScope = await resolveStaffAdvisorScope(request);
    if (!advisorScope) {
      return NextResponse.json(
        { error: "Unauthorized staff advisor context" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const payload = await request.json();
    const students = await readJsonFile<Student[]>("students.json");

    const targetStudent = students.find((student) => student.id === id);
    if (!targetStudent || targetStudent.advisorId !== advisorScope.advisorId) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updatedStudents = students.map((student) => {
      if (student.id !== id || student.advisorId !== advisorScope.advisorId) {
        return student;
      }

      const newActivity = {
        id: `act-${Date.now()}`,
        name: payload.name,
        community: payload.community,
        points: payload.points,
        date: new Date().toISOString().split("T")[0],
      };

      return {
        ...student,
        activities: [...student.activities, newActivity],
        activityPoints: student.activityPoints + payload.points,
        updatedAt: new Date().toISOString(),
      };
    });

    await writeJsonFile("students.json", updatedStudents);

    const updatedStudent = updatedStudents.find((student) => student.id === id);
    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    console.error("Student activity error:", error);
    return NextResponse.json(
      { error: "Failed to add activity" },
      { status: 500 },
    );
  }
}

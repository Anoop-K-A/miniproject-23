import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { Student } from "@/components/StaffAdvisorDashboard/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await request.json();
    const students = await readJsonFile<Student[]>("students.json");

    const updatedStudents = students.map((student) => {
      if (student.id !== params.id) return student;

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

    return NextResponse.json({ students: updatedStudents });
  } catch (error) {
    console.error("Student activity error:", error);
    return NextResponse.json(
      { error: "Failed to add activity" },
      { status: 500 },
    );
  }
}

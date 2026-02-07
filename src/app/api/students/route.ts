import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { Student } from "@/components/StaffAdvisorDashboard/types";

export async function GET() {
  try {
    const students = await readJsonFile<Student[]>("students.json");
    return NextResponse.json({ students });
  } catch (error) {
    console.error("Students load error:", error);
    return NextResponse.json(
      { error: "Failed to load students" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const students = await readJsonFile<Student[]>("students.json");
    const timestamp = new Date().toISOString();

    const newStudent: Student & { createdAt?: string; updatedAt?: string } = {
      id: Date.now().toString(),
      advisorId: payload.advisorId,
      name: payload.name,
      rollNumber: payload.rollNumber,
      email: payload.email,
      phone: payload.phone,
      department: payload.department,
      semester: payload.semester,
      batchYear: payload.batchYear,
      cgpa: payload.cgpa ?? 0,
      attendance: payload.attendance ?? 0,
      careerInterest: payload.careerInterest ?? "",
      skillsAcquired: payload.skillsAcquired ?? [],
      placementStatus: payload.placementStatus ?? "Not Started",
      companyName: payload.companyName,
      activityPoints: payload.activityPoints ?? 0,
      activities: payload.activities ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedStudents = [newStudent, ...students];
    await writeJsonFile("students.json", updatedStudents);

    return NextResponse.json({ students: updatedStudents });
  } catch (error) {
    console.error("Student create error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}

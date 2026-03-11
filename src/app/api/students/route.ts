import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { Student } from "@/components/StaffAdvisorDashboard/types";
import { resolveStaffAdvisorScope } from "@/lib/staffAdvisorScope";

export async function GET(request: NextRequest) {
  try {
    const advisorScope = await resolveStaffAdvisorScope(request);
    if (!advisorScope) {
      return NextResponse.json({ students: [] });
    }

    const students = await readJsonFile<Student[]>("students.json");
    const scopedStudents = students.filter(
      (student) => student.advisorId === advisorScope.advisorId,
    );

    return NextResponse.json({ students: scopedStudents });
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
    const advisorScope = await resolveStaffAdvisorScope(request);
    if (!advisorScope) {
      return NextResponse.json(
        { error: "Unauthorized staff advisor context" },
        { status: 401 },
      );
    }

    const payload = await request.json();
    const students = await readJsonFile<Student[]>("students.json");
    const timestamp = new Date().toISOString();

    const rollNumber = String(payload.rollNumber ?? "").trim();
    const email = String(payload.email ?? "")
      .trim()
      .toLowerCase();
    const batchYear = String(payload.batchYear ?? "").trim();

    if (!payload.name || !rollNumber || !email || !batchYear) {
      return NextResponse.json(
        { error: "Name, roll number, email, and batch year are required" },
        { status: 400 },
      );
    }

    const duplicateInAdvisorScope = students.some(
      (student) =>
        student.advisorId === advisorScope.advisorId &&
        student.batchYear?.trim().toLowerCase() === batchYear.toLowerCase() &&
        student.rollNumber.trim().toLowerCase() === rollNumber.toLowerCase(),
    );

    if (duplicateInAdvisorScope) {
      return NextResponse.json(
        { error: "Roll number already exists in this batch" },
        { status: 409 },
      );
    }

    const newStudent: Student & { createdAt?: string; updatedAt?: string } = {
      id: Date.now().toString(),
      advisorId: advisorScope.advisorId,
      name: payload.name,
      rollNumber,
      email,
      phone: payload.phone,
      department: payload.department,
      semester: payload.semester,
      batchYear,
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

    const scopedStudents = updatedStudents.filter(
      (student) => student.advisorId === advisorScope.advisorId,
    );

    return NextResponse.json({ student: newStudent, students: scopedStudents });
  } catch (error) {
    console.error("Student create error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}

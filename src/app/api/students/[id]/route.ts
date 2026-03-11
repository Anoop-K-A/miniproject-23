import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { Student } from "@/components/StaffAdvisorDashboard/types";
import { resolveStaffAdvisorScope } from "@/lib/staffAdvisorScope";

export async function PATCH(
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
    const updatedAt = new Date().toISOString();

    const existingStudent = students.find((student) => student.id === id);
    if (
      !existingStudent ||
      existingStudent.advisorId !== advisorScope.advisorId
    ) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const nextStudent: Student = {
      ...existingStudent,
      ...payload,
      advisorId: existingStudent.advisorId,
      updatedAt,
    } as Student;

    const updatedStudents = students.map((student) =>
      student.id === id ? nextStudent : student,
    );

    await writeJsonFile("students.json", updatedStudents);
    return NextResponse.json({ student: nextStudent });
  } catch (error) {
    console.error("Student update error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
    const students = await readJsonFile<Student[]>("students.json");

    const existingStudent = students.find((student) => student.id === id);
    if (
      !existingStudent ||
      existingStudent.advisorId !== advisorScope.advisorId
    ) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updatedStudents = students.filter(
      (student) =>
        !(student.id === id && student.advisorId === advisorScope.advisorId),
    );
    await writeJsonFile("students.json", updatedStudents);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}

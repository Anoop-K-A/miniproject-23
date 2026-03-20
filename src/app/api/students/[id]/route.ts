import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { Student } from "@/components/StaffAdvisorDashboard/types";
import { resolveStaffAdvisorScope } from "@/lib/staffAdvisorScope";

const VALID_SEMESTERS = new Set([
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
]);

function normalizeSemesterInput(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  const match = raw.toUpperCase().match(/^(?:SEMESTER|SEM|S)?\s*([1-8])$/);
  return match ? `S${match[1]}` : "";
}

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

    if (Object.prototype.hasOwnProperty.call(payload, "semester")) {
      const normalizedSemester = normalizeSemesterInput(payload.semester);
      if (!VALID_SEMESTERS.has(normalizedSemester)) {
        return NextResponse.json(
          { error: "Semester must be one of S1 to S8" },
          { status: 400 },
        );
      }
      payload.semester = normalizedSemester;
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

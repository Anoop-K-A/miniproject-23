import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { Student } from "@/components/StaffAdvisorDashboard/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const students = await readJsonFile<Student[]>("students.json");
    const updatedAt = new Date().toISOString();

    const updatedStudents = students.map((student) =>
      student.id === id
        ? {
            ...student,
            ...payload,
            updatedAt,
          }
        : student,
    );

    await writeJsonFile("students.json", updatedStudents);
    return NextResponse.json({ students: updatedStudents });
  } catch (error) {
    console.error("Student update error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const students = await readJsonFile<Student[]>("students.json");
    const updatedStudents = students.filter((student) => student.id !== id);
    await writeJsonFile("students.json", updatedStudents);
    return NextResponse.json({ students: updatedStudents });
  } catch (error) {
    console.error("Student delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}

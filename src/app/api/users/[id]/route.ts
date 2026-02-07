import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import type { Student } from "@/components/StaffAdvisorDashboard/types";

interface UserRecord {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "faculty" | "auditor" | "staff-advisor" | string;
  department?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CourseFileRecord {
  id: string;
  facultyId: string;
}

interface EventReportRecord {
  id: string;
  facultyId: string;
}

interface AuditRecord {
  id: string;
  auditorId: string;
  entityType: string;
  entityId: string;
}

interface RemarkRecord {
  id: string;
  authorId: string;
  entityType: string;
  entityId: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await request.json();
    const users = await readJsonFile<UserRecord[]>("users.json");
    const updatedAt = new Date().toISOString();

    const updatedUsers = users.map((user) =>
      user.id === params.id
        ? {
            ...user,
            ...payload,
            updatedAt,
          }
        : user,
    );

    await writeJsonFile("users.json", updatedUsers);
    return NextResponse.json({ users: updatedUsers });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const users = await readJsonFile<UserRecord[]>("users.json");
    const courseFiles =
      await readJsonFile<CourseFileRecord[]>("courseFiles.json");
    const eventReports =
      await readJsonFile<EventReportRecord[]>("eventReports.json");
    const audits = await readJsonFile<AuditRecord[]>("audits.json");
    const remarks = await readJsonFile<RemarkRecord[]>("remarks.json");
    const students = await readJsonFile<Student[]>("students.json");

    const updatedUsers = users.filter((user) => user.id !== params.id);

    const removedFileIds = courseFiles
      .filter((file) => file.facultyId === params.id)
      .map((file) => file.id);
    const removedReportIds = eventReports
      .filter((report) => report.facultyId === params.id)
      .map((report) => report.id);

    const updatedFiles = courseFiles.filter(
      (file) => file.facultyId !== params.id,
    );
    const updatedReports = eventReports.filter(
      (report) => report.facultyId !== params.id,
    );

    const updatedAudits = audits.filter(
      (audit) =>
        audit.auditorId !== params.id &&
        !(
          (audit.entityType === "course-file" &&
            removedFileIds.includes(audit.entityId)) ||
          (audit.entityType === "event-report" &&
            removedReportIds.includes(audit.entityId))
        ),
    );

    const updatedRemarks = remarks.filter(
      (remark) =>
        remark.authorId !== params.id &&
        !(
          (remark.entityType === "course-file" &&
            removedFileIds.includes(remark.entityId)) ||
          (remark.entityType === "event-report" &&
            removedReportIds.includes(remark.entityId))
        ),
    );

    const updatedStudents = students.filter(
      (student) => student.advisorId !== params.id,
    );

    await writeJsonFile("users.json", updatedUsers);
    await writeJsonFile("courseFiles.json", updatedFiles);
    await writeJsonFile("eventReports.json", updatedReports);
    await writeJsonFile("audits.json", updatedAudits);
    await writeJsonFile("remarks.json", updatedRemarks);
    await writeJsonFile("students.json", updatedStudents);

    return NextResponse.json({ users: updatedUsers });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}

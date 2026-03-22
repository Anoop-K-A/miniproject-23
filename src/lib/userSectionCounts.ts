import { readJsonFile } from "@/lib/jsonDb";

interface CourseFileForCount {
  status?: string;
  courseCode?: string;
  academicYear?: string;
  semester?: string;
}

export interface UserSectionCounts {
  approvedCourseCodesCount: number;
  eventReportsCount: number;
  studentsCount: number;
}

function normalizeCourseCode(courseCode?: string) {
  return String(courseCode || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function getSemesterRank(semester?: string) {
  const normalized = String(semester || "")
    .toLowerCase()
    .replace(/\s+/g, "");
  const numeric = normalized.match(/(\d+)/);
  if (numeric) return Number(numeric[1]);
  return -1;
}

function isApprovedStatus(status?: string) {
  return (
    String(status || "")
      .trim()
      .toLowerCase() === "approved"
  );
}

export async function getUserSectionCounts(): Promise<UserSectionCounts> {
  const [files, reports, students] = await Promise.all([
    readJsonFile<CourseFileForCount[]>("courseFiles.json"),
    readJsonFile<unknown[]>("eventReports.json"),
    readJsonFile<unknown[]>("students.json"),
  ]);

  const approvedFiles = files.filter((file) => isApprovedStatus(file.status));
  const latestBatch = approvedFiles
    .map((file) => String(file.academicYear || "").trim())
    .filter((batch) => Boolean(batch))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];

  const batchScopedFiles = latestBatch
    ? approvedFiles.filter(
        (file) => String(file.academicYear || "").trim() === latestBatch,
      )
    : approvedFiles;

  const latestSemester = [...batchScopedFiles]
    .map((file) => String(file.semester || "").trim())
    .filter((semester) => Boolean(semester))
    .sort((a, b) => getSemesterRank(b) - getSemesterRank(a))[0];

  const semesterScopedFiles = latestSemester
    ? batchScopedFiles.filter(
        (file) => String(file.semester || "").trim() === latestSemester,
      )
    : batchScopedFiles;

  return {
    approvedCourseCodesCount: new Set(
      semesterScopedFiles
        .map((file) => normalizeCourseCode(file.courseCode))
        .filter((courseCode) => Boolean(courseCode)),
    ).size,
    eventReportsCount: reports.length,
    studentsCount: students.length,
  };
}

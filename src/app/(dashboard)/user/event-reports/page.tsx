import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSectionNav } from "@/components/user/UserSectionNav";
import {
  UserEventReportsSection,
  UserEventReportRecord,
} from "@/components/user/UserEventReportsSection";
import { readJsonFile } from "@/lib/jsonDb";
import { getAllUsers } from "@/lib/userStore";

interface EventReportRecord extends UserEventReportRecord {
  id: string;
  eventName: string;
  eventDate: string;
  community: string;
  facultyCoordinator?: string;
  facultyId?: string;
  status?: string;
}

function getSemesterRank(semester?: string) {
  const normalized = String(semester || "")
    .toLowerCase()
    .replace(/\s+/g, "");
  const numeric = normalized.match(/(\d+)/);
  if (numeric) return Number(numeric[1]);
  return -1;
}

interface UserEventReportsPageData {
  approvedCourseCodesCount: number;
  facultyNameById: Record<string, string>;
}

function normalizeCourseCode(courseCode?: string) {
  return String(courseCode || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export default async function UserEventReportsPage() {
  const [users, files, reports] = await Promise.all([
    getAllUsers(),
    readJsonFile<
      Array<{
        status?: string;
        courseCode?: string;
        academicYear?: string;
        semester?: string;
      }>
    >("courseFiles.json"),
    readJsonFile<EventReportRecord[]>("eventReports.json"),
  ]);

  const approvedFiles = files.filter(
    (file) => String(file.status || "") === "Approved",
  );
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

  const approvedCourseCodes = new Set(
    semesterScopedFiles
      .map((file) => normalizeCourseCode(file.courseCode))
      .filter((courseCode) => Boolean(courseCode)),
  );

  const facultyNameById = Object.fromEntries(
    users
      .filter(
        (user) =>
          (user.role === "faculty" || user.roles?.includes("faculty")) &&
          user.role !== "admin",
      )
      .map((user) => [String(user.id), user.name]),
  );

  const pageData: UserEventReportsPageData = {
    approvedCourseCodesCount: approvedCourseCodes.size,
    facultyNameById,
  };

  const { approvedCourseCodesCount } = pageData;

  return (
    <main className="space-y-6">
      <UserSectionNav
        courseFilesCount={approvedCourseCodesCount}
        eventReportsCount={reports.length}
        studentsCount={0}
      />

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-slate-900">
            Event Reports
          </CardTitle>
          <p className="text-sm text-slate-600">
            Year-wise representation of submitted event reports.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserEventReportsSection
            reports={reports}
            facultyNameById={facultyNameById}
          />
        </CardContent>
      </Card>
    </main>
  );
}

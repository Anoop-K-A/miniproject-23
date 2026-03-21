import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserSectionNav } from "@/components/user/UserSectionNav";
import { readJsonFile } from "@/lib/jsonDb";

interface UserStudentsPageData {
  eventReportsCount: number;
  approvedCourseCodesCount: number;
  studentsCount: number;
}

interface StudentRecord {
  id: string;
  name: string;
  rollNumber?: string;
  department?: string;
  semester?: string;
  batchYear?: string;
}

interface BatchGroup {
  batch: string;
  students: StudentRecord[];
}

function getSemesterRank(semester?: string) {
  const normalized = String(semester || "")
    .toLowerCase()
    .replace(/\s+/g, "");
  const numeric = normalized.match(/(\d+)/);
  if (numeric) return Number(numeric[1]);
  return -1;
}

function normalizeCourseCode(courseCode?: string) {
  return String(courseCode || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export default async function UserStudentsPage() {
  const [reports, files, students] = await Promise.all([
    readJsonFile<unknown[]>("eventReports.json"),
    readJsonFile<
      Array<{
        status?: string;
        courseCode?: string;
        academicYear?: string;
        semester?: string;
      }>
    >("courseFiles.json"),
    readJsonFile<StudentRecord[]>("students.json"),
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

  const activeBatchYear = String(latestBatch || "").trim();
  const scopedStudents = activeBatchYear
    ? students.filter(
        (student) => String(student.batchYear || "").trim() === activeBatchYear,
      )
    : students;

  const batchGroups: BatchGroup[] = Object.entries(
    scopedStudents.reduce<Record<string, StudentRecord[]>>(
      (accumulator, student) => {
        const batch = String(student.batchYear || "Unknown Batch").trim();
        if (!accumulator[batch]) {
          accumulator[batch] = [];
        }
        accumulator[batch].push(student);
        return accumulator;
      },
      {},
    ),
  )
    .map(([batch, batchStudents]) => ({
      batch,
      students: [...batchStudents].sort((a, b) => {
        const rollA = String(a.rollNumber || "")
          .trim()
          .toLowerCase();
        const rollB = String(b.rollNumber || "")
          .trim()
          .toLowerCase();
        if (rollA && rollB) {
          return rollA.localeCompare(rollB, undefined, { numeric: true });
        }
        return String(a.name || "").localeCompare(String(b.name || ""));
      }),
    }))
    .sort((a, b) =>
      b.batch.localeCompare(a.batch, undefined, { numeric: true }),
    );

  const pageData: UserStudentsPageData = {
    eventReportsCount: reports.length,
    approvedCourseCodesCount: approvedCourseCodes.size,
    studentsCount: students.length,
  };

  const { approvedCourseCodesCount, eventReportsCount, studentsCount } =
    pageData;

  return (
    <main className="space-y-6">
      <UserSectionNav
        courseFilesCount={approvedCourseCodesCount}
        eventReportsCount={eventReportsCount}
        studentsCount={studentsCount}
      />

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-slate-900">Students</CardTitle>
          <p className="text-sm text-slate-600">
            Students are shown under one batch year. Open the batch folder to
            view students.
          </p>
        </CardHeader>
        <CardContent>
          {batchGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-medium text-slate-800">
                No students available yet
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Students added by staff advisors will appear here by batch.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {batchGroups.map((group) => (
                <details
                  key={group.batch}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 group-open:hidden">
                        [+]
                      </span>
                      <span className="font-mono text-xs text-slate-500 hidden group-open:inline">
                        [-]
                      </span>
                      <span>Batch {group.batch}</span>
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {group.students.length} student
                      {group.students.length === 1 ? "" : "s"}
                    </Badge>
                  </summary>
                  <div className="bg-white px-4 py-3">
                    <ul className="space-y-1">
                      {group.students.map((student) => (
                        <li
                          key={student.id}
                          className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm sm:grid-cols-4"
                        >
                          <p className="font-medium text-slate-900">
                            <span className="mr-2 font-mono text-xs text-slate-500">
                              |-
                            </span>
                            {student.name}
                          </p>
                          <p className="text-slate-600">
                            {student.rollNumber || "N/A"}
                          </p>
                          <p className="text-slate-600">
                            {student.department || "N/A"}
                          </p>
                          <p className="text-slate-600">
                            {student.semester || "N/A"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

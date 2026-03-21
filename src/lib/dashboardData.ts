import type {
  ActivityItem,
  DashboardStats,
  FacultyMember,
} from "@/types/faculty";
import type {
  DashboardStats as AuditorStats,
  FacultyMember as AuditorFacultyMember,
  RecentReview,
} from "@/components/AuditorDashboard/types";
import type {
  CareerStats,
  DashboardStats as StaffStats,
  Student,
} from "@/components/StaffAdvisorDashboard/types";
import { readJsonFile } from "@/lib/jsonDb";
import { getAllUsers } from "@/lib/userStore";

// Helper to serialize objects with MongoDB ObjectIds for client components
function serializeId(id: unknown): string {
  if (id === null || id === undefined) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && "toString" in id) {
    return String(id);
  }
  return String(id);
}

function normalizeIdentity(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

interface UserRecord {
  id: string;
  username: string;
  name: string;
  role: "faculty" | "auditor" | "staff-advisor" | "admin" | "user";
  roles?: ("faculty" | "auditor" | "staff-advisor" | "admin" | "user")[];
  department?: string;
  email?: string;
  phone?: string;
  courses?: string[];
  specialization?: string;
  experience?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  facultyRole?: string;
}

interface CourseFileRecord {
  id: string;
  facultyId?: string;
  fileName: string;
  courseCode?: string;
  courseName?: string;
  semester?: string;
  status?: string;
  academicYear?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EventReportRecord {
  id: string;
  facultyId: string;
  eventName: string;
  status?: string;
  participants?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AuditRecord {
  id: string;
  auditorId: string;
  entityType: "course-file" | "event-report" | string;
  entityId: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CareerActivityRecord {
  id: string;
  studentId: string;
  type: "internship" | "project" | "workshop" | "interview" | string;
  status: string;
}

export interface FacultyDashboardData {
  stats: DashboardStats;
  facultyMembers: FacultyMember[];
}

function toTimeAgo(isoDate?: string) {
  if (!isoDate) return "Just now";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

function normalizeSemesterLabel(semester?: string) {
  const raw = String(semester ?? "").trim();
  if (!raw) return "";

  const compact = raw.toLowerCase().replace(/[\s-]+/g, "");
  const numericMatch = compact.match(/^(?:semester|sem|s)?([1-8])$/);
  if (numericMatch) {
    return `S${numericMatch[1]}`;
  }

  if (compact === "odd") return "Odd";
  if (compact === "even") return "Even";

  return raw.toUpperCase();
}

function buildCourseTeachingLabel(
  file: Pick<
    CourseFileRecord,
    "courseCode" | "courseName" | "academicYear" | "semester"
  >,
) {
  const courseCode = String(file.courseCode ?? "").trim();
  const courseName = String(file.courseName ?? "").trim();
  const batch = String(file.academicYear ?? "").trim();
  const semester = normalizeSemesterLabel(file.semester);
  const title = [courseCode, courseName].filter(Boolean).join(" - ");

  if (!title) {
    return "";
  }

  const details: string[] = [];
  if (batch) {
    details.push(`Batch ${batch}`);
  }
  if (semester) {
    details.push(`Sem ${semester}`);
  }

  return details.length > 0 ? `${title} (${details.join(", ")})` : title;
}

function buildCoursesByFaculty(courseFiles: CourseFileRecord[]) {
  const coursesByFaculty = new Map<string, Map<string, string>>();

  courseFiles.forEach((file) => {
    const facultyId = serializeId(file.facultyId);
    if (!facultyId) {
      return;
    }

    const courseLabel = buildCourseTeachingLabel(file);
    if (!courseLabel) {
      return;
    }

    const uniqueKey = [
      String(file.courseCode ?? "")
        .trim()
        .toLowerCase(),
      String(file.courseName ?? "")
        .trim()
        .toLowerCase(),
      String(file.academicYear ?? "")
        .trim()
        .toLowerCase(),
      normalizeSemesterLabel(file.semester).toLowerCase(),
    ].join("|");

    if (!coursesByFaculty.has(facultyId)) {
      coursesByFaculty.set(facultyId, new Map<string, string>());
    }

    coursesByFaculty.get(facultyId)?.set(uniqueKey, courseLabel);
  });

  const normalized = new Map<string, string[]>();
  coursesByFaculty.forEach((coursesMap, facultyId) => {
    normalized.set(
      facultyId,
      Array.from(coursesMap.values()).sort((a, b) => a.localeCompare(b)),
    );
  });

  return normalized;
}

export async function getFacultyDashboardData(
  username?: string | null,
): Promise<FacultyDashboardData> {
  const users = await getAllUsers();
  const facultyUsers = users.filter(
    (user) =>
      (user.roles?.includes("faculty") || user.role === "faculty") &&
      user.role !== "admin",
  );
  const courseFiles =
    await readJsonFile<CourseFileRecord[]>("courseFiles.json");
  const eventReports =
    await readJsonFile<EventReportRecord[]>("eventReports.json");
  const coursesByFaculty = buildCoursesByFaculty(courseFiles);

  const selectedUser = username
    ? facultyUsers.find((user) => user.username === username)
    : facultyUsers[0];

  const userId = selectedUser ? serializeId(selectedUser.id) : undefined;
  const userFiles = userId
    ? courseFiles.filter((file) => file.facultyId === userId)
    : [];
  const userReports = userId
    ? eventReports.filter((report) => report.facultyId === userId)
    : [];

  const totalParticipants = userReports.reduce(
    (sum, report) => sum + (report.participants ?? 0),
    0,
  );

  const pendingFileReviews = userFiles.filter((file) =>
    ["Pending", "Submitted"].includes(file.status ?? ""),
  ).length;

  const pendingReportReviews = userReports.filter((report) =>
    ["Pending", "Submitted"].includes(report.status ?? ""),
  ).length;

  const pendingReports = pendingFileReviews + pendingReportReviews;

  const recentActivity: ActivityItem[] = [
    ...userFiles.map((file) => ({
      action: "Uploaded",
      item: file.fileName,
      time: toTimeAgo(file.updatedAt ?? file.createdAt),
      _sort: file.updatedAt ?? file.createdAt ?? "",
    })),
    ...userReports.map((report) => ({
      action: report.status === "Approved" ? "Reviewed" : "Submitted",
      item: report.eventName,
      time: toTimeAgo(report.updatedAt ?? report.createdAt),
      _sort: report.updatedAt ?? report.createdAt ?? "",
    })),
  ]
    .sort((a, b) => (a._sort < b._sort ? 1 : -1))
    .slice(0, 5)
    .map(({ _sort, ...rest }) => rest as ActivityItem);

  const stats: DashboardStats = {
    totalFiles: userFiles.length,
    totalReports: userReports.length,
    pendingReports,
    totalParticipants,
    recentActivity,
  };

  const facultyMembers: FacultyMember[] = facultyUsers.map((user) => {
    const userId = serializeId(user.id);
    const derivedCourses = coursesByFaculty.get(userId) ?? [];
    const fallbackCourses = (user.courses ?? [])
      .map((course: string) => course.trim())
      .filter(Boolean);
    const mergedCourses = Array.from(
      new Set([...derivedCourses, ...fallbackCourses]),
    );

    return {
      id: userId,
      name: user.name,
      department: user.department ?? "",
      role: user.facultyRole ?? "Faculty",
      roles: Array.from(new Set([...(user.roles ?? []), user.role])).filter(
        (role) => role !== "admin",
      ),
      isStaffAdvisor: user.roles?.includes("staff-advisor") ?? false,
      email: user.email ?? user.username,
      phone: user.phone ?? "",
      courses: mergedCourses,
      specialization: user.specialization ?? "",
      experience: user.experience ?? "",
      resumeUrl: user.resumeUrl ?? "",
      resumeFileName: user.resumeFileName ?? "",
    };
  });

  return {
    stats,
    facultyMembers,
  };
}

export async function getAuditorDashboardData() {
  const users = await getAllUsers();
  const courseFiles =
    await readJsonFile<CourseFileRecord[]>("courseFiles.json");
  const eventReports =
    await readJsonFile<EventReportRecord[]>("eventReports.json");
  const audits = await readJsonFile<AuditRecord[]>("audits.json");

  const facultyUsers = users.filter(
    (user) =>
      (user.roles?.includes("faculty") || user.role === "faculty") &&
      user.role !== "admin",
  );

  const totalFiles = courseFiles.length;
  const totalReports = eventReports.length;

  // Single pass through files to count statuses
  let approvedFiles = 0;
  let pendingFiles = 0;
  let rejectedFiles = 0;
  const filesByFacultyId = new Map<string, CourseFileRecord[]>();
  const fileStatusMap = new Map<string, number>(); // status:count

  for (const file of courseFiles) {
    const status = file.status ?? "";
    if (status === "Approved") approvedFiles++;
    else if (status === "Pending") pendingFiles++;
    else if (status === "Rejected") rejectedFiles++;

    if (file.facultyId) {
      const key = String(file.facultyId);
      if (!filesByFacultyId.has(key)) {
        filesByFacultyId.set(key, []);
      }
      filesByFacultyId.get(key)?.push(file);
    }
  }

  // Single pass through reports
  let approvedReports = 0;
  let pendingReports = 0;
  let rejectedReports = 0;
  const reportsByFacultyId = new Map<string, EventReportRecord[]>();

  for (const report of eventReports) {
    const status = report.status ?? "";
    if (status === "Approved") approvedReports++;
    else if (status === "Submitted" || status === "Draft") pendingReports++;
    else if (status === "Rejected") rejectedReports++;

    if (report.facultyId) {
      const key = String(report.facultyId);
      if (!reportsByFacultyId.has(key)) {
        reportsByFacultyId.set(key, []);
      }
      reportsByFacultyId.get(key)?.push(report);
    }
  }

  const reviewedFiles = approvedFiles + rejectedFiles;
  const reviewedReports = approvedReports + rejectedReports;

  const completionRate =
    totalFiles + totalReports > 0
      ? Math.round(
          ((reviewedFiles + reviewedReports) / (totalFiles + totalReports)) *
            100,
        )
      : 0;

  const stats: AuditorStats = {
    totalFaculty: facultyUsers.length,
    totalFiles,
    totalReports,
    approvedFiles,
    approvedReports,
    pendingFiles,
    pendingReports,
    rejectedFiles,
    rejectedReports,
    completionRate,
  };

  // Build faculty members from pre-computed maps (no more filtering!)
  const facultyMembers: AuditorFacultyMember[] = facultyUsers
    .map((user) => {
      const userIdStr = serializeId(user.id);
      const facultyFiles = filesByFacultyId.get(userIdStr) ?? [];
      const facultyReports = reportsByFacultyId.get(userIdStr) ?? [];

      // Count statuses efficiently
      let userApprovedFiles = 0,
        userPendingFiles = 0,
        userRejectedFiles = 0;
      for (const file of facultyFiles) {
        if (file.status === "Approved") userApprovedFiles++;
        else if (file.status === "Pending") userPendingFiles++;
        else if (file.status === "Rejected") userRejectedFiles++;
      }

      let userApprovedReports = 0,
        userPendingReports = 0,
        userRejectedReports = 0;
      for (const report of facultyReports) {
        if (report.status === "Approved") userApprovedReports++;
        else if (report.status === "Submitted" || report.status === "Draft")
          userPendingReports++;
        else if (report.status === "Rejected") userRejectedReports++;
      }

      return {
        id: userIdStr,
        name: user.name,
        department: user.department ?? "",
        totalFiles: facultyFiles.length,
        totalReports: facultyReports.length,
        approvedFiles: userApprovedFiles,
        approvedReports: userApprovedReports,
        pendingFiles: userPendingFiles,
        pendingReports: userPendingReports,
        rejectedFiles: userRejectedFiles,
        rejectedReports: userRejectedReports,
        email: user.email ?? user.username,
        phone: user.phone ?? "",
        experience: user.experience ?? "",
        resumeUrl: user.resumeUrl ?? "",
        resumeFileName: user.resumeFileName ?? "",
      };
    })
    .filter((faculty) => faculty.totalFiles > 0 || faculty.totalReports > 0);

  // Build audit index for fast lookup
  const auditById = new Map<string, AuditRecord>();
  for (const audit of audits) {
    auditById.set(audit.entityId, audit);
  }

  // Build user index for fast lookup
  const userById = new Map<string, UserRecord>();
  for (const user of facultyUsers) {
    userById.set(serializeId(user.id), user);
  }

  const recentReviews: RecentReview[] = audits
    .slice(0, 20) // Limit to last 20 audits
    .map((audit) => {
      const file = courseFiles.find((item) => item.id === audit.entityId);
      const report = eventReports.find((item) => item.id === audit.entityId);
      const facultyId = file?.facultyId ?? report?.facultyId;
      const facultyUser = facultyId
        ? userById.get(String(facultyId))
        : undefined;
      return {
        faculty: facultyUser?.name ?? "Faculty",
        item: file?.fileName ?? report?.eventName ?? "Review Item",
        action: audit.status === "completed" ? "Approved" : "In Review",
        time: toTimeAgo(audit.updatedAt ?? audit.createdAt),
        _sort: audit.updatedAt ?? audit.createdAt ?? "",
      };
    })
    .sort((a, b) => (a._sort < b._sort ? 1 : -1))
    .slice(0, 5)
    .map(({ _sort, ...rest }) => rest as RecentReview);

  return {
    stats,
    facultyMembers,
    recentReviews,
  };
}

export async function getStaffAdvisorDashboardData(username?: string | null) {
  const users = await getAllUsers();
  const students = await readJsonFile<Student[]>("students.json");
  const courseFiles =
    await readJsonFile<CourseFileRecord[]>("courseFiles.json");
  const eventReports =
    await readJsonFile<EventReportRecord[]>("eventReports.json");
  const careerActivities = await readJsonFile<CareerActivityRecord[]>(
    "careerActivities.json",
  );

  const normalizedUsername = normalizeIdentity(username);
  const staffAdvisor = normalizedUsername
    ? users.find((user) => {
        const userRoles = user.roles?.length ? user.roles : [user.role];
        const isStaffAdvisor =
          userRoles.includes("staff-advisor") || user.role === "staff-advisor";
        return (
          isStaffAdvisor &&
          normalizeIdentity(user.username) === normalizedUsername
        );
      })
    : undefined;
  const staffAdvisorId = staffAdvisor ? serializeId(staffAdvisor.id) : "";
  const scopedStudents = staffAdvisorId
    ? students.filter(
        (student) => serializeId(student.advisorId) === staffAdvisorId,
      )
    : [];
  const scopedStudentIds = new Set(
    scopedStudents.map((student) => serializeId(student.id)),
  );
  const scopedCareerActivities = careerActivities.filter((activity) =>
    scopedStudentIds.has(serializeId(activity.studentId)),
  );

  const totalStudents = scopedStudents.length;
  const batchYear =
    scopedStudents.find((student) => student.batchYear)?.batchYear ?? "";
  const placedStudents = scopedStudents.filter(
    (student) => student.placementStatus === "Placed",
  ).length;
  const inProcess = scopedStudents.filter(
    (student) => student.placementStatus === "In Process",
  ).length;
  const averageCGPA =
    totalStudents > 0
      ? Math.round(
          (scopedStudents.reduce((sum, student) => sum + student.cgpa, 0) /
            totalStudents) *
            10,
        ) / 10
      : 0;
  const averageAttendance =
    totalStudents > 0
      ? Math.round(
          scopedStudents.reduce((sum, student) => sum + student.attendance, 0) /
            totalStudents,
        )
      : 0;

  const facultyUsers = users.filter(
    (user) =>
      (user.roles?.includes("faculty") || user.role === "faculty") &&
      user.role !== "admin",
  );
  const approvedFiles = courseFiles.filter(
    (file) => file.status === "Approved",
  ).length;
  const approvedReports = eventReports.filter(
    (report) => report.status === "Approved",
  ).length;
  const batchYears = Array.from(
    new Set(scopedStudents.map((student) => student.batchYear).filter(Boolean)),
  ) as string[];

  const overallCourseFiles =
    batchYears.length > 0
      ? courseFiles.filter(
          (file) => file.academicYear && batchYears.includes(file.academicYear),
        )
      : [];
  const overallApproved = overallCourseFiles.filter(
    (file) => file.status === "Approved",
  ).length;
  const overallInReview = overallCourseFiles.filter(
    (file) => file.status === "Pending" || file.status === "Submitted",
  ).length;
  const overallRejected = overallCourseFiles.filter(
    (file) => file.status === "Rejected",
  ).length;
  const overallCompletionRate =
    overallCourseFiles.length > 0
      ? Math.round((overallApproved / overallCourseFiles.length) * 100)
      : 0;

  const batchCourseOverview = {
    overall: {
      batchYear: "All",
      totalFiles: overallCourseFiles.length,
      approvedFiles: overallApproved,
      inReviewFiles: overallInReview,
      rejectedFiles: overallRejected,
      completionRate: overallCompletionRate,
    },
    groups: batchYears.map((year) => {
      const batchCourseFiles = courseFiles.filter(
        (file) => file.academicYear === year,
      );
      const approvedBatchFiles = batchCourseFiles.filter(
        (file) => file.status === "Approved",
      ).length;
      const inReviewBatchFiles = batchCourseFiles.filter(
        (file) => file.status === "Pending" || file.status === "Submitted",
      ).length;
      const rejectedBatchFiles = batchCourseFiles.filter(
        (file) => file.status === "Rejected",
      ).length;
      const completionRate =
        batchCourseFiles.length > 0
          ? Math.round((approvedBatchFiles / batchCourseFiles.length) * 100)
          : 0;

      const batchFacultyMap = new Map<
        string,
        {
          id: string;
          name: string;
          department: string;
          role: string;
          email?: string;
          phone?: string;
          specialization?: string;
          experience?: string;
          courses?: string[];
          resumeUrl?: string;
          resumeFileName?: string;
          filesTotal: number;
          filesApproved: number;
          filesInReview: number;
          filesRejected: number;
        }
      >();

      batchCourseFiles.forEach((file) => {
        if (!file.facultyId) return;
        const userId = serializeId(file.facultyId);
        const facultyUser = facultyUsers.find(
          (user) => serializeId(user.id) === userId,
        );
        if (!facultyUser) return;
        if (!batchFacultyMap.has(userId)) {
          batchFacultyMap.set(userId, {
            id: serializeId(facultyUser.id),
            name: facultyUser.name,
            department: facultyUser.department ?? "",
            role: facultyUser.facultyRole ?? "Faculty",
            email: facultyUser.email ?? facultyUser.username,
            phone: facultyUser.phone ?? "",
            specialization: facultyUser.specialization ?? "",
            experience: facultyUser.experience ?? "",
            courses: Array.isArray(facultyUser.courses)
              ? facultyUser.courses.filter(Boolean)
              : [],
            resumeUrl: facultyUser.resumeUrl ?? "",
            resumeFileName: facultyUser.resumeFileName ?? "",
            filesTotal: 0,
            filesApproved: 0,
            filesInReview: 0,
            filesRejected: 0,
          });
        }
        const entry = batchFacultyMap.get(userId);
        if (!entry) return;
        entry.filesTotal += 1;
        if (file.status === "Approved") {
          entry.filesApproved += 1;
        } else if (file.status === "Rejected") {
          entry.filesRejected += 1;
        } else {
          entry.filesInReview += 1;
        }
      });

      return {
        progress: {
          batchYear: year,
          totalFiles: batchCourseFiles.length,
          approvedFiles: approvedBatchFiles,
          inReviewFiles: inReviewBatchFiles,
          rejectedFiles: rejectedBatchFiles,
          completionRate,
        },
        faculty: Array.from(batchFacultyMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      };
    }),
  };

  const stats: StaffStats = {
    totalStudents,
    batchYear,
    placedStudents,
    inProcess,
    averageCGPA,
    averageAttendance,
    totalFaculty: facultyUsers.length,
    approvedFiles,
    approvedReports,
  };

  const careerStats: CareerStats = {
    totalInternships: scopedCareerActivities.filter(
      (activity) => activity.type === "internship",
    ).length,
    activeInternships: scopedCareerActivities.filter(
      (activity) =>
        activity.type === "internship" && activity.status === "active",
    ).length,
    completedProjects: scopedCareerActivities.filter(
      (activity) =>
        activity.type === "project" && activity.status === "completed",
    ).length,
    skillWorkshops: scopedCareerActivities.filter(
      (activity) => activity.type === "workshop",
    ).length,
    campusInterviews: scopedCareerActivities.filter(
      (activity) => activity.type === "interview",
    ).length,
  };

  return {
    stats,
    careerStats,
    students: scopedStudents,
    batchCourseOverview,
  };
}

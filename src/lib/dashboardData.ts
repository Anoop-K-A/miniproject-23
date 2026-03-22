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
  BatchCourseOverview,
  CareerStats,
  DashboardStats as StaffStats,
  Student,
} from "@/components/StaffAdvisorDashboard/types";
import { readJsonFile } from "@/lib/jsonDb";
import { getAllUsers } from "@/lib/userStore";
import { normalizeRoleInput } from "@/lib/adminConfig";

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

interface StaffAdvisorDashboardData {
  stats: StaffStats;
  careerStats: CareerStats;
  students: Student[];
  batchCourseOverview: BatchCourseOverview;
}

const STAFF_ADVISOR_DASHBOARD_CACHE_TTL_MS = 5000;
const staffAdvisorDashboardCache = new Map<
  string,
  { expiresAt: number; data: StaffAdvisorDashboardData }
>();

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
  const normalizedUsername = normalizeIdentity(username);
  const cacheKey = normalizedUsername || "__anonymous__";
  const cachedEntry = staffAdvisorDashboardCache.get(cacheKey);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.data;
  }

  const users = await getAllUsers();
  const students = await readJsonFile<Student[]>("students.json");
  const courseFiles =
    await readJsonFile<CourseFileRecord[]>("courseFiles.json");
  const eventReports =
    await readJsonFile<EventReportRecord[]>("eventReports.json");
  const careerActivities = await readJsonFile<CareerActivityRecord[]>(
    "careerActivities.json",
  );

  const staffAdvisor = normalizedUsername
    ? users.find((user) => {
        const userRoles = user.roles?.length ? user.roles : [user.role];
        const normalizedRoles = userRoles
          .map((role) => normalizeRoleInput(role))
          .filter((role): role is "staff-advisor" => role === "staff-advisor");
        const isStaffAdvisor =
          normalizedRoles.includes("staff-advisor") ||
          user.isStaffAdvisor === true;
        return (
          isStaffAdvisor &&
          normalizeIdentity(user.username) === normalizedUsername
        );
      })
    : undefined;
  const staffAdvisorId = staffAdvisor ? serializeId(staffAdvisor.id) : "";

  const facultyUsers = users.filter(
    (user) =>
      (user.roles?.includes("faculty") || user.role === "faculty") &&
      user.role !== "admin",
  );
  const facultyById = new Map(
    facultyUsers.map((user) => [serializeId(user.id), user]),
  );

  const scopedStudents = staffAdvisorId
    ? students.filter(
        (student) => serializeId(student.advisorId) === staffAdvisorId,
      )
    : [];

  let placedStudents = 0;
  let inProcess = 0;
  let cgpaTotal = 0;
  let attendanceTotal = 0;
  const batchYearSet = new Set<string>();

  for (const student of scopedStudents) {
    if (student.placementStatus === "Placed") {
      placedStudents += 1;
    } else if (student.placementStatus === "In Process") {
      inProcess += 1;
    }

    cgpaTotal += student.cgpa;
    attendanceTotal += student.attendance;

    const year = String(student.batchYear ?? "").trim();
    if (year) {
      batchYearSet.add(year);
    }
  }

  const scopedStudentIds = new Set(
    scopedStudents.map((student) => serializeId(student.id)),
  );

  const totalStudents = scopedStudents.length;
  const batchYear =
    scopedStudents.find((student) => student.batchYear)?.batchYear ?? "";
  const averageCGPA =
    totalStudents > 0 ? Math.round((cgpaTotal / totalStudents) * 10) / 10 : 0;
  const averageAttendance =
    totalStudents > 0 ? Math.round(attendanceTotal / totalStudents) : 0;

  let approvedFiles = 0;
  let approvedReports = 0;
  let overallTotalFiles = 0;
  let overallApproved = 0;
  let overallInReview = 0;
  let overallRejected = 0;

  const batchGroups = new Map<
    string,
    {
      totalFiles: number;
      approvedFiles: number;
      inReviewFiles: number;
      rejectedFiles: number;
      faculty: Map<
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
      >;
    }
  >();

  for (const file of courseFiles) {
    if (file.status === "Approved") {
      approvedFiles += 1;
    }

    const academicYear = String(file.academicYear ?? "").trim();
    if (!academicYear || !batchYearSet.has(academicYear)) {
      continue;
    }

    overallTotalFiles += 1;
    const isApproved = file.status === "Approved";
    const isRejected = file.status === "Rejected";
    if (isApproved) {
      overallApproved += 1;
    } else if (isRejected) {
      overallRejected += 1;
    } else {
      overallInReview += 1;
    }

    if (!batchGroups.has(academicYear)) {
      batchGroups.set(academicYear, {
        totalFiles: 0,
        approvedFiles: 0,
        inReviewFiles: 0,
        rejectedFiles: 0,
        faculty: new Map(),
      });
    }

    const batchEntry = batchGroups.get(academicYear);
    if (!batchEntry) {
      continue;
    }

    batchEntry.totalFiles += 1;
    if (isApproved) {
      batchEntry.approvedFiles += 1;
    } else if (isRejected) {
      batchEntry.rejectedFiles += 1;
    } else {
      batchEntry.inReviewFiles += 1;
    }

    if (!file.facultyId) {
      continue;
    }

    const userId = serializeId(file.facultyId);
    const facultyUser = facultyById.get(userId);
    if (!facultyUser) {
      continue;
    }

    if (!batchEntry.faculty.has(userId)) {
      batchEntry.faculty.set(userId, {
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

    const facultySummary = batchEntry.faculty.get(userId);
    if (!facultySummary) {
      continue;
    }

    facultySummary.filesTotal += 1;
    if (isApproved) {
      facultySummary.filesApproved += 1;
    } else if (isRejected) {
      facultySummary.filesRejected += 1;
    } else {
      facultySummary.filesInReview += 1;
    }
  }

  for (const report of eventReports) {
    if (report.status === "Approved") {
      approvedReports += 1;
    }
  }

  const batchCourseOverview: BatchCourseOverview = {
    overall: {
      batchYear: "All",
      totalFiles: overallTotalFiles,
      approvedFiles: overallApproved,
      inReviewFiles: overallInReview,
      rejectedFiles: overallRejected,
      completionRate:
        overallTotalFiles > 0
          ? Math.round((overallApproved / overallTotalFiles) * 100)
          : 0,
    },
    groups: Array.from(batchGroups.entries())
      .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
      .map(([year, batchEntry]) => ({
        progress: {
          batchYear: year,
          totalFiles: batchEntry.totalFiles,
          approvedFiles: batchEntry.approvedFiles,
          inReviewFiles: batchEntry.inReviewFiles,
          rejectedFiles: batchEntry.rejectedFiles,
          completionRate:
            batchEntry.totalFiles > 0
              ? Math.round(
                  (batchEntry.approvedFiles / batchEntry.totalFiles) * 100,
                )
              : 0,
        },
        faculty: Array.from(batchEntry.faculty.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      })),
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

  let totalInternships = 0;
  let activeInternships = 0;
  let completedProjects = 0;
  let skillWorkshops = 0;
  let campusInterviews = 0;

  for (const activity of careerActivities) {
    if (!scopedStudentIds.has(serializeId(activity.studentId))) {
      continue;
    }

    if (activity.type === "internship") {
      totalInternships += 1;
      if (activity.status === "active") {
        activeInternships += 1;
      }
    } else if (activity.type === "project" && activity.status === "completed") {
      completedProjects += 1;
    } else if (activity.type === "workshop") {
      skillWorkshops += 1;
    } else if (activity.type === "interview") {
      campusInterviews += 1;
    }
  }

  const careerStats: CareerStats = {
    totalInternships,
    activeInternships,
    completedProjects,
    skillWorkshops,
    campusInterviews,
  };

  const data: StaffAdvisorDashboardData = {
    stats,
    careerStats,
    students: scopedStudents,
    batchCourseOverview,
  };

  staffAdvisorDashboardCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + STAFF_ADVISOR_DASHBOARD_CACHE_TTL_MS,
  });

  return data;
}

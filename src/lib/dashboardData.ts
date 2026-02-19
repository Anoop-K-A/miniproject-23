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

interface UserRecord {
  id: string;
  username: string;
  name: string;
  role: "faculty" | "auditor" | "staff-advisor" | "admin";
  roles?: ("faculty" | "auditor" | "staff-advisor" | "admin")[];
  department?: string;
  email?: string;
  phone?: string;
  courses?: string[];
  specialization?: string;
  experience?: string;
  facultyRole?: string;
}

interface CourseFileRecord {
  id: string;
  facultyId: string;
  fileName: string;
  status?: string;
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

export async function getFacultyDashboardData(
  username?: string | null,
): Promise<FacultyDashboardData> {
  const users = await readJsonFile<UserRecord[]>("users.json");
  const facultyUsers = users.filter(
    (user) =>
      (user.roles?.includes("faculty") || user.role === "faculty") &&
      user.role !== "admin",
  );
  const courseFiles =
    await readJsonFile<CourseFileRecord[]>("courseFiles.json");
  const eventReports =
    await readJsonFile<EventReportRecord[]>("eventReports.json");

  const selectedUser = username
    ? facultyUsers.find((user) => user.username === username)
    : facultyUsers[0];

  const userId = selectedUser?.id;
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

  const pendingReports = userReports.filter(
    (report) => report.status !== "Approved",
  ).length;

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

  const facultyMembers: FacultyMember[] = facultyUsers.map((user) => ({
    id: user.id,
    name: user.name,
    department: user.department ?? "",
    role: user.facultyRole ?? "Faculty",
    email: user.email ?? user.username,
    phone: user.phone ?? "",
    courses: user.courses ?? [],
    specialization: user.specialization ?? "",
    experience: user.experience ?? "",
  }));

  return {
    stats,
    facultyMembers,
  };
}

export async function getAuditorDashboardData() {
  const users = await readJsonFile<UserRecord[]>("users.json");
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
  const approvedFiles = courseFiles.filter(
    (file) => file.status === "Approved",
  ).length;
  const approvedReports = eventReports.filter(
    (report) => report.status === "Approved",
  ).length;
  const pendingFiles = courseFiles.filter(
    (file) => file.status === "Pending",
  ).length;
  const pendingReports = eventReports.filter(
    (report) => report.status === "Submitted" || report.status === "Draft",
  ).length;
  const rejectedFiles = courseFiles.filter(
    (file) => file.status === "Rejected",
  ).length;
  const rejectedReports = eventReports.filter(
    (report) => report.status === "Rejected",
  ).length;

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

  const facultyMembers: AuditorFacultyMember[] = facultyUsers.map((user) => {
    const facultyFiles = courseFiles.filter(
      (file) => file.facultyId === user.id,
    );
    const facultyReports = eventReports.filter(
      (report) => report.facultyId === user.id,
    );
    return {
      id: user.id,
      name: user.name,
      department: user.department ?? "",
      totalFiles: facultyFiles.length,
      totalReports: facultyReports.length,
      approvedFiles: facultyFiles.filter((file) => file.status === "Approved")
        .length,
      approvedReports: facultyReports.filter(
        (report) => report.status === "Approved",
      ).length,
      pendingFiles: facultyFiles.filter((file) => file.status === "Pending")
        .length,
      pendingReports: facultyReports.filter(
        (report) => report.status === "Submitted" || report.status === "Draft",
      ).length,
      rejectedFiles: facultyFiles.filter((file) => file.status === "Rejected")
        .length,
      rejectedReports: facultyReports.filter(
        (report) => report.status === "Rejected",
      ).length,
    };
  });

  const recentReviews: RecentReview[] = audits
    .map((audit) => {
      const file = courseFiles.find((item) => item.id === audit.entityId);
      const report = eventReports.find((item) => item.id === audit.entityId);
      const facultyId = file?.facultyId ?? report?.facultyId;
      const facultyName = facultyUsers.find(
        (user) => user.id === facultyId,
      )?.name;
      return {
        faculty: facultyName ?? "Faculty",
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
  const users = await readJsonFile<UserRecord[]>("users.json");
  const students = await readJsonFile<Student[]>("students.json");
  const courseFiles =
    await readJsonFile<CourseFileRecord[]>("courseFiles.json");
  const eventReports =
    await readJsonFile<EventReportRecord[]>("eventReports.json");
  const careerActivities = await readJsonFile<CareerActivityRecord[]>(
    "careerActivities.json",
  );

  const staffAdvisor = username
    ? users.find((user) => user.username === username)
    : undefined;
  const scopedStudents = staffAdvisor
    ? students.filter((student) => student.advisorId === staffAdvisor.id)
    : students;

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
    totalInternships: careerActivities.filter(
      (activity) => activity.type === "internship",
    ).length,
    activeInternships: careerActivities.filter(
      (activity) =>
        activity.type === "internship" && activity.status === "active",
    ).length,
    completedProjects: careerActivities.filter(
      (activity) =>
        activity.type === "project" && activity.status === "completed",
    ).length,
    skillWorkshops: careerActivities.filter(
      (activity) => activity.type === "workshop",
    ).length,
    campusInterviews: careerActivities.filter(
      (activity) => activity.type === "interview",
    ).length,
  };

  return {
    stats,
    careerStats,
    students: scopedStudents,
  };
}

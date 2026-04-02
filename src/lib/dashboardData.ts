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

interface DashboardFacultyMember extends FacultyMember {}

const FACULTY_DASHBOARD_CACHE_TTL_MS = 20000;
const STAFF_ADVISOR_DASHBOARD_CACHE_TTL_MS = 30000;
const facultyDashboardCache = new Map<
  string,
  { expiresAt: number; data: FacultyDashboardData }
>();
const staffAdvisorDashboardCache = new Map<
  string,
  { expiresAt: number; data: StaffAdvisorDashboardData }
>();

export interface FacultyDashboardData {
  stats: DashboardStats;
  facultyMembers: FacultyMember[];
}

interface FacultyListResponse {
  facultyMembers: FacultyMember[];
  total?: number;
}

interface FacultyStatsResponse {
  stats: DashboardStats;
}

interface EngagementsResponse {
  engagements: Array<{
    facultyId: string;
    facultyName: string;
    uploadsCount?: number;
    score?: number;
  }>;
}

interface StudentsResponse {
  students: Student[];
}

export interface StaffAdvisorDashboardData {
  stats: StaffStats;
  careerStats: CareerStats;
  students: Student[];
  batchCourseOverview: BatchCourseOverview;
}

function cloneFacultyDashboardData(
  data: FacultyDashboardData,
): FacultyDashboardData {
  return {
    stats: {
      ...data.stats,
      recentActivity: data.stats.recentActivity.map((item) => ({ ...item })),
    },
    facultyMembers: data.facultyMembers.map((member) => ({
      ...member,
      roles: Array.isArray(member.roles) ? [...member.roles] : member.roles,
      courses: Array.isArray(member.courses) ? [...member.courses] : [],
    })),
  };
}

/**
 * Fetch dashboard data from MongoDB via API
 */
async function fetchFromDashboardAPI<T>(endpoint: string): Promise<T> {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000";
  const response = await fetch(
    `${backendBaseUrl.replace(/\/$/, "")}/api/dashboard${endpoint}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`);
  }

  return response.json();
}

export async function getFacultyDashboardData(
  username?: string | null,
): Promise<FacultyDashboardData> {
  const normalizedUsername = normalizeIdentity(username);
  const cacheKey = normalizedUsername || "__anonymous__";
  const cachedEntry = facultyDashboardCache.get(cacheKey);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cloneFacultyDashboardData(cachedEntry.data);
  }

  try {
    // Fetch dashboard data from MongoDB
    const dashboardData =
      await fetchFromDashboardAPI<FacultyListResponse>("/faculty-list");
    let facultyMembers = dashboardData.facultyMembers || [];

    // If username specified, get their individual stats
    const stats: DashboardStats = {
      totalFiles: 0,
      totalReports: 0,
      pendingReports: 0,
      totalParticipants: 0,
      recentActivity: [],
    };

    if (username && facultyMembers.length > 0) {
      const selectedUser = facultyMembers.find((m) => m.name === username);
      if (selectedUser) {
        const statsData = await fetchFromDashboardAPI<FacultyStatsResponse>(
          `/faculty-stats/${selectedUser.id}`,
        );
        Object.assign(stats, statsData.stats);
      }
    }

    const data = {
      stats,
      facultyMembers,
    };

    facultyDashboardCache.set(cacheKey, {
      data: cloneFacultyDashboardData(data),
      expiresAt: Date.now() + FACULTY_DASHBOARD_CACHE_TTL_MS,
    });

    return data;
  } catch (error) {
    console.error("Error fetching faculty dashboard data:", error);
    // Fallback to empty data
    return {
      stats: {
        totalFiles: 0,
        totalReports: 0,
        pendingReports: 0,
        totalParticipants: 0,
        recentActivity: [],
      },
      facultyMembers: [],
    };
  }
}

export async function getAuditorDashboardData(): Promise<{
  stats: AuditorStats;
  facultyMembers: AuditorFacultyMember[];
}> {
  try {
    // Fetch all files and engagements from MongoDB
    const files = await fetchFromDashboardAPI("/all-files");
    const engagements =
      await fetchFromDashboardAPI<EngagementsResponse>("/engagements");

    const stats: AuditorStats = {
      totalFiles: 0,
      totalReports: 0,
      approvedFiles: 0,
      pendingFiles: 0,
      rejectedFiles: 0,
      approvedReports: 0,
      totalFaculty: 0,
      pendingReports: 0,
      rejectedReports: 0,
      completionRate: 0,
    };

    const facultyMembers: AuditorFacultyMember[] = (
      engagements.engagements || []
    ).map((eng: any) => ({
      id: eng.facultyId,
      name: eng.facultyName,
      department: "",
      totalFiles: eng.uploadsCount ?? 0,
      totalReports: 0,
      approvedFiles: 0,
      approvedReports: 0,
      pendingFiles: 0,
      pendingReports: 0,
      rejectedFiles: 0,
      rejectedReports: 0,
      email: "",
      phone: "",
      experience: "",
      profileImageUrl: "",
      resumeUrl: "",
      resumeFileName: "",
    }));

    stats.totalFaculty = facultyMembers.length;
    return {
      stats,
      facultyMembers,
    };
  } catch (error) {
    console.error("Error fetching auditor dashboard data:", error);
    return {
      stats: {
        totalFaculty: 0,
        totalFiles: 0,
        totalReports: 0,
        approvedFiles: 0,
        approvedReports: 0,
        pendingFiles: 0,
        pendingReports: 0,
        rejectedFiles: 0,
        rejectedReports: 0,
        completionRate: 0,
      },
      facultyMembers: [],
    };
  }
}

export async function getStaffAdvisorDashboardData(
  advisorId?: string | null,
): Promise<StaffAdvisorDashboardData> {
  const cacheKey = advisorId || "__anonymous__";
  const cachedEntry = staffAdvisorDashboardCache.get(cacheKey);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return {
      ...cachedEntry.data,
      students: [...(cachedEntry.data.students || [])],
    };
  }

  try {
    // Fetch students and batch overview from MongoDB
    const studentsData =
      await fetchFromDashboardAPI<StudentsResponse>("/students");
    await fetchFromDashboardAPI<EngagementsResponse>("/engagements");

    const students = studentsData.students || [];
    const totalStudents = students.length;

    const stats: StaffStats = {
      totalStudents,
      batchYear: "All",
      placedStudents: 0,
      inProcess: 0,
      averageCGPA: 0,
      averageAttendance: 0,
      totalFaculty: 0,
      approvedFiles: 0,
      approvedReports: 0,
    };

    const careerStats: CareerStats = {
      totalInternships: 0,
      activeInternships: 0,
      completedProjects: 0,
      skillWorkshops: 0,
      campusInterviews: 0,
    };

    const batchCourseOverview: BatchCourseOverview = {
      overall: {
        batchYear: "All",
        totalFiles: 0,
        approvedFiles: 0,
        inReviewFiles: 0,
        rejectedFiles: 0,
        completionRate: 0,
      },
      groups: [],
    };

    const data: StaffAdvisorDashboardData = {
      stats,
      careerStats,
      students,
      batchCourseOverview,
    };

    staffAdvisorDashboardCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + STAFF_ADVISOR_DASHBOARD_CACHE_TTL_MS,
    });

    return data;
  } catch (error) {
    console.error("Error fetching staff advisor dashboard data:", error);
    return {
      stats: {
        totalStudents: 0,
        batchYear: "All",
        placedStudents: 0,
        inProcess: 0,
        averageCGPA: 0,
        averageAttendance: 0,
        totalFaculty: 0,
        approvedFiles: 0,
        approvedReports: 0,
      },
      careerStats: {
        totalInternships: 0,
        activeInternships: 0,
        completedProjects: 0,
        skillWorkshops: 0,
        campusInterviews: 0,
      },
      students: [],
      batchCourseOverview: {
        overall: {
          batchYear: "All",
          totalFiles: 0,
          approvedFiles: 0,
          inReviewFiles: 0,
          rejectedFiles: 0,
          completionRate: 0,
        },
        groups: [],
      },
    };
  }
}

export function clearDashboardCache() {
  facultyDashboardCache.clear();
  staffAdvisorDashboardCache.clear();
}

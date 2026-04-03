import { NextRequest, NextResponse } from "next/server";
import { getStaffAdvisorDashboardData } from "@/lib/dashboardData";
import { resolveStaffAdvisorScope } from "@/lib/staffAdvisorScope";

const EMPTY_STAFF_ADVISOR_DASHBOARD = {
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

export async function GET(request: NextRequest) {
  const scope = await resolveStaffAdvisorScope(request);
  if (!scope?.advisorId) {
    return NextResponse.json(EMPTY_STAFF_ADVISOR_DASHBOARD, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  }

  const data = await getStaffAdvisorDashboardData(scope.advisorId);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
    },
  });
}

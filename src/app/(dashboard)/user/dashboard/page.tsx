import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FacultyMember } from "@/types/faculty";
import { UserFacultyProfiles } from "@/components/user/UserFacultyProfiles";
import { UserSectionNav } from "@/components/user/UserSectionNav";
import { readJsonFile } from "@/lib/jsonDb";
import { getAllUsers } from "@/lib/userStore";
import { getUserSectionCounts } from "@/lib/userSectionCounts";
import { CalendarDays, FileText, Users } from "lucide-react";

export const revalidate = 30;

export default async function UserDashboardPage() {
  const [users, sectionCounts] = await Promise.all([
    getAllUsers(),
    getUserSectionCounts(),
  ]);
  const { approvedCourseCodesCount, eventReportsCount, studentsCount } =
    sectionCounts;

  const facultyUsers: FacultyMember[] = users
    .filter(
      (user) =>
        (user.role === "faculty" || user.roles?.includes("faculty")) &&
        user.role !== "admin",
    )
    .map((user) => ({
      id: String(user.id),
      name: user.name,
      department: user.department ?? "N/A",
      role: user.role,
      roles: user.roles,
      isStaffAdvisor: user.roles?.includes("staff-advisor") ?? false,
      email: user.email ?? user.username ?? "N/A",
      phone: user.phone ?? "N/A",
      courses: Array.isArray(user.courses) ? user.courses : [],
      specialization: user.specialization ?? "General",
      experience: user.experience ?? "",
      resumeUrl: user.resumeUrl,
      resumeFileName: user.resumeFileName,
    }));

  return (
    <main className="space-y-6">
      <UserSectionNav
        courseFilesCount={approvedCourseCodesCount}
        eventReportsCount={eventReportsCount}
        studentsCount={studentsCount}
      />

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-slate-900">
            User Dashboard
          </CardTitle>
          <p className="text-sm text-slate-600">
            Quick overview of faculty profiles, approved course files, and event
            reports.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-slate-600">Faculty Profiles</p>
              <Users className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {facultyUsers.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-slate-600">Approved Course Codes</p>
              <FileText className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {approvedCourseCodesCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-slate-600">Event Reports</p>
              <CalendarDays className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {eventReportsCount}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-slate-900">
            All Faculty Profiles
          </CardTitle>
          <p className="text-sm text-slate-600">
            Browse available faculty and open their submitted portfolio details.
          </p>
        </CardHeader>
        <CardContent>
          <UserFacultyProfiles facultyMembers={facultyUsers} />
        </CardContent>
      </Card>
    </main>
  );
}

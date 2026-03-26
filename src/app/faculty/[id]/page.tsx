import { notFound } from "next/navigation";
import type { FacultyMember } from "@/types/faculty";
import { getAllUsers } from "@/lib/userStore";
import { readJsonFile } from "@/lib/jsonDb";
import type {
  CourseFile,
  EventReport,
} from "@/components/FacultyDashboard/FacultyPortfolio/types";
import { FacultyProfileView } from "@/components/faculty/FacultyProfileView";

interface FacultyProfilePageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 30;

export default async function FacultyProfilePage({
  params,
}: FacultyProfilePageProps) {
  const { id } = await params;

  // Get all users
  const users = await getAllUsers();
  const user = users.find(
    (u) =>
      u.id === id &&
      (u.role === "faculty" || u.roles?.includes("faculty")) &&
      u.role !== "admin",
  );

  if (!user) {
    notFound();
  }

  // Convert user to FacultyMember
  const faculty: FacultyMember = {
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
  };

  // Get course files for this faculty
  const allCourseFiles = await readJsonFile<CourseFile[]>("courseFiles.json");
  const courseFiles = allCourseFiles.filter(
    (file) => file.facultyId === faculty.id,
  );

  // Get event reports for this faculty
  const allEventReports =
    await readJsonFile<EventReport[]>("eventReports.json");
  const eventReports = allEventReports.filter(
    (report) => report.facultyId === faculty.id,
  );

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <FacultyProfileView
          faculty={faculty}
          courseFiles={courseFiles}
          eventReports={eventReports}
        />
      </div>
    </main>
  );
}

import { Badge } from "../../ui/badge";
import { Building, GraduationCap, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { FacultyMember } from "./types";

interface ProfileHeaderProps {
  faculty: FacultyMember;
}

function formatRoleLabel(role: string) {
  const normalized = role.trim().toLowerCase();

  switch (normalized) {
    case "faculty":
      return "Faculty";
    case "staff-advisor":
    case "staff advisor":
      return "Staff Advisor";
    case "auditor":
      return "Auditor";
    case "admin":
      return "Admin";
    default:
      return role
        .split(/[-\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}

export function ProfileHeader({ faculty }: ProfileHeaderProps) {
  const roleCandidates = [
    ...(faculty.roles ?? []),
    faculty.role,
    faculty.isStaffAdvisor ? "staff-advisor" : null,
  ].filter(
    (role): role is string =>
      typeof role === "string" && role.trim().toLowerCase() !== "admin",
  );

  const rolesToDisplay = Array.from(
    new Map(
      roleCandidates.map((role) => {
        const label = formatRoleLabel(role);
        return [label.toLowerCase(), label] as const;
      }),
    ).values(),
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="h-24 w-24 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {faculty.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>

          {/* Faculty Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{faculty.name}</h2>
                {rolesToDisplay.map((roleLabel) => (
                  <Badge key={roleLabel} className="bg-blue-100 text-blue-800">
                    {roleLabel}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-600">{faculty.specialization}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Department:</span>
                <span>{faculty.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Experience:</span>
                <span>{faculty.experience}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Email:</span>
                <a
                  href={`mailto:${faculty.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {faculty.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Phone:</span>
                <span>{faculty.phone}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Courses Teaching:</p>
              <div className="flex flex-wrap gap-2">
                {faculty.courses.map((course, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50">
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

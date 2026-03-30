import { Badge } from "../../ui/badge";
import { FileText, Mail, Phone } from "lucide-react";
import { FacultyMember } from "./types";

interface FacultyHeaderProps {
  faculty: FacultyMember;
}

export function FacultyHeader({ faculty }: FacultyHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-4">
        {faculty.profileImageUrl ? (
          <img
            src={faculty.profileImageUrl}
            alt={`${faculty.name} profile`}
            className="h-16 w-16 rounded-full border object-cover"
          />
        ) : (
          <div className="h-16 w-16 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {faculty.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        )}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{faculty.name}</h2>
          <p className="text-gray-600">{faculty.department}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">{faculty.totalFiles} Course Files</Badge>
            <Badge variant="outline">
              {faculty.totalReports} Event Reports
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {faculty.email ? (
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${faculty.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {faculty.email}
                </a>
              </div>
            ) : null}
            {faculty.phone ? (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{faculty.phone}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
              <FileText className="h-4 w-4 text-gray-400" />
              {faculty.resumeUrl ? (
                <a
                  href={faculty.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {faculty.resumeFileName || "View Resume"}
                </a>
              ) : (
                <span className="text-gray-500">Resume not uploaded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

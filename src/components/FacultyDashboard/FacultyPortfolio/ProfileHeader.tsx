import type { ReactNode } from "react";
import { Badge } from "../../ui/badge";
import {
  BookOpen,
  Building,
  FileText,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { FacultyMember } from "./types";

interface ProfileHeaderProps {
  faculty: FacultyMember;
}

interface InfoTileProps {
  icon: typeof Building;
  label: string;
  children: ReactNode;
}

function formatInitials(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
}

function showValue(value: string | undefined, fallback = "Not provided") {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function hasExtension(value: string | undefined, extension: string) {
  if (!value) {
    return false;
  }

  const normalized = value.split("?")[0].split("#")[0].toLowerCase();
  return normalized.endsWith(extension);
}

function getPdfPreviewUrl(url: string) {
  const hashIndex = url.indexOf("#");

  if (hashIndex >= 0) {
    const existingHash = url.slice(hashIndex + 1).toLowerCase();
    if (existingHash.includes("zoom=") || existingHash.includes("view=")) {
      return url;
    }
    return url + "&zoom=page-width&view=FitH";
  }

  return url + "#zoom=page-width&view=FitH";
}

function InfoTile({ icon: Icon, label, children }: InfoTileProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <div className="mt-1 wrap-break-word text-sm font-medium text-slate-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
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

  const initials = formatInitials(faculty.name);
  const specialization = faculty.specialization?.trim();
  const courses = faculty.courses.filter((course) => course.trim().length > 0);
  const email = faculty.email.trim();
  const resumeFileName = showValue(faculty.resumeFileName, "View resume");
  const canPreviewInline =
    hasExtension(faculty.resumeFileName, ".pdf") ||
    hasExtension(faculty.resumeUrl, ".pdf");
  const previewUrl =
    canPreviewInline && faculty.resumeUrl
      ? getPdfPreviewUrl(faculty.resumeUrl)
      : faculty.resumeUrl;

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="bg-linear-to-br from-slate-50 via-white to-slate-50 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="shrink-0">
              {faculty.profileImageUrl ? (
                <img
                  src={faculty.profileImageUrl}
                  alt={`${faculty.name} profile`}
                  className="h-24 w-24 rounded-3xl border border-blue-100 object-cover shadow-md ring-4 ring-blue-100"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-blue-600 to-indigo-600 text-3xl font-semibold text-white shadow-md ring-4 ring-blue-100">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    {faculty.name}
                  </h2>
                  {rolesToDisplay.map((roleLabel) => (
                    <Badge
                      key={roleLabel}
                      className="border border-blue-200 bg-blue-100/80 text-blue-800"
                    >
                      {roleLabel}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-slate-600">
                  {specialization || "Faculty Member"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoTile icon={Building} label="Department">
                  {showValue(faculty.department)}
                </InfoTile>
                <InfoTile icon={GraduationCap} label="Experience">
                  {showValue(faculty.experience)}
                </InfoTile>
                <InfoTile icon={Mail} label="Email">
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      className="text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
                    >
                      {email}
                    </a>
                  ) : (
                    <span className="text-slate-500">Not provided</span>
                  )}
                </InfoTile>
                <InfoTile icon={Phone} label="Phone">
                  {showValue(faculty.phone)}
                </InfoTile>
                <div className="md:col-span-2">
                  <InfoTile icon={FileText} label="Resume">
                    {faculty.resumeUrl ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-left text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
                          >
                            {resumeFileName}
                          </button>
                        </DialogTrigger>
                        <DialogContent className="w-[96vw]! max-w-[96vw]! sm:w-[92vw]! sm:max-w-[92vw]! lg:w-[82vw]! lg:max-w-[82vw]! xl:w-[78vw]! xl:max-w-[78vw]! 2xl:w-[75vw]! 2xl:max-w-[75vw]!">
                          <DialogHeader>
                            <DialogTitle>Resume Preview</DialogTitle>
                            <DialogDescription>
                              {faculty.name}&apos;s resume
                            </DialogDescription>
                          </DialogHeader>

                          {canPreviewInline ? (
                            <iframe
                              src={previewUrl}
                              title="Resume preview"
                              className="h-[82vh] w-full rounded-md border border-slate-200"
                            />
                          ) : (
                            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                              Preview is available for PDF files. Please open
                              the file in a new tab to view this format.
                            </div>
                          )}

                          <div className="flex justify-end">
                            <a
                              href={faculty.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
                            >
                              Open in new tab
                            </a>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-slate-500">Not uploaded yet</span>
                    )}
                  </InfoTile>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  Courses Teaching
                </div>

                {courses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course, index) => (
                      <Badge
                        key={`${course}-${index}`}
                        variant="outline"
                        className="border-slate-200 bg-slate-100 text-slate-700"
                      >
                        {course}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No courses assigned yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

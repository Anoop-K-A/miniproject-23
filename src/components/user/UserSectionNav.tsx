"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileText, Users, LayoutDashboard } from "lucide-react";

interface UserSectionNavProps {
  courseFilesCount?: number;
  eventReportsCount?: number;
  studentsCount?: number;
}

export function UserSectionNav({
  courseFilesCount = 0,
  eventReportsCount = 0,
  studentsCount = 0,
}: UserSectionNavProps) {
  const pathname = usePathname();

  const userSections = [
    {
      key: "dashboards",
      label: "Dashboards",
      href: "/user/dashboard",
      icon: LayoutDashboard,
    },
    {
      key: "course-files",
      label: `Course Files (${courseFilesCount})`,
      href: "/user/course-files",
      icon: FileText,
    },
    {
      key: "event-reports",
      label: `Event Reports (${eventReportsCount})`,
      href: "/user/event-reports",
      icon: CalendarDays,
    },
    {
      key: "students",
      label: `Students (${studentsCount})`,
      href: "/user/students",
      icon: Users,
    },
  ] as const;

  return (
    <nav className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/90 p-1.5 shadow-sm">
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-4">
        {userSections.map((section) => {
          const isActive = pathname === section.href;
          const Icon = section.icon;

          return (
            <Link
              key={section.key}
              href={section.href}
              className={[
                "group inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-700 hover:bg-white/80 hover:text-slate-900",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-4 w-4 transition-transform duration-200",
                  isActive ? "scale-105" : "group-hover:scale-105",
                ].join(" ")}
              />
              <span>{section.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

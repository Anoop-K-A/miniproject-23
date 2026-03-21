"use client";

import { FacultyCard } from "@/components/faculty/FacultyCard";
import type { FacultyMember } from "@/types/faculty";

interface UserFacultyProfilesProps {
  facultyMembers: FacultyMember[];
}

export function UserFacultyProfiles({
  facultyMembers,
}: UserFacultyProfilesProps) {
  if (facultyMembers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-800">
          No faculty profiles found
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Faculty profiles will appear here once they are available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {facultyMembers.map((faculty) => (
        <FacultyCard key={faculty.id} faculty={faculty} onSelect={() => {}} />
      ))}
    </div>
  );
}

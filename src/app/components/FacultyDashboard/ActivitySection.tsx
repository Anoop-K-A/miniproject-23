import { RecentActivity } from "../faculty/RecentActivity";
import { FacultyMember } from "../../types/faculty";
import { Activity } from "./types";

interface ActivitySectionProps {
  activities: Activity[];
  facultyMembers: FacultyMember[];
  onSelectFaculty: (faculty: FacultyMember) => void;
}

export function ActivitySection({ activities }: ActivitySectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <RecentActivity activities={activities} />
    </div>
  );
}

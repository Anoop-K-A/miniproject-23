import { Button } from "../components/ui/button";
import { GraduationCap, Shield, ShieldCheck, Users } from "lucide-react";
import type { UserRole } from "@/lib/roles";

interface RoleSwitcherProps {
  currentRole: UserRole;
  assignedRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
}

export function RoleSwitcher({
  currentRole,
  assignedRoles,
  onRoleChange,
}: RoleSwitcherProps) {
  const allRoles: Array<{
    role: UserRole;
    label: string;
    icon: typeof GraduationCap;
  }> = [
    { role: "faculty", label: "Faculty Portal", icon: GraduationCap },
    { role: "auditor", label: "Auditor Portal", icon: Shield },
    { role: "staff-advisor", label: "Staff Advisor Portal", icon: Users },
    { role: "admin", label: "Admin Portal", icon: ShieldCheck },
  ];

  // Always show faculty role (everyone can upload as faculty)
  // Plus show any other assigned roles
  const visibleRoles = allRoles.filter(
    ({ role }) => role === "faculty" || assignedRoles.includes(role),
  );

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {visibleRoles.map(({ role, label, icon: Icon }) => (
        <Button
          key={role}
          variant={currentRole === role ? "default" : "outline"}
          onClick={() => {
            onRoleChange(role);
          }}
          className="flex items-center gap-2"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}

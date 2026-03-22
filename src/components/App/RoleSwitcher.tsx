import { Button } from "@/components/ui/button";
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

  // Admin is an exclusive portal role in UI.
  const visibleRoles = assignedRoles.includes("admin")
    ? allRoles.filter(({ role }) => role === "admin")
    : allRoles.filter(
        ({ role }) => role === "faculty" || assignedRoles.includes(role),
      );

  return (
    <div className="mb-8 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-[0_10px_24px_rgba(15,38,65,0.08)] backdrop-blur-sm">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Switch Portal Role
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleRoles.map(({ role, label, icon: Icon }) => (
          <Button
            key={role}
            variant={currentRole === role ? "default" : "outline"}
            onClick={() => {
              onRoleChange(role);
            }}
            className="h-10 gap-2 rounded-lg"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

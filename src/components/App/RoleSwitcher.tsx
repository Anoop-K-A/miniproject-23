import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { GraduationCap, Shield, ShieldCheck, Users } from "lucide-react";
import type { UserRole } from "@/lib/roles";

interface RoleSwitcherProps {
  currentRole: UserRole;
  assignedRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
  variant?: "panel" | "inline";
  switchingRole?: UserRole | null;
}

export function RoleSwitcher({
  currentRole,
  assignedRoles,
  onRoleChange,
  variant = "panel",
  switchingRole = null,
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

  const isInline = variant === "inline";
  const isSwitching = Boolean(switchingRole);

  return (
    <div
      className={
        isInline
          ? "rounded-xl border border-border/60 bg-card/70 p-2"
          : "mb-8 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-[0_10px_24px_rgba(15,38,65,0.08)] backdrop-blur-sm"
      }
    >
      {!isInline && (
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Switch Portal Role
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {visibleRoles.map(({ role, label, icon: Icon }) => {
          const isTargetSwitching = switchingRole === role;

          return (
            <Button
              key={role}
              variant={currentRole === role ? "default" : "outline"}
              disabled={isSwitching}
              onClick={() => {
                onRoleChange(role);
              }}
              className={
                isInline
                  ? "h-9 gap-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                  : "h-10 gap-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
              }
              aria-busy={isTargetSwitching}
            >
              {isTargetSwitching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {isTargetSwitching
                ? "Opening..."
                : isInline
                  ? label.replace(" Portal", "")
                  : label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

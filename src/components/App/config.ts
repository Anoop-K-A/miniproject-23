import { GraduationCap, Shield, ShieldCheck, Users } from "lucide-react";
import type { UserRole } from "@/lib/roles";

export interface RoleInfo {
  name: string;
  icon: typeof GraduationCap;
  color: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleInfo> = {
  faculty: {
    name: "Faculty",
    icon: GraduationCap,
    color: "bg-blue-600",
  },
  auditor: {
    name: "Quality Auditor",
    icon: Shield,
    color: "bg-orange-600",
  },
  "staff-advisor": {
    name: "Staff Advisor",
    icon: Users,
    color: "bg-green-600",
  },
  admin: {
    name: "Administrator",
    icon: ShieldCheck,
    color: "bg-slate-800",
  },
};

export function getRoleInfo(role: UserRole): RoleInfo {
  return ROLE_CONFIG[role];
}

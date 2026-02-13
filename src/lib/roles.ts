export type UserRole = "faculty" | "auditor" | "staff-advisor" | "admin";

export const ROLE_PATHS: Record<UserRole, string> = {
  faculty: "/faculty",
  auditor: "/auditor",
  "staff-advisor": "/staff-advisor",
  admin: "/admin",
};

export const VALID_ROLES: UserRole[] = [
  "faculty",
  "auditor",
  "staff-advisor",
  "admin",
];

export function getDashboardPath(role: UserRole) {
  if (role === "admin") {
    return ROLE_PATHS.admin;
  }
  return `${ROLE_PATHS[role]}/dashboard`;
}

export function isValidRole(role: string | undefined | null): role is UserRole {
  return role ? VALID_ROLES.includes(role as UserRole) : false;
}
export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith(ROLE_PATHS.faculty)) {
    return "faculty";
  }
  if (pathname.startsWith(ROLE_PATHS.auditor)) {
    return "auditor";
  }
  if (pathname.startsWith(ROLE_PATHS["staff-advisor"])) {
    return "staff-advisor";
  }
  if (pathname.startsWith(ROLE_PATHS.admin)) {
    return "admin";
  }
  return null;
}

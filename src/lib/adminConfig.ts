import type { UserRole } from "@/lib/roles";

export const PRIMARY_ADMIN_EMAIL = "admin@collage.com";
export const PRIMARY_ADMIN_USERNAME = "Admin";
export const PRIMARY_ADMIN_PASSWORD = "Admin@123";
export const PRIMARY_ADMIN_NAME = "Admin User";

export const NON_ADMIN_ROLES: UserRole[] = [
  "faculty",
  "auditor",
  "staff-advisor",
  "user",
];

export const FACULTY_ASSIGNABLE_ROLES: UserRole[] = [
  "faculty",
  "auditor",
  "staff-advisor",
];

export function normalizeEmail(email: string | undefined | null): string {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function normalizeUsername(username: string | undefined | null): string {
  return String(username || "")
    .trim()
    .toLowerCase();
}

export function isPrimaryAdminEmail(email: string | undefined | null): boolean {
  return normalizeEmail(email) === PRIMARY_ADMIN_EMAIL;
}

export function isPrimaryAdminUsername(
  username: string | undefined | null,
): boolean {
  return (
    normalizeUsername(username) === normalizeUsername(PRIMARY_ADMIN_USERNAME)
  );
}

export function normalizeRoleInput(
  role: string | undefined | null,
): UserRole | null {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (value === "faculty") {
    return "faculty";
  }

  if (value === "auditor") {
    return "auditor";
  }

  if (
    value === "staff-advisor" ||
    value === "staff advisor" ||
    value === "staffadvisor"
  ) {
    return "staff-advisor";
  }

  if (value === "user") {
    return "user";
  }

  if (value === "admin") {
    return "admin";
  }

  return null;
}

export function sanitizeNonAdminRoles(
  roles: Array<string | null | undefined>,
): UserRole[] {
  const uniqueRoles = Array.from(
    new Set(
      roles
        .map((role) => normalizeRoleInput(role))
        .filter((role): role is UserRole => Boolean(role) && role !== "admin"),
    ),
  );

  return uniqueRoles.length > 0 ? uniqueRoles : ["faculty"];
}

export function sanitizeFacultyAssignableRoles(
  roles: Array<string | null | undefined>,
): UserRole[] {
  const uniqueRoles = Array.from(
    new Set(
      roles
        .map((role) => normalizeRoleInput(role))
        .filter(
          (role): role is UserRole =>
            Boolean(role) && FACULTY_ASSIGNABLE_ROLES.includes(role),
        ),
    ),
  );

  return uniqueRoles.length > 0 ? uniqueRoles : ["faculty"];
}

export function includesAdminRole(
  roles: Array<string | null | undefined>,
): boolean {
  return roles.some((role) => normalizeRoleInput(role) === "admin");
}

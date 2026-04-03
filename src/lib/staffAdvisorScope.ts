import { NextRequest } from "next/server";
import { findUserById, findUserByUsername } from "@/lib/userStore";
import { normalizeRoleInput } from "@/lib/adminConfig";

export interface StaffAdvisorScope {
  advisorId: string;
  username: string;
}

function normalizeIdentity(value?: string | null) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();

  // Query strings may encode spaces as '+'. Keep '+' for emails/usernames.
  if (!raw.includes("@") && raw.includes("+")) {
    return raw.replace(/\+/g, " ");
  }

  return raw;
}

export async function resolveStaffAdvisorScope(
  request: NextRequest,
): Promise<StaffAdvisorScope | null> {
  const cookieRole = normalizeRoleInput(
    request.cookies.get("auth_role")?.value,
  );
  const queryAdvisorId =
    request.nextUrl.searchParams.get("advisorId") ??
    request.nextUrl.searchParams.get("userId") ??
    request.nextUrl.searchParams.get("id");
  const queryUsername = request.nextUrl.searchParams.get("username");
  const cookieUsername = request.cookies.get("auth_user")?.value ?? null;
  const username = normalizeIdentity(queryUsername ?? cookieUsername);

  const userByUsername = username
    ? ((await findUserByUsername(username)) ??
      (username.includes(" ")
        ? await findUserByUsername(username.replace(/\s+/g, "+"))
        : null))
    : null;
  const userById = queryAdvisorId
    ? await findUserById(String(queryAdvisorId))
    : null;
  const user = userByUsername ?? userById;

  if (!user) {
    if (cookieRole === "staff-advisor" && queryAdvisorId) {
      return {
        advisorId: String(queryAdvisorId),
        username,
      };
    }
    return null;
  }

  const roles = user.roles?.length ? user.roles : [user.role];
  const normalizedRoles = roles
    .map((role) => normalizeRoleInput(role))
    .filter(
      (
        role,
      ): role is "staff-advisor" | "faculty" | "auditor" | "admin" | "user" =>
        Boolean(role),
    );
  const isStaffAdvisor =
    normalizedRoles.includes("staff-advisor") ||
    user.isStaffAdvisor === true ||
    cookieRole === "staff-advisor";

  if (!isStaffAdvisor) {
    return null;
  }

  return {
    advisorId: String(user.id),
    username: normalizeIdentity(user.username || username),
  };
}

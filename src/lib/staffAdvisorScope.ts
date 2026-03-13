import { NextRequest } from "next/server";
import { findUserByUsername } from "@/lib/userStore";

export interface StaffAdvisorScope {
  advisorId: string;
  username: string;
}

function normalizeIdentity(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export async function resolveStaffAdvisorScope(
  request: NextRequest,
): Promise<StaffAdvisorScope | null> {
  const queryUsername = request.nextUrl.searchParams.get("username");
  const cookieUsername = request.cookies.get("auth_user")?.value ?? null;
  const username = normalizeIdentity(queryUsername ?? cookieUsername);

  if (!username) {
    return null;
  }

  const user = await findUserByUsername(username);
  if (!user) {
    return null;
  }

  const roles = user.roles?.length ? user.roles : [user.role];
  const isStaffAdvisor =
    roles.includes("staff-advisor") || user.role === "staff-advisor";

  if (!isStaffAdvisor) {
    return null;
  }

  return {
    advisorId: String(user.id),
    username,
  };
}

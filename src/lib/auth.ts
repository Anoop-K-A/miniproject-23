import type { UserRole } from "@/lib/roles";
import {
  findUserByUsername as findStoredUserByUsername,
  type UserRecord,
} from "@/lib/userStore";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  department?: string;
}

export interface AuthResult {
  user: AuthUser;
  status?: string;
}

export async function findUserByUsername(username: string) {
  return findStoredUserByUsername(username);
}

export async function verifyCredentials(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user || user.password !== password) {
    return null;
  }

  const { id, name, role, roles, department } = user;
  return {
    user: {
      id,
      username: user.username,
      name,
      role,
      roles: roles || [role],
      department,
    },
    status: user.status,
  } satisfies AuthResult;
}

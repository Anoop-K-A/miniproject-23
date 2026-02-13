import type { UserRole } from "@/lib/roles";
import { readJsonFile } from "@/lib/jsonDb";

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface AuthResult {
  user: AuthUser;
  status?: string;
}

export async function findUserByUsername(username: string) {
  const users = await readJsonFile<UserRecord[]>("users.json");
  return users.find((user) => user.username === username);
}

export async function verifyCredentials(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user || user.password !== password) {
    return null;
  }

  const { id, name, role, department } = user;
  return {
    user: {
      id,
      username: user.username,
      name,
      role,
      department,
    },
    status: user.status,
  } satisfies AuthResult;
}

import type { UserRecord } from "@/lib/userStore";

// Only seed the admin user - all other test users should be created via registration
export const userSeedData: UserRecord[] = [
  {
    id: "admin-1",
    username: "Admin",
    password: "Admin@123",
    name: "Admin User",
    role: "admin",
    roles: ["admin"],
    department: "Administration",
    email: "admin@collage.com",
    status: "active",
    createdAt: "2026-02-13T00:00:00.000Z",
    updatedAt: "2026-02-18T10:24:05.555Z",
    lastActiveAt: "2026-02-20T22:41:26.075Z",
  },
];

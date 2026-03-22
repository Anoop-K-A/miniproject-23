"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { UserRole } from "@/lib/roles";

const VALID_ROLES: UserRole[] = [
  "faculty",
  "auditor",
  "staff-advisor",
  "admin",
  "user",
];

function sanitizeRoles(
  inputRoles: Array<UserRole | string | undefined | null>,
) {
  const filtered = Array.from(
    new Set(
      inputRoles.filter((role): role is UserRole =>
        VALID_ROLES.includes(role as UserRole),
      ),
    ),
  );

  if (filtered.includes("admin")) {
    return ["admin"] as UserRole[];
  }

  return filtered;
}

function normalizeAuthPayload(authUser: AuthUser) {
  const candidateRoles = sanitizeRoles([
    authUser.role,
    ...(authUser.roles || []),
  ]);
  const roles = candidateRoles.length > 0 ? candidateRoles : ["faculty"];
  const activeRole = roles.includes("admin")
    ? "admin"
    : roles.includes(authUser.role)
      ? authUser.role
      : roles[0];

  return {
    user: {
      ...authUser,
      role: activeRole,
      roles,
    },
    roles,
    activeRole,
  };
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  department?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  assignedRoles: UserRole[];
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  register: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("faculty");
  const [assignedRoles, setAssignedRoles] = useState<UserRole[]>(["faculty"]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuthState = (
    nextUser: AuthUser,
    activeRole: UserRole,
    roles: UserRole[],
  ) => {
    setUser(nextUser);
    setUserRole(activeRole);
    setAssignedRoles(roles);
    localStorage.setItem("auth_authenticated", "true");
    localStorage.setItem("auth_role", activeRole);
    localStorage.setItem("auth_roles", JSON.stringify(roles));
    localStorage.setItem("auth_user", JSON.stringify(nextUser));

    document.cookie = `auth_authenticated=true; path=/`;
    document.cookie = `auth_role=${activeRole}; path=/`;
    document.cookie = `auth_user=${nextUser.username}; path=/`;
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("auth_authenticated");
    const savedRole = localStorage.getItem("auth_role") as UserRole;
    const savedRoles = localStorage.getItem("auth_roles");
    const savedUser = localStorage.getItem("auth_user");

    let parsedUser: AuthUser | null = null;
    let parsedRoles: UserRole[] = [];

    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser) as AuthUser;
      } catch {
        parsedUser = null;
      }
    }

    if (savedRoles) {
      try {
        parsedRoles = sanitizeRoles(JSON.parse(savedRoles) as UserRole[]);
      } catch {
        parsedRoles = [];
      }
    }

    if (savedAuth === "true" && savedRole) {
      setIsAuthenticated(true);

      const hydratedRoles = sanitizeRoles([
        savedRole,
        ...parsedRoles,
        parsedUser?.role,
        ...(parsedUser?.roles || []),
      ]);

      const normalizedRoles =
        hydratedRoles.length > 0 ? hydratedRoles : ["faculty"];
      const normalizedRole = normalizedRoles.includes("admin")
        ? "admin"
        : normalizedRoles.includes(savedRole)
          ? savedRole
          : normalizedRoles[0];

      setUserRole(normalizedRole);
      setAssignedRoles(normalizedRoles);

      localStorage.setItem("auth_authenticated", "true");
      localStorage.setItem("auth_role", normalizedRole);
      localStorage.setItem("auth_roles", JSON.stringify(normalizedRoles));
      document.cookie = "auth_authenticated=true; path=/";
      document.cookie = `auth_role=${normalizedRole}; path=/`;

      if (parsedUser) {
        const hydratedUser = {
          ...parsedUser,
          role: normalizedRole,
          roles: normalizedRoles,
        };
        setUser(hydratedUser);
        localStorage.setItem("auth_user", JSON.stringify(hydratedUser));
        document.cookie = `auth_user=${hydratedUser.username}; path=/`;
      }
    }

    setIsLoading(false);
  }, []);

  const login = (authUser: AuthUser) => {
    const normalized = normalizeAuthPayload(authUser);
    setIsAuthenticated(true);
    persistAuthState(normalized.user, normalized.activeRole, normalized.roles);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole("faculty");
    setAssignedRoles(["faculty"]);
    setUser(null);
    localStorage.removeItem("auth_authenticated");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_roles");
    localStorage.removeItem("auth_user");

    document.cookie = "auth_authenticated=; path=/; Max-Age=0";
    document.cookie = "auth_role=; path=/; Max-Age=0";
    document.cookie = "auth_user=; path=/; Max-Age=0";
  };

  const switchRole = (role: UserRole) => {
    if (!assignedRoles.includes(role)) {
      return;
    }

    setUserRole(role);
    localStorage.setItem("auth_role", role);
    document.cookie = `auth_role=${role}; path=/`;

    if (user) {
      const nextUser = { ...user, role };
      setUser(nextUser);
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
      document.cookie = `auth_user=${nextUser.username}; path=/`;
    }
  };

  const register = (role: UserRole) => {
    setUserRole(role);
    setAssignedRoles([role]);
    setIsAuthenticated(true);
    localStorage.setItem("auth_authenticated", "true");
    localStorage.setItem("auth_role", role);
    localStorage.setItem("auth_roles", JSON.stringify([role]));
    document.cookie = `auth_authenticated=true; path=/`;
    document.cookie = `auth_role=${role}; path=/`;
  };

  // Keep role assignments synced so admin role updates reflect without page refresh.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    let isDisposed = false;
    const hasAdminRole = assignedRoles.includes("admin");

    const syncCurrentUser = async () => {
      try {
        const response = await fetch(
          `/api/users/${encodeURIComponent(user.id)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          user?: Partial<AuthUser> & { role?: string; roles?: string[] };
        };

        if (isDisposed || !data.user?.role) {
          return;
        }

        const resolvedRoles =
          Array.isArray(data.user.roles) && data.user.roles.length > 0
            ? data.user.roles
            : [data.user.role];

        const normalizedRoles = sanitizeRoles([
          ...resolvedRoles,
          data.user.role,
        ]);

        if (normalizedRoles.length === 0) {
          return;
        }

        const activeRole = normalizedRoles.includes("admin")
          ? "admin"
          : normalizedRoles.includes(userRole)
            ? userRole
            : normalizedRoles[0];

        const nextUser: AuthUser = {
          id: data.user.id || user.id,
          username: data.user.username || user.username,
          name: data.user.name || user.name,
          role: activeRole,
          roles: normalizedRoles,
          department:
            data.user.department !== undefined
              ? data.user.department
              : user.department,
        };

        const rolesChanged =
          normalizedRoles.join("|") !== assignedRoles.join("|");
        const roleChanged = activeRole !== userRole;
        const profileChanged =
          nextUser.username !== user.username ||
          nextUser.name !== user.name ||
          nextUser.department !== user.department;

        if (!rolesChanged && !roleChanged && !profileChanged) {
          return;
        }

        persistAuthState(nextUser, activeRole, normalizedRoles);
      } catch (error) {
        console.error("Auth sync error:", error);
      }
    };

    const onFocus = () => {
      syncCurrentUser();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncCurrentUser();
      }
    };

    syncCurrentUser();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = hasAdminRole
      ? window.setInterval(syncCurrentUser, 300000) // 5 minutes instead of 30s - reduces API calls by 10x
      : null;

    return () => {
      isDisposed = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [
    isAuthenticated,
    user?.id,
    user?.username,
    user?.name,
    user?.department,
    userRole,
    assignedRoles,
  ]);

  const value = {
    isAuthenticated,
    userRole,
    assignedRoles,
    user,
    login,
    register,
    logout,
    switchRole,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

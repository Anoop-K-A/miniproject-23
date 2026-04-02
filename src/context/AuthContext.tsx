"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  const roles: UserRole[] =
    candidateRoles.length > 0 ? candidateRoles : ["faculty"];
  const activeRole = (
    roles.includes("admin")
      ? "admin"
      : roles.includes(authUser.role)
        ? authUser.role
        : roles[0]
  ) as UserRole;

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
  profileImageUrl?: string;
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
  updateUserProfile: (patch: Partial<AuthUser>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("faculty");
  const [assignedRoles, setAssignedRoles] = useState<UserRole[]>(["faculty"]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRoleRef = useRef<UserRole>("faculty");
  const assignedRolesRef = useRef<UserRole[]>(["faculty"]);
  const userRef = useRef<AuthUser | null>(null);

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

      const normalizedRoles: UserRole[] =
        hydratedRoles.length > 0 ? hydratedRoles : ["faculty"];
      const normalizedRole = (
        normalizedRoles.includes("admin")
          ? "admin"
          : normalizedRoles.includes(savedRole)
            ? savedRole
            : normalizedRoles[0]
      ) as UserRole;

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
    if (!assignedRoles.includes(role) || role === userRole) {
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

  useEffect(() => {
    userRoleRef.current = userRole;
    assignedRolesRef.current = assignedRoles;
    userRef.current = user;
  }, [userRole, assignedRoles, user]);

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

  const updateUserProfile = (patch: Partial<AuthUser>) => {
    if (!user) {
      return;
    }

    const nextUser: AuthUser = {
      ...user,
      ...patch,
      role:
        patch.role && assignedRoles.includes(patch.role)
          ? patch.role
          : user.role,
      roles: user.roles,
    };

    setUser(nextUser);
    localStorage.setItem("auth_user", JSON.stringify(nextUser));
    document.cookie = `auth_user=${nextUser.username}; path=/`;
  };

  // Keep role assignments synced so admin role updates reflect without page refresh.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const currentUser = userRef.current;
    if (!currentUser?.id) {
      return;
    }

    // "public-user" is a synthetic read-only login and does not have a persisted user record.
    if (currentUser.id === "public-user") {
      return;
    }

    let isDisposed = false;
    const hasAdminRole = assignedRolesRef.current.includes("admin");

    const syncCurrentUser = async () => {
      try {
        const activeUser = userRef.current;
        if (!activeUser?.id) {
          return;
        }

        const response = await fetch(
          `/api/users/${encodeURIComponent(activeUser.id)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          user?: Partial<AuthUser> & {
            role?: string;
            roles?: string[];
            profileImageUrl?: string;
          };
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
          : normalizedRoles.includes(userRoleRef.current)
            ? userRoleRef.current
            : normalizedRoles[0];

        const nextUser: AuthUser = {
          id: data.user.id || activeUser.id,
          username: data.user.username || activeUser.username,
          name: data.user.name || activeUser.name,
          role: activeRole,
          roles: normalizedRoles,
          department:
            data.user.department !== undefined
              ? data.user.department
              : activeUser.department,
          profileImageUrl:
            data.user.profileImageUrl !== undefined
              ? data.user.profileImageUrl
              : activeUser.profileImageUrl,
        };

        const rolesChanged =
          normalizedRoles.join("|") !== assignedRolesRef.current.join("|");
        const roleChanged = activeRole !== userRoleRef.current;
        const profileChanged =
          nextUser.username !== activeUser.username ||
          nextUser.name !== activeUser.name ||
          nextUser.department !== activeUser.department ||
          nextUser.profileImageUrl !== activeUser.profileImageUrl;

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
  }, [isAuthenticated, user?.id]);

  const value = {
    isAuthenticated,
    userRole,
    assignedRoles,
    user,
    login,
    register,
    logout,
    switchRole,
    updateUserProfile,
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

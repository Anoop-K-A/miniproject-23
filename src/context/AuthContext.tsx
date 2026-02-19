"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { UserRole } from "@/lib/roles";

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

  // Load from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("auth_authenticated");
    const savedRole = localStorage.getItem("auth_role") as UserRole;
    const savedRoles = localStorage.getItem("auth_roles");
    const savedUser = localStorage.getItem("auth_user");

    if (savedAuth === "true" && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }

    if (savedRoles) {
      try {
        const roles = JSON.parse(savedRoles) as UserRole[];
        setAssignedRoles(roles);
      } catch {
        setAssignedRoles(["faculty"]);
      }
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as AuthUser);
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (authUser: AuthUser) => {
    setIsAuthenticated(true);
    setUserRole(authUser.role);
    setUser(authUser);
    // Use roles array if available, otherwise default to single role in array
    const roles = authUser.roles || [authUser.role];
    setAssignedRoles(roles);
    localStorage.setItem("auth_authenticated", "true");
    localStorage.setItem("auth_role", authUser.role);
    localStorage.setItem("auth_roles", JSON.stringify(roles));
    localStorage.setItem("auth_user", JSON.stringify(authUser));
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
  };

  const switchRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem("auth_role", role);
    if (user) {
      const nextUser = { ...user, role };
      setUser(nextUser);
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
    }
  };

  const register = (role: UserRole) => {
    setUserRole(role);
    setAssignedRoles([role]);
    setIsAuthenticated(true);
    localStorage.setItem("auth_authenticated", "true");
    localStorage.setItem("auth_role", role);
    localStorage.setItem("auth_roles", JSON.stringify([role]));
  };

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

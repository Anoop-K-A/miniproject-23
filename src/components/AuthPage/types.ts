import type { UserRole } from "@/lib/roles";

export interface SignInFormData {
  username: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  department: string;
}

export interface SignUpResult {
  message?: string;
  warning?: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  department?: string;
  profileImageUrl?: string;
  emailVerified?: boolean;
}

export interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
  register: (role: UserRole) => void;
}

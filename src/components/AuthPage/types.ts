import type { UserRole } from "@/lib/roles";

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  department: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  department?: string;
}

export interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
  register: (role: UserRole) => void;
}

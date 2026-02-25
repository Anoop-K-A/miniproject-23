export type UserRole = "faculty" | "auditor" | "staff-advisor" | "admin";

export type UserStatus =
  | "pending"
  | "active"
  | "inactive"
  | "suspended"
  | "rejected";

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseRecord {
  id: string;
  code: string;
  name: string;
  department?: string;
  semester?: string;
  credits?: number;
  assignedFacultyIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type AssignmentStatus = "active" | "frozen" | "completed" | "removed";

export interface AssignmentRecord {
  id: string;
  courseId: string;
  facultyId: string;
  status: AssignmentStatus;
  assignedAt?: string;
  updatedAt?: string;
}

export type ResponsibilityStatus = "assigned" | "completed" | "removed";

export interface ResponsibilityRecord {
  id: string;
  facultyId: string;
  title: string;
  category?: string;
  points?: number;
  status: ResponsibilityStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface EngagementRecord {
  id: string;
  facultyId: string;
  uploadsCount: number;
  activityParticipationCount: number;
  responsibilitiesCount: number;
  courseCompletionCount: number;
  score: number;
  updatedAt?: string;
}

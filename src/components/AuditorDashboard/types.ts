export interface FacultyMember {
  id: string;
  name: string;
  department: string;
  totalFiles: number;
  totalReports: number;
  approvedFiles: number;
  approvedReports: number;
  pendingFiles: number;
  pendingReports: number;
  rejectedFiles: number;
  rejectedReports: number;
  email?: string;
  phone?: string;
  experience?: string;
  profileImageUrl?: string;
  resumeUrl?: string;
  resumeFileName?: string;
}

export interface DashboardStats {
  totalFaculty: number;
  totalFiles: number;
  totalReports: number;
  approvedFiles: number;
  approvedReports: number;
  pendingFiles: number;
  pendingReports: number;
  rejectedFiles: number;
  rejectedReports: number;
  completionRate: number;
}

export interface RecentReview {
  faculty: string;
  item: string;
  action: string;
  time: string;
}

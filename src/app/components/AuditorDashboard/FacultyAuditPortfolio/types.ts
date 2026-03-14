export interface FacultyMember {
  id: string;
  name: string;
  department: string;
  totalFiles: number;
  totalReports: number;
}

export type AuditChecklistStatus = "yes" | "no" | "pending";

export interface CourseAuditChecklistReportItem {
  id: string;
  label: string;
  status: AuditChecklistStatus;
}

export interface CourseAuditChecklistReport {
  courseCode: string;
  courseName?: string;
  academicYear?: string;
  checklist: CourseAuditChecklistReportItem[];
  remarks?: string;
  decision?: "approve" | "reject";
  updatedBy?: string;
  updatedAt?: string;
  isFinalized?: boolean;
}

export interface CourseFile {
  id: string;
  facultyId?: string;
  fileName: string;
  documentUrl?: string;
  courseCode: string;
  courseName: string;
  fileType: string;
  uploadDate: string;
  semester: string;
  academicYear?: string;
  size?: string;
  status: "Draft" | "Submitted" | "Pending" | "Approved" | "Rejected";
  auditorRemarks?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  facultyResponse?: string;
  responseDate?: string;
  auditChecklistStatus?: AuditChecklistStatus;
  auditChecklistUpdatedAt?: string;
  auditChecklistFinalized?: boolean;
  auditChecklistReport?: CourseAuditChecklistReport;
  facultyName?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventReport {
  id: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  location: string;
  participants: number;
  duration: string;
  description: string;
  objectives: string;
  outcomes: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  auditorRemarks?: string;
}

export interface FacultyAuditPortfolioProps {
  faculty: FacultyMember;
  onBack: () => void;
}

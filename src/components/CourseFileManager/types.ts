export interface PeerReview {
  id: string;
  reviewerName: string;
  reviewDate: string;
  comment: string;
  facultyResponse?: string;
  responseDate?: string;
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
  academicYear: string;
  size: string;
  status?: "Pending" | "Approved" | "Rejected";
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  facultyResponse?: string;
  responseDate?: string;
  auditChecklistStatus?: AuditChecklistStatus;
  auditChecklistUpdatedAt?: string;
  auditChecklistFinalized?: boolean;
  auditChecklistReport?: CourseAuditChecklistReport;
  facultyName: string;
  department: string;
  peerReviews?: PeerReview[];
  createdAt?: string;
  updatedAt?: string;
}

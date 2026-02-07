export interface FacultyMember {
  id: string;
  name: string;
  department: string;
  totalFiles: number;
  totalReports: number;
}

export interface CourseFile {
  id: string;
  facultyId?: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  courseName: string;
  semester: string;
  status: "Draft" | "Submitted" | "Pending" | "Approved" | "Rejected";
  auditorRemarks?: string;
}

export interface EventReport {
  id: string;
  facultyId?: string;
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

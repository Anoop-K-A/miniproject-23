export interface FacultyMember {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  courses: string[];
  specialization: string;
  experience: string;
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
  status?: "Pending" | "Approved" | "Rejected" | "Draft" | "Submitted";
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  facultyResponse?: string;
  responseDate?: string;
  facultyName: string;
  department: string;
  createdAt?: string;
  updatedAt?: string;
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
}

export interface FacultyPortfolioProps {
  faculty: FacultyMember;
  onBack: () => void;
}

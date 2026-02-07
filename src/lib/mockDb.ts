import fs from "fs";
import path from "path";

export type MockDbRole = "faculty" | "auditor" | "staff-advisor";

export interface MockDbFacultyMember {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "faculty";
  department: string;
  dashboard: {
    stats: {
      totalFiles: number;
      totalReports: number;
      pendingReports: number;
      totalParticipants: number;
      recentActivity: Array<{
        action: string;
        item: string;
        time: string;
      }>;
    };
    facultyMembers: Array<{
      id: string;
      name: string;
      department: string;
      role: string;
      email: string;
      phone: string;
      courses: string[];
      specialization: string;
      experience: string;
    }>;
    files: Array<{
      id: string;
      title: string;
      status: string;
    }>;
  };
}

export interface MockDbAuditor {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "auditor";
  department: string;
  assignedDepartments: string[];
  reviewQueue: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export interface MockDbStaffAdvisor {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "staff-advisor";
  department: string;
  assignedFaculty: string[];
  openTasks: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export interface MockDb {
  faculty: MockDbFacultyMember[];
  auditors: MockDbAuditor[];
  staffAdvisors: MockDbStaffAdvisor[];
}

const mockDbPath = path.join(process.cwd(), "src", "data", "mock-db.json");

export function getMockDb(): MockDb {
  const fileContents = fs.readFileSync(mockDbPath, "utf-8");
  return JSON.parse(fileContents) as MockDb;
}

export function findUserByUsername(db: MockDb, username: string) {
  const facultyUser = db.faculty.find((user) => user.username === username);
  if (facultyUser) {
    return facultyUser;
  }

  const auditorUser = db.auditors.find((user) => user.username === username);
  if (auditorUser) {
    return auditorUser;
  }

  return db.staffAdvisors.find((user) => user.username === username);
}

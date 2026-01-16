import type { Id } from "./base";

export interface ClassItem {
  classId: Id;
  className: string;
  description: string | null;
  instructorId: Id | null;
  instructorName: string | null;
  semesterId: Id;
  semesterName: string | null;
  semesterCode: string | null;
  createdAt: string; 
  status: "Not Started" | "In Progress" | "Completed";
  startTime: string | null;
  totalStudents: number;
  totalGroups: number;
  totalProjects: number;
}

export interface ClassGroup {
  groupId: Id;
  groupName: string;
  leaderName: string | null;
  memberCount: number;
  projectCount: number;
}

export interface ClassStudent {
  userId: Id;
  fullName: string;
  email: string;
  enrolledAt: string; 
}

export interface ClassDetail {
  classId: Id;
  className: string;
  instructorId: Id | null;
  instructorName: string | null;
  semesterId: Id;
  semesterName: string | null;
  semesterCode: string | null;
  description: string | null;
  createdAt: string; 
  status: "Not Started" | "In Progress" | "Completed";
  startTime: string | null;
  totalStudents: number;
  totalGroups: number;
  totalProjects: number;
  groups: ClassGroup[];
  students: ClassStudent[];
}

export interface CreateClassRequest {
  className: string;
  semesterId: Id;
  description?: string | null;
  instructorId?: Id | null;
}

export interface UpdateClassRequest {
  className: string;
  description?: string | null;
  instructorId?: Id | null;
  startTime?: string | null;
}

export interface ChangeClassStatusRequest {
  status: "Not Started" | "In Progress" | "Completed";
}

export interface ChangeClassStatusResponse {
  classId: Id;
  className: string;
  oldStatus: string;
  newStatus: string;
  changedAt: string;
  totalStudents: number;
  studentsWithGroup: number;
  studentsWithoutGroup: number;
  warnings: string[];
}

export interface AssignInstructorRequest {
  instructorId: Id;
}

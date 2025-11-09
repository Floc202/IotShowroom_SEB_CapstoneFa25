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
}

export interface AssignInstructorRequest {
  instructorId: Id;
}

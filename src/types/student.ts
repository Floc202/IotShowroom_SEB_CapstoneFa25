import type { Id } from "./base";

export interface StudentDashboard {
  studentId: Id;
  studentName: string;
  statistics: {
    totalClasses: number;
    totalGroups: number;
    totalProjects: number;
    averageGrade: number | null;
    totalSubmissions: number;
    pendingSubmissions: number;
  };
  upcomingDeadlines: DashboardDeadlineItem[];
  recentGrades: DashboardGradeItem[];
  recentNotifications: DashboardNotificationItem[];
}

export interface DashboardDeadlineItem {
  id: Id;
  classId: Id;
  className: string;
  title: string;
  dueDate: string; 
  status: "upcoming" | "overdue" | "completed";
}

export interface DashboardGradeItem {
  id: Id;
  classId: Id;
  className: string;
  itemName: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null; 
  gradedAt?: string | null; 
}

export interface DashboardNotificationItem {
  id: Id;
  type: "general" | "deadline" | "grade" | "group" | "system";
  message: string;
  createdAt: string; 
  read: boolean;
}

export interface StudentClassItem {
  classId: Id;
  className: string;
  semesterName: string;
  instructorName: string | null;
  enrolledAt: string; 
  myGroup: null | {
    groupId: Id;
    groupName: string;
  };
}

export interface StudentGroupDetail {
  groupId: Id;
  groupName: string;
  classId: Id;
  className: string;
  role: string; 
  members: {
    userId: Id;
    fullName: string;
    email: string;
    role: string; 
    joinedAt: string; 
  }[];
  project: null | {
    projectId: Id;
    title: string;
    description: string;
    status: string;
    createdAt: string; 
  };
}

export interface GroupInvitation {
  invitationId: Id;
  classId: Id;
  className: string;
  groupId: Id;
  groupName: string;
  inviterId: Id;
  inviterName: string;
  message?: string | null;
  createdAt: string;
  expiresAt?: string | null;
}

export interface GroupInvitationList {
  pendingInvitations: GroupInvitation[];
  totalCount: number;
}

export interface RejectGroupInvitationRequest {
  groupId: Id;
  reason?: string;
}

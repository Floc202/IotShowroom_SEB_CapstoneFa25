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
  projectId: Id;
  projectTitle: string;
  milestoneId: Id;
  milestoneTitle: string;
  deadline: string;
  daysRemaining: number;
  status: string;
  weight: number;
}

export interface DashboardGradeItem {
  projectId: Id;
  projectTitle: string;
  milestoneId: Id;
  milestoneTitle: string;
  grade: number;
  gradedAt: string;
  feedback: string;
}

export interface DashboardNotificationItem {
  notificationId: Id;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
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
  invitationId?: Id;
  classId: Id;
  className: string;
  groupId: Id;
  groupName: string;
  inviterId?: Id;
  inviterName?: string;
  invitedBy?: string;
  invitedAt?: string;
  message?: string | null;
  createdAt?: string;
  expiresAt?: string | null;
  notificationId?: Id;
}

export interface GroupInvitationList {
  pendingInvitations: GroupInvitation[];
  totalCount: number;
}

export interface RejectGroupInvitationRequest {
  groupId: Id;
  reason?: string;
}

export interface StudentMilestoneGrade {
  milestoneId: Id;
  milestoneTitle: string;
  weight: number;
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
  gradedBy: string | null;
  status: string;
}

export interface StudentProjectGrades {
  projectId: Id;
  projectTitle: string;
  classId: Id;
  className: string;
  semesterName: string;
  groupId: Id;
  groupName: string;
  projectStatus: string;
  overallGrade: number | null;
  milestones: StudentMilestoneGrade[];
  gradeBreakdown: {
    milestoneScores: Record<string, number>;
    totalWeightedScore: number;
    totalWeight: number;
    projectedFinalGrade: number;
  };
}

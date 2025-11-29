import type { Id } from "./base";

export interface InstructorDashboard {
  totalClasses: number;
  totalGroups: number;
  totalProjects: number;
  totalStudents: number;
  pendingProposals: number;
  submissionsToGrade: number;
  recentAnnouncements: number;
  recentClasses: InstructorClassItem[];
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  activityType: string;
  description: string;
  relatedClass: string | null;
  relatedGroup: string | null;
  activityDate: string;
}

export interface Announcement {
  announcementId: Id;
  adminId: Id;
  adminName: string;
  title: string;
  content: string;
  targetAudience: string;
  createdAt: string;
}

export interface InstructorClassItem {
  classId: Id;
  className: string;
  description: string | null;
  instructorId: Id;
  instructorName: string;
  semesterId: Id;
  semesterName: string;
  semesterCode: string;
  createdAt: string;
  totalStudents: number;
  totalGroups: number;
  totalProjects: number;
}

export interface GradeMilestoneRequest {
  projectId: Id;
  milestoneDefId: Id;
  instructorId: Id;
  score: number;
  feedback: string;
  weightRatioSnapshot: number;
}

export interface ProjectGrade {
  meId: Id;
  projectId: Id;
  projectTitle: string | null;
  milestoneDefId: Id;
  milestoneTitle: string;
  instructorId: Id;
  instructorName: string;
  weightRatioSnapshot: number;
  score: number;
  feedback: string;
  evaluatedAt: string;
}

export interface InstructorGroupMember {
  userId: Id;
  fullName: string;
  email: string;
  roleInGroup: string;
  avatarUrl?: string | null;
}

export interface InstructorGroupDetail {
  groupId: Id;
  groupName: string;
  description: string | null;
  leaderId: Id;
  leaderName: string;
  classId: Id;
  className: string;
  createdAt: string;
  updatedAt: string | null;
  memberCount: number;
  members: InstructorGroupMember[];
  projectCount: number;
}

export interface UpdateGroupRequest {
  groupName: string;
  description: string;
}

export interface AddMemberRequest {
  userId: Id;
  roleInGroup: string;
}

export interface UpdateMemberRoleRequest {
  roleInGroup: string;
}

export interface ClassConfig {
  configId: Id;
  classId: Id;
  className: string;
  maxGroupsAllowed: number;
  minMembersPerGroup: number;
  maxMembersPerGroup: number;
  groupFormationDeadline: string | null;
  allowStudentCreateGroup: boolean;
  createdAt: string;
  updatedAt: string | null;
  currentGroupCount: number;
  isGroupFormationOpen: boolean;
  deadlineStatus: string;
}

export interface UpdateClassConfigRequest {
  maxGroupsAllowed: number;
  minMembersPerGroup: number;
  maxMembersPerGroup: number;
  groupFormationDeadline: string | null;
  allowStudentCreateGroup: boolean;
}

export interface FinalGradeRequest {
  grade: number;
  feedback: string;
}

export interface UnassignedStudent {
  userId: Id;
  fullName: string;
  email: string;
  enrolledAt: string;
  avatarUrl: string | null;
}

export interface UnassignedStudentsResponse {
  classId: Id;
  className: string;
  totalUnassignedStudents: number;
  students: UnassignedStudent[];
}

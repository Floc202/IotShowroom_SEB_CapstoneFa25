import type { Id } from "./base";

export interface ProjectDetail {
  projectId: Id;
  title: string;
  description: string | null;
  component?: string | null;
  status: string;
  leaderId: Id;
  leaderName: string;
  groupId: Id;
  groupName: string;
  createdAt: string;
  updatedAt: string | null;
  memberCount: number;
  members: string[];
}

export interface MemberInfo {
  userId: Id;
  fullName: string;
  email: string;
  roleInProject: string;
  avatarUrl: string | null;
}

export interface CreateProjectRequest {
  groupId: Id;
  title: string;
  description: string;
  component: string;
}

export interface UpdateProjectRequest {
  projectId: Id;
  requesterUserId: Id;
  title: string;
  description: string;
  component: string;
}

export interface UpdateProjectStatusRequest {
  projectId: Id;
  instructorId: Id;
  status: string;
  comment: string;
}

export interface ProjectStatusHistory {
  historyId: Id;
  status: string;
  comment: string;
  reviewerId: Id;
  reviewerName: string;
  reviewedAt: string;
}

import type { Id } from "./base";

export interface CreateGroupRequest {
  classId: Id;
  groupName: string;
  description?: string | null;
}

export interface InviteToGroupRequest {
  groupId: Id;
  invitedUserId: Id;
  inviterUserId: Id;
}

export interface AcceptInviteRequest {
  groupId: Id;
  userId: Id;
}

export interface LeaveGroupRequest {
  groupId: Id;
  userId: Id;
}

export interface KickMemberRequest {
  groupId: Id;
  targetUserId: Id;
  requesterUserId: Id;
}

export interface UpdateGroupRequest {
  groupId: Id;
  requesterUserId: Id;
  groupName: string;
  description?: string | null;
}

export interface GroupMember {
  gmId: Id;
  userId: Id;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  roleInGroup: string;
  joinedAt: string; 
}

export interface GroupDetail {
  groupId: Id;
  classId: Id;
  groupName: string;
  description: string | null;
  leaderId: Id;
  createdAt: string; 
  updatedAt: string | null; 
  members: GroupMember[];
  projectIds: Id[];
}

export interface GroupBasic {
  groupId: Id;
  classId: Id;
  className?: string | null;
  groupName: string;
  description?: string | null;
  leaderId?: Id | null;
  leaderName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  memberCount?: number;
  members?: GroupMember[];
  projectCount?: number;
}

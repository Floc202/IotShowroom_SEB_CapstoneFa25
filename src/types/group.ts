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
  groupName: string;
  description?: string | null;
  leaderId?: Id | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  memberCount?: number;
  projectCount?: number;
}

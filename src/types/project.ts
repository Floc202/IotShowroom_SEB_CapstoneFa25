import type { Id } from "./base";

export interface ProjectDetail {
  projectId: Id;
  title: string;
  description: string | null;
  status: string; 
  groupId: Id;
  groupName: string;
  createdAt: string; 
  updatedAt: string | null; 
  memberNames: string[];
}

export interface CreateProjectRequest {
  groupId: Id;
  title: string;
  description: string;
}

export interface UpdateProjectRequest {
  projectId: Id;
  requesterUserId: Id; 
  title: string;
  description: string;
}

export interface UpdateProjectStatusRequest {
  projectId: Id;
  instructorId: Id;
  status: string; 
  comment: string;
}

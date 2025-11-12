import type { Id } from "./base";

export interface Milestone {
  milestoneId: Id;
  projectId: Id;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  weight: number | null;
}

export interface CreateMilestoneRequest {
  projectId: Id;
  title: string;
  description: string;
  dueDate: string;
  weight: number;
}

export interface UpdateMilestoneRequest {
  milestoneId: Id;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  weight: number;
}

import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type { Milestone } from "../types/milestone";

export const getMilestones = (projectId: Id) =>
  api
    .get<ApiEnvelope<Milestone[]>>(`/projects/${projectId}/milestones`)
    .then((r) => r.data);

export interface BulkCreateMilestoneRequest {
  classId: Id;
  title: string;
  description: string;
  dueDate: string;
  weight: number;
}

export const bulkCreateMilestones = (classId: Id, data: BulkCreateMilestoneRequest) =>
  api
    .post<ApiEnvelope<any>>(`/classes/${classId}/milestones/bulk-create`, data)
    .then((r) => r.data);

import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  Milestone,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
} from "../types/milestone";

export const getProjectMilestones = (projectId: Id) =>
  api
    .get<ApiEnvelope<Milestone[]>>(`/projects/${projectId}/milestones`)
    .then((r) => r.data);

export const createMilestone = (projectId: Id, payload: Omit<CreateMilestoneRequest, "projectId">) =>
  api
    .post<ApiEnvelope<Milestone>>(`/projects/${projectId}/milestones`, payload)
    .then((r) => r.data);

export const updateMilestone = (
  projectId: Id,
  milestoneId: Id,
  payload: Omit<UpdateMilestoneRequest, "milestoneId">
) =>
  api
    .put<ApiEnvelope<Milestone>>(`/projects/${projectId}/milestones/${milestoneId}`, payload)
    .then((r) => r.data);

export const deleteMilestone = (projectId: Id, milestoneId: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`/projects/${projectId}/milestones/${milestoneId}`)
    .then((r) => r.data);

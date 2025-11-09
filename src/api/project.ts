import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
} from "../types/project";

const BASE = "/Project";

type OuterStatusWrapper<T> = { status: string; data: T };

export const getProjectByGroup = async (groupId: Id) => {
  const res = await api.get<OuterStatusWrapper<ProjectDetail>>(
    `${BASE}/group/${groupId}`
  );
  return res.data.data; 
};

export const createProject = (payload: CreateProjectRequest) =>
  api.post<ApiEnvelope<ProjectDetail>>(`${BASE}`, payload).then((r) => r.data);

export const updateProject = (payload: UpdateProjectRequest) =>
  api
    .put<ApiEnvelope<ProjectDetail>>(`${BASE}/${payload.projectId}`, payload)
    .then((r) => r.data);

export const deleteProject = (projectId: Id) =>
  api.delete<ApiEnvelope<boolean>>(`${BASE}/${projectId}`).then((r) => r.data);

export const updateProjectStatus = (payload: UpdateProjectStatusRequest) =>
  api
    .put<ApiEnvelope<ProjectDetail>>(
      `${BASE}/${payload.projectId}/status`,
      payload
    )
    .then((r) => r.data);

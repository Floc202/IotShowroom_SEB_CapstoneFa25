import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
} from "../types/project";

const BASE = "/Project";

type OuterStatusWrapper<T> = { statusCode: string; data: T };

export const getProjectByGroup = async (groupId: Id) => {
  const res = await api.get<OuterStatusWrapper<ProjectDetail[]>>(
    `${BASE}/group/${groupId}`
  );
  return res.data.data; 
};

export const getProjectByClass = async (classId: Id) => {
  const res = await api.get<OuterStatusWrapper<ProjectDetail>>(
    `${BASE}/class/${classId}`
  );
  return res.data.data; 
};

export const createProject = (payload: CreateProjectRequest) =>
  api.post<ApiEnvelope<ProjectDetail>>(`${BASE}`, payload).then((r) => r.data);

export const updateProject = (payload: UpdateProjectRequest) =>
  api
    .put(`${BASE}/${payload.projectId}`, payload)
    .then((r) => r.data);

export const deleteProject = (projectId: Id) =>
  api.delete(`${BASE}/${projectId}`).then((r) => r.data);

export const updateProjectStatus = (payload: UpdateProjectStatusRequest) =>
  api
    .put(
      `${BASE}/${payload.projectId}/status`,
      payload
    )
    .then((r) => r.data);

export const getProjectStatusHistory = async (projectId: Id) =>
  api
    .get<ApiEnvelope<import("../types/project").ProjectStatusHistory[]>>(
      `${BASE}/${projectId}/status-history`
    )
    .then((r) => r.data);

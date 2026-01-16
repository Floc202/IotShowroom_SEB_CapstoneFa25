import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  ClassItem,
  ClassDetail,
  CreateClassRequest,
  UpdateClassRequest,
  AssignInstructorRequest,
  ChangeClassStatusRequest,
  ChangeClassStatusResponse,
} from "../types/classes";

const BASE = "/Classes";

export const listClasses = () =>
  api.get<ApiEnvelope<ClassItem[]>>(BASE).then((r) => r.data);

export const createClass = (payload: CreateClassRequest) =>
  api.post<ApiEnvelope<ClassItem>>(BASE, payload).then((r) => r.data);

export const getClassById = (id: Id) =>
  api.get<ApiEnvelope<ClassItem>>(`${BASE}/${id}`).then((r) => r.data);

export const updateClass = (id: Id, payload: UpdateClassRequest) =>
  api.put<ApiEnvelope<ClassItem>>(`${BASE}/${id}`, payload).then((r) => r.data);

export const deleteClass = (id: Id) =>
  api.delete<ApiEnvelope<boolean>>(`${BASE}/${id}`).then((r) => r.data);

export const getClassDetail = (id: Id) =>
  api
    .get<ApiEnvelope<ClassDetail>>(`${BASE}/${id}/details`)
    .then((r) => r.data);

export const getClassesBySemester = (semesterId: Id) =>
  api
    .get<ApiEnvelope<ClassItem[]>>(`${BASE}/semester/${semesterId}`)
    .then((r) => r.data);

export const searchClasses = (params?: { semesterId?: number; q?: string }) =>
  api
    .get<ApiEnvelope<ClassItem[]>>("/Classes/search", { params })
    .then((r) => r.data);

export const assignInstructor = (
  classId: Id,
  payload: AssignInstructorRequest
) =>
  api
    .put<ApiEnvelope<ClassItem>>(`${BASE}/${classId}/instructor`, payload)
    .then((r) => r.data);

export const changeClassStatus = (
  classId: Id,
  payload: ChangeClassStatusRequest
) =>
  api
    .put<ApiEnvelope<ChangeClassStatusResponse>>(`${BASE}/${classId}/change-status`, payload)
    .then((r) => r.data);

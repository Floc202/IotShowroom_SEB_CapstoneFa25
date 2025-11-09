import api from "./axios";
import type { ApiEnvelope } from "../types/base";
import type { Id } from "../types/base"; 
import type {
  UserItem,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/users";

const BASE = "/User";

export const listUsers = () =>
  api.get<ApiEnvelope<UserItem[]>>(BASE).then((r) => r.data);

export const getMe = () =>
  api.get<ApiEnvelope<UserItem>>(`${BASE}/me`).then((r) => r.data);

export const getUserById = (id: Id) =>
  api.get<ApiEnvelope<UserItem>>(`${BASE}/${id}`).then((r) => r.data);

export const deleteUser = (id: Id) =>
  api.delete<ApiEnvelope<boolean>>(`${BASE}/${id}`).then((r) => r.data);

export const getUsersByRole = (roleId?: Id) =>
  api
    .get<ApiEnvelope<UserItem[]>>(`${BASE}/by-role`, {
      params: roleId ? { roleId } : {},
    })
    .then((r) => r.data);

export const createUser = (payload: CreateUserRequest) =>
  api
    .post<ApiEnvelope<UserItem>>(`${BASE}/create`, payload)
    .then((r) => r.data);

export const updateUser = (id: Id, payload: UpdateUserRequest) =>
  api
    .put<ApiEnvelope<UserItem>>(`${BASE}/update/${id}`, payload)
    .then((r) => r.data);

export const importUsersFromExcel = (excelFile: File) => {
  const formData = new FormData();
  formData.append('ExcelFile', excelFile);
  
  return api
    .post<ApiEnvelope<any>>(`${BASE}/import-from-excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((r) => r.data);
};

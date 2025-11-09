import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  CreateGroupRequest,
  InviteToGroupRequest,
  AcceptInviteRequest,
  LeaveGroupRequest,
  KickMemberRequest,
  UpdateGroupRequest,
  GroupDetail,
  GroupBasic,
} from "../types/group";

const BASE = "/Group";

type OuterStatusWrapper<T> = { status: string; data: T };

export const createGroup = (payload: CreateGroupRequest) =>
  api
    .post<ApiEnvelope<GroupDetail>>(`${BASE}/create`, payload)
    .then((r) => r.data);

export const inviteToGroup = (payload: InviteToGroupRequest) =>
  api.post<ApiEnvelope<boolean>>(`${BASE}/invite`, payload).then((r) => r.data);

export const acceptInvite = (payload: AcceptInviteRequest) =>
  api
    .post<ApiEnvelope<boolean>>(`${BASE}/accept-invite`, payload)
    .then((r) => r.data);

export const getGroupsByClass = async (classId: Id) => {
  const res = await api.get<OuterStatusWrapper<ApiEnvelope<GroupBasic[]>>>(
    `${BASE}/by-class/${classId}`
  );
  return res.data.data; 
};

export const getGroupById = async (groupId: Id) => {
  const res = await api.get<OuterStatusWrapper<GroupDetail>>(
    `${BASE}/${groupId}`
  );
  return res.data.data; 
};

export const leaveGroup = (payload: LeaveGroupRequest) =>
  api.post<ApiEnvelope<boolean>>(`${BASE}/leave`, payload).then((r) => r.data);

export const kickMember = (payload: KickMemberRequest) =>
  api.post<ApiEnvelope<boolean>>(`${BASE}/kick`, payload).then((r) => r.data);

export const updateGroup = (payload: UpdateGroupRequest) =>
  api
    .put<ApiEnvelope<GroupDetail>>(`${BASE}/update`, payload)
    .then((r) => r.data);

export const deleteGroup = (groupId: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`${BASE}/delete/${groupId}`)
    .then((r) => r.data);

import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  InstructorDashboard,
  Announcement,
  InstructorClassItem,
  GradeMilestoneRequest,
  ProjectGrade,
  InstructorGroupDetail,
  UpdateGroupRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  ClassConfig,
  UpdateClassConfigRequest,
  FinalGradeRequest,
} from "../types/instructor";

const BASE = "/Instructor";

export const getInstructorDashboard = () =>
  api
    .get<ApiEnvelope<InstructorDashboard>>(`${BASE}/dashboard`)
    .then((r) => r.data);

export const getAnnouncements = () =>
  api
    .get<ApiEnvelope<Announcement[]>>(`/announcements`)
    .then((r) => r.data);

export const getInstructorClasses = () =>
  api
    .get<ApiEnvelope<InstructorClassItem[]>>(`${BASE}/classes`)
    .then((r) => r.data);

export const gradeMilestone = (payload: GradeMilestoneRequest) =>
  api
    .post<ApiEnvelope<boolean>>(`${BASE}/milestones/grade`, payload)
    .then((r) => r.data);

export const getProjectGrades = (projectId: Id) =>
  api
    .get<ApiEnvelope<ProjectGrade[]>>(`${BASE}/projects/${projectId}/grades`)
    .then((r) => r.data);

export const getClassGroups = (classId: Id) =>
  api
    .get<ApiEnvelope<InstructorGroupDetail[]>>(`${BASE}/classes/${classId}/groups`)
    .then((r) => r.data);

export const updateGroupAsInstructor = (groupId: Id, payload: UpdateGroupRequest) =>
  api
    .put<ApiEnvelope<boolean>>(`${BASE}/groups/${groupId}`, payload)
    .then((r) => r.data);

export const addMemberToGroup = (groupId: Id, payload: AddMemberRequest) =>
  api
    .post<ApiEnvelope<boolean>>(`${BASE}/groups/${groupId}/members`, payload)
    .then((r) => r.data);

export const removeMemberFromGroup = (groupId: Id, userId: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`${BASE}/groups/${groupId}/members/${userId}`)
    .then((r) => r.data);

export const updateMemberRole = (groupId: Id, userId: Id, payload: UpdateMemberRoleRequest) =>
  api
    .put<ApiEnvelope<boolean>>(`${BASE}/groups/${groupId}/members/${userId}/role`, payload)
    .then((r) => r.data);

export const getClassConfig = (classId: Id) =>
  api
    .get<ApiEnvelope<ClassConfig>>(`${BASE}/classes/${classId}/config`)
    .then((r) => r.data);

export const updateClassConfig = (classId: Id, payload: UpdateClassConfigRequest) =>
  api
    .put<ApiEnvelope<boolean>>(`${BASE}/classes/${classId}/config`, payload)
    .then((r) => r.data);

export const submitFinalGrade = (projectId: Id, payload: FinalGradeRequest) =>
  api
    .post<ApiEnvelope<boolean>>(`${BASE}/projects/${projectId}/final-grade`, payload)
    .then((r) => r.data);

export const getUnassignedStudents = (classId: Id, query?: string) =>
  api
    .get<ApiEnvelope<import("../types/instructor").UnassignedStudentsResponse>>(
      `${BASE}/classes/${classId}/unassigned-students`,
      { params: query ? { q: query } : undefined }
    )
    .then((r) => r.data);
import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  StudentDashboard,
  StudentClassItem,
  StudentGroupDetail,
  GroupInvitationList,
  RejectGroupInvitationRequest,
  StudentProjectGrades,
  SubmissionValidation,
  EditPeriodValidation,
  StudentCourseHistory,
  ProjectGradersInfo,
} from "../types/student";

const BASE = "/student";

export const getStudentDashboard = () =>
  api
    .get<ApiEnvelope<StudentDashboard>>(`${BASE}/dashboard`)
    .then((r) => r.data);

export const getStudentClasses = () =>
  api
    .get<ApiEnvelope<StudentClassItem[]>>(`${BASE}/my-classes`)
    .then((r) => r.data);

export const getMyGroup = (classId: Id) =>
  api
    .get<ApiEnvelope<StudentGroupDetail>>(`${BASE}/my-group`, {
      params: { classId },
    })
    .then((r) => r.data);

export const getGroupInvitations = () =>
  api
    .get<ApiEnvelope<GroupInvitationList>>(`${BASE}/group-invitations`)
    .then((r) => r.data);

export const rejectGroupInvitation = (payload: RejectGroupInvitationRequest) =>
  api
    .post<ApiEnvelope<boolean>>(`${BASE}/group-invitations/reject`, payload)
    .then((r) => r.data);

export const getStudentProjectGrades = (projectId: Id) =>
  api
    .get<ApiEnvelope<StudentProjectGrades>>(`${BASE}/projects/${projectId}/grades`)
    .then((r) => r.data);

export const validateSubmission = (classId: Id) =>
  api
    .get<ApiEnvelope<SubmissionValidation>>(`${BASE}/classes/${classId}/validate-submission`)
    .then((r) => r.data);

export const validateEditPeriod = (classId: Id) =>
  api
    .get<ApiEnvelope<EditPeriodValidation>>(`${BASE}/classes/${classId}/validate-edit-window`)
    .then((r) => r.data);

export const getStudentCourseHistoryAll = (studentId: Id) =>
  api
    .get<ApiEnvelope<StudentCourseHistory[]>>(`/StudentCourseHistory/student/${studentId}/all`)
    .then((r) => r.data);

export const getProjectGraders = (projectId: Id) =>
  api
    .get<ApiEnvelope<ProjectGradersInfo>>(`${BASE}/projects/${projectId}/graders`)
    .then((r) => r.data);

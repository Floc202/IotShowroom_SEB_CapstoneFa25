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
  CreateProjectTemplateRequest,
  UpdateProjectTemplateRequest,
  ProjectTemplate,
  TemplateRegistration,
  TemplateStatistics,
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

export const getClassStudentsWithGroups = (classId: Id) =>
  api
    .get<ApiEnvelope<import("../types/instructor").StudentsWithGroupsResponse>>(
      `${BASE}/classes/${classId}/students-with-groups`
    )
    .then((r) => r.data);

export const getMilestoneWarnings = (classId: Id) =>
  api
    .get<ApiEnvelope<import("../types/instructor").ProjectMilestoneWarning[]>>(
      `${BASE}/classes/${classId}/milestone-warnings`
    )
    .then((r) => r.data);

export const getClassGrades = (classId: Id) =>
  api
    .get<ApiEnvelope<import("../types/instructor").ClassGrades>>(
      `${BASE}/classes/${classId}/grades`
    )
    .then((r) => r.data);

export const exportClassGrades = async (
  classId: Id,
  includeMilestoneDetails: boolean = true,
  includeFeedback: boolean = false
) => {
  const response = await api.get(
    `${BASE}/classes/${classId}/grades/export`,
    {
      params: {
        includeMilestoneDetails,
        includeFeedback,
      },
      responseType: "blob",
    }
  );
  return {
    blob: response.data,
    headers: response.headers,
  };
};

export const createProjectTemplate = (payload: CreateProjectTemplateRequest) =>
  api
    .post<ApiEnvelope<ProjectTemplate>>(`${BASE}/templates`, payload)
    .then((r) => r.data);

export const importTemplatesFromExcel = (classId: Id, excelFile: File) => {
  const formData = new FormData();
  formData.append('excelFile', excelFile);
  formData.append('classId', classId.toString());
  return api
    .post<ApiEnvelope<any>>(`${BASE}/templates/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((r) => r.data);
};

export const getClassTemplates = (classId: Id) =>
  api
    .get<ApiEnvelope<ProjectTemplate[]>>(`${BASE}/classes/${classId}/templates`)
    .then((r) => r.data);

export const getTemplateDetail = (templateId: Id) =>
  api
    .get<ApiEnvelope<ProjectTemplate>>(`${BASE}/templates/${templateId}`)
    .then((r) => r.data);

export const updateProjectTemplate = (templateId: Id, payload: UpdateProjectTemplateRequest) =>
  api
    .put<ApiEnvelope<boolean>>(`${BASE}/templates/${templateId}`, payload)
    .then((r) => r.data);

export const deleteProjectTemplate = (templateId: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`${BASE}/templates/${templateId}`)
    .then((r) => r.data);

export const getTemplateRegistrations = (templateId: Id) =>
  api
    .get<ApiEnvelope<TemplateRegistration[]>>(`${BASE}/templates/${templateId}/registrations`)
    .then((r) => r.data);

export const getTemplateStatistics = (templateId: Id) =>
  api
    .get<ApiEnvelope<TemplateStatistics>>(`${BASE}/templates/${templateId}/statistics`)
    .then((r) => r.data);

export const createRandomGroups = (classId: Id) =>
  api
    .post<ApiEnvelope<import("../types/instructor").RandomGroupCreationResult>>(
      `${BASE}/classes/${classId}/create-random-groups`
    )
    .then((r) => r.data);
import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";

export interface StudentTemplateMilestone {
  templateMilestoneId: Id;
  title: string;
  description: string;
  orderIndex: number;
  weight: number;
  daysDuration: number;
}

export interface StudentProjectTemplate {
  templateId: Id;
  title: string;
  description: string;
  component: string;
  maxGroups: number;
  registeredCount: number;
  availableSlots: number;
  canRegister: boolean;
  isMyGroupRegistered: boolean;
  myRegistrationId?: number;
  milestoneCount: number;
  milestones: StudentTemplateMilestone[];
}

export interface MyGroupRegistration {
  registrationId: number;
  templateId: number;
  templateTitle: string;
  templateDescription: string;
  groupId: number;
  groupName: string;
  projectId: number;
  projectTitle: string;
  status: string;
  registeredAt: string;
  canCancel: boolean;
}

export interface RegisterTemplateRequest {
  templateId: Id;
  groupId: Id;
}

export const getStudentClassTemplates = (classId: Id) =>
  api
    .get<ApiEnvelope<StudentProjectTemplate[]>>(`/Student/classes/${classId}/templates`)
    .then((r) => r.data);

export const getMyGroupRegistrations = () =>
  api
    .get<ApiEnvelope<MyGroupRegistration[]>>(`/Student/templates/registrations/my-group`)
    .then((r) => r.data);

export const registerTemplate = (req: RegisterTemplateRequest) =>
  api
    .post<ApiEnvelope<any>>(`/Student/templates/register`, req)
    .then((r) => r.data);

export const unregisterTemplate = (registrationId: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`/Student/templates/registrations/${registrationId}`)
    .then((r) => r.data);

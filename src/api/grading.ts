import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  GradingClass,
  GradingProject,
  FinalSubmissionDetail,
  SubmitGradeRequest,
} from "../types/grading";

const BASE = "/Instructor/grading";

export const getGradingClasses = () =>
  api
    .get<ApiEnvelope<GradingClass[]>>(`${BASE}/classes`)
    .then((r) => r.data);

export const getGradingClassProjects = (classId: Id) =>
  api
    .get<ApiEnvelope<GradingProject[]>>(`${BASE}/classes/${classId}/projects`)
    .then((r) => r.data);

export const getFinalSubmissionDetail = (finalSubmissionId: Id) =>
  api
    .get<ApiEnvelope<FinalSubmissionDetail>>(`${BASE}/submissions/${finalSubmissionId}`)
    .then((r) => r.data);

export const submitGrade = (finalSubmissionId: Id, req: SubmitGradeRequest) =>
  api
    .post<ApiEnvelope<any>>(`${BASE}/submissions/${finalSubmissionId}/grade`, req)
    .then((r) => r.data);

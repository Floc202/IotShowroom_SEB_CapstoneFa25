import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  Submission,
  SubmissionHistory,
  CreateSubmissionRequest,
  SubmissionFile,
} from "../types/submission";

const BASE = "/student/projects";
const MILESTONE_BASE = "/student/milestones";

export const submitMilestone = (payload: CreateSubmissionRequest) =>
  api
    .post<ApiEnvelope<Submission>>(`${MILESTONE_BASE}/submit`, payload)
    .then((r) => r.data);

export const getSubmissionHistory = (projectId: Id, milestoneId: Id) =>
  api
    .get<ApiEnvelope<SubmissionHistory>>(
      `${BASE}/${projectId}/milestones/${milestoneId}/submissions`
    )
    .then((r) => r.data);

export const getLatestSubmission = (projectId: Id, milestoneId: Id) =>
  api
    .get<ApiEnvelope<Submission>>(
      `${BASE}/${projectId}/milestones/${milestoneId}/latest`
    )
    .then((r) => r.data);

export const uploadSubmissionFile = (submissionId: Id, file: File) => {
  const formData = new FormData();
  formData.append("files", file);

  return api
    .post<ApiEnvelope<SubmissionFile>>(
      `${MILESTONE_BASE}/${submissionId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((r) => r.data);
};

export const getSubmissionFiles = (submissionId: Id) =>
  api
    .get<ApiEnvelope<SubmissionFile[]>>(`${BASE}/${submissionId}/files`)
    .then((r) => r.data);

export const deleteSubmissionFile = (fileId: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`${MILESTONE_BASE}/files/${fileId}`)
    .then((r) => r.data);

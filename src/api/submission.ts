import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  Submission,
  SubmissionHistory,
  CreateSubmissionRequest,
  SubmissionFile,
} from "../types/submission";

const BASE = "/student/milestones";

export const submitMilestone = (payload: CreateSubmissionRequest) =>
  api
    .post<ApiEnvelope<Submission>>(`${BASE}/submit`, payload)
    .then((r) => r.data);

export const getSubmissionHistory = (milestoneId: Id, projectId: Id) =>
  api
    .get<ApiEnvelope<SubmissionHistory>>(
      `${BASE}/${milestoneId}/submissions?projectId=${projectId}`
    )
    .then((r) => r.data);

export const getLatestSubmission = (milestoneId: Id, projectId: Id) =>
  api
    .get<ApiEnvelope<Submission>>(
      `${BASE}/${milestoneId}/latest?projectId=${projectId}`
    )
    .then((r) => r.data);

export const uploadSubmissionFile = (submissionId: Id, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post<ApiEnvelope<SubmissionFile>>(
      `${BASE}/${submissionId}/upload`,
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
    .delete<ApiEnvelope<boolean>>(`${BASE}/files/${fileId}`)
    .then((r) => r.data);

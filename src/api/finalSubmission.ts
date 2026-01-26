import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  FinalSubmission,
  CreateFinalSubmissionRequest,
  UpdateFinalSubmissionRequest,
} from "../types/finalSubmission";

const BASE = "/student/projects";

export const createFinalSubmission = (
  projectId: Id,
  payload: CreateFinalSubmissionRequest
) =>
  api
    .post<ApiEnvelope<FinalSubmission>>(
      `${BASE}/${projectId}/final-submission`,
      payload
    )
    .then((r) => r.data);

export const getFinalSubmission = (projectId: Id) =>
  api
    .get<ApiEnvelope<FinalSubmission>>(
      `${BASE}/${projectId}/final-submission`
    )
    .then((r) => r.data);

export const updateFinalSubmission = (
  projectId: Id,
  payload: UpdateFinalSubmissionRequest
) =>
  api
    .put<ApiEnvelope<FinalSubmission>>(
      `${BASE}/${projectId}/final-submission`,
      payload
    )
    .then((r) => r.data);

export const uploadFinalSubmissionFile = (
  projectId: Id,
  fileType: "report" | "presentation" | "sourcecode" | "video",
  file: File
) => {
  const formData = new FormData();
  
  const fieldNames = {
    report: "FinalReport",
    presentation: "Presentation",
    sourcecode: "SourceCode",
    video: "VideoDemo",
  };

  formData.append(fieldNames[fileType], file);

  return api
    .post<ApiEnvelope<FinalSubmission>>(
      `${BASE}/${projectId}/final-submission/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((r) => r.data);
};

export const updateFinalSubmissionFile = (
  projectId: Id,
  fileType: "report" | "presentation" | "sourcecode" | "video",
  file: File
) => {
  const formData = new FormData();
  
  const fieldNames = {
    report: "FinalReport",
    presentation: "Presentation",
    sourcecode: "SourceCode",
    video: "VideoDemo",
  };

  formData.append(fieldNames[fileType], file);

  return api
    .put<ApiEnvelope<FinalSubmission>>(
      `${BASE}/${projectId}/final-submission/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((r) => r.data);
};

export const deleteFinalSubmissionFile = (
  projectId: Id,
  fileType: "report" | "presentation" | "sourcecode" | "video"
) =>
  
  api
    .delete<ApiEnvelope<boolean>>(
      `${BASE}/${projectId}/final-submission/files/${fileType}`
    )
    .then((r) => r.data);

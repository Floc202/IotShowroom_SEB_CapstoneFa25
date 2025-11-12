import type { Id } from "./base";

export interface FinalSubmission {
  finalSubmissionId: Id;
  projectId: Id;
  projectTitle: string;
  groupName: string;
  finalReportUrl: string | null;
  presentationUrl: string | null;
  sourceCodeUrl: string | null;
  videoDemoUrl: string | null;
  repositoryUrl: string;
  submissionNotes: string;
  submittedBy: Id;
  submittedByName: string;
  submittedAt: string;
  lastUpdatedAt: string;
  grade: number | null;
  feedback: string | null;
  gradedBy: Id | null;
  gradedByName: string | null;
  gradedAt: string | null;
  status: string;
  canUpdate: boolean;
  deadline: string;
}

export interface CreateFinalSubmissionRequest {
  submissionNotes: string;
  repositoryUrl: string;
}

export interface UpdateFinalSubmissionRequest {
  submissionNotes: string;
  repositoryUrl: string;
}

export interface UploadFinalSubmissionFilesRequest {
  finalReport?: File;
  presentation?: File;
  sourceCode?: File;
  videoDemo?: File;
}

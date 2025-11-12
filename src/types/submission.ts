import type { Id } from "./base";

export interface SubmissionFile {
  fileId: Id;
  submissionId: Id;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: Id;
  uploadedByName: string | null;
  uploadedAt: string;
}

export interface Submission {
  submissionId: Id;
  projectId: Id;
  projectTitle: string;
  milestoneId: Id;
  milestoneTitle: string;
  version: number;
  submittedBy: Id;
  submittedByName: string | null;
  description: string | null;
  submissionNotes: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  gradedBy: Id | null;
  gradedByName: string | null;
  gradedAt: string | null;
  status: string;
  canResubmit: boolean;
  deadline: string | null;
  files: SubmissionFile[];
}

export interface SubmissionHistory {
  milestoneId: Id;
  milestoneTitle: string;
  weight: number;
  deadline: string;
  totalSubmissions: number;
  latestSubmission: Submission | null;
  allVersions: Submission[];
}

export interface CreateSubmissionRequest {
  projectId: Id;
  milestoneId: Id;
  description: string;
  submissionNotes: string;
}

import type { Id } from "./base";

export interface GradingClass {
  classId: Id;
  className: string;
  description: string;
  semesterId: Id;
  semesterName: string;
  mainInstructorId: Id;
  mainInstructorName: string;
  assignedAt: string;
  isActive: boolean;
  totalProjects: number;
  approvedProjects: number;
  projectsWithFinalSubmission: number;
  projectsIGraded: number;
  projectsPendingMyGrade: number;
}

export interface GradingProject {
  projectId: Id;
  title: string;
  description: string;
  component: string;
  groupId: Id;
  groupName: string;
  classId: Id;
  className: string;
  status: string;
  createdAt: string;
  hasFinalSubmission: boolean;
  finalSubmissionId: Id;
  submittedAt: string;
  hasMyGrade: boolean;
  myGrade: number;
  averageGrade: number;
  totalGradesCount: number;
  gradingStatus: string;
}

export interface GradeInfo {
  instructorId: Id;
  instructorName: string;
  grade: number;
  gradedAt: string;
}

export interface FinalSubmissionDetail {
  finalSubmissionId: Id;
  projectId: Id;
  projectTitle: string;
  groupId: Id;
  groupName: string;
  groupMembers: string[];
  classId: Id;
  className: string;
  finalReportUrl: string;
  presentationUrl: string;
  sourceCodeUrl: string;
  videoDemoUrl: string;
  repositoryUrl: string;
  submissionNotes: string;
  submittedAt: string;
  lastUpdatedAt: string;
  averageGrade: number;
  allGrades: GradeInfo[];
  hasMyGrade: boolean;
  myGrade: number;
  myFeedback: string;
  myGradedAt: string;
}

export interface SubmitGradeRequest {
  grade: number;
  feedback: string;
}

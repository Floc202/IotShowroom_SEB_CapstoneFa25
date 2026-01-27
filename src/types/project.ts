import type { Id } from "./base";

export interface ProjectDetail {
  projectId: Id;
  title: string;
  description: string | null;
  component?: string | null;
  status: string;
  leaderId: Id;
  leaderName: string;
  groupId: Id;
  groupName: string;
  createdAt: string;
  updatedAt: string | null;
  memberCount?: number;
  members: GroupMemberInfo[] | string[];
  classId?: Id;
  className?: string;
  instructorName?: string;
  simulations?: SimulationInfo[];
  finalSubmission?: FinalSubmissionInfo | null;
  graderGrades?: GraderGrade[];
  averageGraderGrade?: number | null;
}

export interface MemberInfo {
  userId: Id;
  fullName: string;
  email: string;
  roleInProject: string;
  avatarUrl: string | null;
}

export interface CreateProjectRequest {
  groupId: Id;
  title: string;
  description: string;
  component: string;
}

export interface UpdateProjectRequest {
  projectId: Id;
  requesterUserId: Id;
  title: string;
  description: string;
  component: string;
}

export interface UpdateProjectStatusRequest {
  projectId: Id;
  instructorId: Id;
  status: string;
  comment: string;
}

export interface ProjectStatusHistory {
  historyId: Id;
  status: string;
  comment: string;
  reviewerId: Id;
  reviewerName: string;
  reviewedAt: string;
}

export interface GroupMemberInfo {
  userId: Id;
  fullName: string;
  email: string;
  studentCode: string | null;
  roleInGroup: string;
}

export interface SimulationInfo {
  simulationId: Id;
  title: string;
  description: string;
  wokwiProjectUrl: string;
  wokwiProjectId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinalSubmissionInfo {
  finalSubmissionId: Id;
  finalReportUrl: string;
  presentationUrl: string;
  sourceCodeUrl: string;
  videoDemoUrl: string;
  repositoryUrl: string;
  submissionNotes: string;
  submittedAt: string;
  lastUpdatedAt: string;
  instructorGrade: number | null;
  instructorFeedback: string | null;
  gradedByInstructorName: string | null;
  instructorGradedAt: string | null;
}

export interface GraderGrade {
  gradeId: Id;
  instructorId: Id;
  instructorName: string;
  instructorEmail: string;
  grade: number;
  feedback: string;
  gradedAt: string;
}

export interface SemesterProjectDetail {
  projectId: Id;
  title: string;
  description: string;
  component: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  groupId: Id;
  groupName: string;
  leaderId: Id;
  leaderName: string;
  members: GroupMemberInfo[];
  classId: Id;
  className: string;
  instructorName: string;
  simulations: SimulationInfo[];
  finalSubmission: FinalSubmissionInfo | null;
  graderGrades: GraderGrade[];
  averageGraderGrade: number | null;
}

export interface SemesterProjectsResponse {
  semesterId: Id;
  semesterName: string;
  semesterCode: string;
  totalProjects: number;
  projects: SemesterProjectDetail[];
}

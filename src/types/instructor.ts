import type { Id } from "./base";

export interface InstructorDashboard {
  totalClasses: number;
  totalGroups: number;
  totalProjects: number;
  totalStudents: number;
  pendingProposals: number;
  submissionsToGrade: number;
  recentAnnouncements: number;
  recentClasses: InstructorClassItem[];
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  activityType: string;
  description: string;
  relatedClass: string | null;
  relatedGroup: string | null;
  activityDate: string;
}

export interface Announcement {
  announcementId: Id;
  adminId: Id;
  adminName: string;
  title: string;
  content: string;
  targetAudience: string;
  createdAt: string;
}

export interface InstructorClassItem {
  classId: Id;
  className: string;
  description: string | null;
  instructorId: Id;
  instructorName: string;
  semesterId: Id;
  semesterName: string;
  semesterCode: string;
  createdAt: string;
  totalStudents: number;
  totalGroups: number;
  totalProjects: number;
  startTime?: string;
  status?: "Not Started" | "In Progress" | "Completed";
}

export interface GradeMilestoneRequest {
  projectId: Id;
  milestoneDefId: Id;
  instructorId: Id;
  score: number;
  feedback: string;
  weightRatioSnapshot: number;
}

export interface ProjectGrade {
  meId: Id;
  projectId: Id;
  projectTitle: string | null;
  milestoneDefId: Id;
  milestoneTitle: string;
  instructorId: Id;
  instructorName: string;
  weightRatioSnapshot: number;
  score: number;
  feedback: string;
  evaluatedAt: string;
}

export interface InstructorGroupMember {
  userId: Id;
  fullName: string;
  email: string;
  roleInGroup: string;
  avatarUrl?: string | null;
}

export interface InstructorGroupDetail {
  groupId: Id;
  groupName: string;
  description: string | null;
  leaderId: Id;
  leaderName: string;
  classId: Id;
  className: string;
  createdAt: string;
  updatedAt: string | null;
  memberCount: number;
  members: InstructorGroupMember[];
  projectCount: number;
  classStatus?: "Not Started" | "In Progress" | "Completed";
}

export interface UpdateGroupRequest {
  groupName: string;
  description: string;
}

export interface StudentWithGroup {
  userId: number;
  fullName: string;
  email: string;
  enrolledAt: string;
  hasGroup: boolean;
  groupId: number | null;
  groupName: string | null;
  roleInGroup: string | null;
  joinedGroupAt: string | null;
}

export interface StudentsWithGroupsResponse {
  classId: number;
  className: string;
  totalStudents: number;
  studentsWithGroup: number;
  studentsWithoutGroup: number;
  students: StudentWithGroup[];
}

export interface AddMemberRequest {
  userId: Id;
  roleInGroup: string;
}

export interface UpdateMemberRoleRequest {
  roleInGroup: string;
}

export interface ClassConfig {
  configId: Id;
  classId: Id;
  className: string;
  maxGroupsAllowed: number;
  minMembersPerGroup: number;
  maxMembersPerGroup: number;
  groupFormationDeadline: string | null;
  allowStudentCreateGroup: boolean;
  projectCreationDeadline: string | null;
  submissionStartDate: string | null;
  submissionDeadline: string | null;
  allowLateSubmission: boolean;
  lateSubmissionPenaltyPercent: number | null;
  editWindowStartDate: string | null;
  editWindowEndDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  currentGroupCount: number;
  isGroupFormationOpen: boolean;
  groupFormationStatus: string;
  isProjectCreationOpen: boolean;
  projectCreationStatus: string;
  submissionPeriodStatus: string;
  canSubmitNow: boolean;
  isSubmissionLate: boolean;
  editWindowStatus: string;
  canEditNow: boolean;
}

export interface UpdateClassConfigRequest {
  maxGroupsAllowed: number;
  minMembersPerGroup: number;
  maxMembersPerGroup: number;
  groupFormationDeadline: string | null;
  projectCreationDeadline: string | null;
  allowStudentCreateGroup: boolean;
  submissionStartDate: string | null;
  submissionDeadline: string | null;
  allowLateSubmission: boolean;
  lateSubmissionPenaltyPercent: number | null;
  editWindowStartDate: string | null;
  editWindowEndDate: string | null;
}

export interface FinalGradeRequest {
  grade: number;
  feedback: string;
}

export interface UnassignedStudent {
  userId: Id;
  fullName: string;
  email: string;
  enrolledAt: string;
  avatarUrl: string | null;
}

export interface UnassignedStudentsResponse {
  classId: Id;
  className: string;
  totalUnassignedStudents: number;
  students: UnassignedStudent[];
}

export interface MilestoneWarningDetail {
  milestoneId: Id;
  title: string;
  milestoneOrder: number;
  weightPercentage: number;
  dueDate: string;
  isCompleted: boolean;
}

export interface ProjectMilestoneWarning {
  projectId: Id;
  projectTitle: string;
  groupId: Id;
  groupName: string;
  totalWeightPercentage: number;
  missingWeightPercentage: number;
  totalMilestones: number;
  milestones: MilestoneWarningDetail[];
}

export interface StudentGrade {
  studentId: Id;
  studentName: string;
  email: string;
  groupId: Id | null;
  groupName: string | null;
  projectId: Id | null;
  projectTitle: string | null;
  milestoneGrades: Record<string, number | null>;
  overallGrade: number | null;
  status: string;
}

export interface ClassGrades {
  classId: Id;
  className: string;
  semesterName: string;
  instructorName: string;
  totalStudents: number;
  totalGroups: number;
  studentGrades: StudentGrade[];
  milestoneNames: string[];
}

export interface MilestoneTemplate {
  title: string;
  description: string;
  orderIndex: number;
  weight: number;
  daysDuration: number;
}

export interface CreateProjectTemplateRequest {
  classId: number;
  title: string;
  description: string;
  component: string;
  maxGroups: number;
  milestones: MilestoneTemplate[];
}

export interface UpdateProjectTemplateRequest {
  title: string;
  description: string;
  component: string;
  maxGroups: number;
  isActive: boolean;
}

export interface ProjectTemplate {
  templateId: Id;
  classId: Id;
  className: string;
  title: string;
  description: string;
  component: string;
  maxGroups: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  totalRegistrations: number;
  milestones: ProjectTemplateMilestone[];
}

export interface ProjectTemplateMilestone {
  milestoneId: Id;
  templateId: Id;
  title: string;
  description: string;
  orderIndex: number;
  weight: number;
  daysDuration: number;
}

export interface TemplateRegistration {
  registrationId: Id;
  templateId: Id;
  groupId: Id;
  groupName: string;
  registeredAt: string;
  projectId: Id | null;
  projectTitle: string | null;
}

export interface TemplateStatistics {
  templateId: Id;
  templateTitle: string;
  totalRegistrations: number;
  activeProjects: number;
  completedProjects: number;
  totalGroups: number;
  averageProgress: number;
}

export interface CreatedGroupInfo {
  groupId: number;
  groupName: string;
  leaderId: number;
  leaderName: string;
  memberCount: number;
  memberNames: string[];
}

export interface RandomGroupCreationResult {
  classId: number;
  className: string;
  totalStudentsInClass: number;
  studentsAlreadyInGroups: number;
  unassignedStudents: number;
  groupsCreated: number;
  studentsAssigned: number;
  studentsRemaining: number;
  minMembersPerGroup: number;
  maxMembersPerGroup: number;
  createdGroups: CreatedGroupInfo[];
  message: string;
}
export interface AdminOverview {
  totalClasses: number;
  totalInstructors: number;
  totalStudents: number;
  totalGroups: number;
  totalProjects: number;
  activeSemesterCount: number;
  pendingApprovals: number;
  recentAnnouncements: number;
  completedProjects: number;
  recentActivities: Array<{
    activityType: string;
    description: string;
    performedBy: string;
    activityDate: string; 
    relatedEntity: string | null;
  }>;
  systemAlerts: Array<unknown>;
}

export interface AdminStatistics {
  userStats: {
    totalUsers: number;
    totalAdmins: number;
    totalInstructors: number;
    totalStudents: number;
    activeUsersLast30Days: number;
    newUsersThisMonth: number;
  };
  classStats: {
    totalClasses: number;
    activeClasses: number;
    totalSemesters: number;
    activeSemesters: number;
    averageClassSize: number;
    classesWithoutInstructor: number;
  };
  projectStats: {
    totalProjects: number;
    pendingProjects: number;
    approvedProjects: number;
    completedProjects: number;
    rejectedProjects: number;
    totalGroups: number;
    averageGroupSize: number;
    projectCompletionRate: number;
  };
  submissionStats: {
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingGrading: number;
    lateSubmissions: number;
    averageScore: number;
    submissionRate: number;
    onTimeSubmissionRate: number;
  };
  systemHealth: {
    totalAnnouncements: number;
    activeAnnouncements: number;
    lastBackupDate: string | null;
    databaseSizeInMB: number;
    systemStatus: "Healthy" | string;
  };
}

export type ChartType = "Bar" | "Pie" | "Line";

export interface ChartItem<T = any> {
  label: string;
  value: number;
  color?: string;
  additionalData?: T | null;
}

export interface ChartResponse<T = any> {
  chartData: Array<ChartItem<T>>;
  chartType: ChartType;
  title: string;
}

export interface HallOfFameItem {
  hofId: number;
  projectId: number;
  projectName: string | null;
  groupName: string | null;
  nominatedBy: number;
  nominatedByName: string | null;
  nominatedAt: string; 
  semesterId: number;
  semesterName: string | null;
  rank: number;
  note: string | null;
  finalScore: number | null;
}

export interface CreateHofDto {
  projectId: number;
  semesterId: number;
  rank: number;
  note: string;
}

export interface UpdateHofDto extends Partial<CreateHofDto> {}

export interface LeaderboardTop10 {
  semesterId: number;
  semesterName: string;
  totalProjects: number;
  topProjects: Array<{
    projectId: number;
    projectName: string;
    rank: number;
    score?: number | null;
  }>;
  generatedAt: string;
}

export type ReportsQuery = { semesterId?: number | string };

export interface ClassesSummaryReport {
  totalClasses: number;
  activeClasses: number;
  classesWithoutInstructor: number;
  averageClassSize: number;
  classesBySemester: Array<{
    semesterId: number;
    semesterName: string | null;
    classCount: number;
    totalStudents: number;
    totalGroups: number;
    totalProjects: number;
  }>;
}

export interface InstructorWorkloadItem {
  instructorId: number;
  instructorName: string;
  email: string;
  classCount: number;
  totalStudents: number;
  totalGroups: number;
  pendingProposals: number;
  submissionsToGrade: number;
}

export interface InstructorsWorkloadReport {
  totalInstructors: number;
  averageClassesPerInstructor: number;
  instructorsWithNoClasses: number;
  instructorWorkloads: InstructorWorkloadItem[];
}

export interface StudentsDistributionReport {
  totalStudents: number;
  studentsInGroups: number;
  studentsWithoutGroups: number;
  groupParticipationRate: number;
  studentsBySemester: Array<{
    semesterId: number;
    semesterName: string | null;
    studentCount: number;
    inGroups: number;
    withoutGroups: number;
  }>;
  studentsByClass: Array<{
    classId: number;
    className: string;
    semesterName: string | null;
    studentCount: number;
    groupCount: number;
    averageGroupSize: number;
  }>;
}

export interface ProjectsStatusReport {
  totalProjects: number;
  pendingProjects: number;
  approvedProjects: number;
  completedProjects: number;
  rejectedProjects: number;
  completionRate: number;
  projectsByStatus: Array<{ status: string; count: number; percentage: number }>;
  projectsBySemester: Array<{
    semesterId: number;
    semesterName: string | null;
    totalProjects: number;
    completed: number;
    inProgress: number;
    pending: number;
  }>;
}

export interface MilestoneProgressReport {
  totalMilestones: number;
  completedMilestones: number;
  pendingMilestones: number;
  overallCompletionRate: number;
  averageGrade: number;
  completionByMilestone: Array<any>;
  completionBySemester: Array<any>;
}

export interface GradesDistributionReport {
  totalGradedProjects: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  medianGrade: number;
  gradeRanges: Array<any>;
  gradesBySemester: Array<any>;
  topProjects: Array<any>;
}

export interface ExportReportDto {
  exportFormat: string; 
  semesterId?: number;
  classId?: number;
  startDate?: string; 
  endDate?: string;   
  reportType: string; 
}

export interface ExportReportResult {
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSizeBytes: number;
  generatedAt: string;
  exportFormat: string;
}

export interface BulkAddStudentsDto {
  classId: number;
  maxMembers: number;
}

export interface BulkAddStudentsResult {
  classId: number;
  className: string;
  previousStudentCount: number;
  newStudentsAdded: number;
  totalStudentsNow: number;
  studentsNotAdded: number;
  message: string;
  addedStudents: Array<{
    userId: number;
    fullName: string;
    email: string;
    enrolledAt: string; 
  }>;
  warnings: string[];
}

export interface AddStudentToClassDto {
  studentId: number;
}

export interface AddStudentToClassResult {
  classId: number;
  className: string;
  studentId: number;
  studentName: string;
  email: string;
  enrolledAt: string; 
  message: string;
}

export interface ClassStudentsResult {
  classId: number;
  className: string;
  totalStudents: number;
  students: Array<{
    userId: number;
    fullName: string;
    email: string;
    enrolledAt: string; 
  }>;
}

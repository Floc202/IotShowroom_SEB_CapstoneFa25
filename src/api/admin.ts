import api from "./axios";
import type { ApiEnvelope } from "../types/base";
import type {
  AdminOverview,
  AdminStatistics,
  ChartResponse,
  LeaderboardTop10,
  HallOfFameItem,
  CreateHofDto,
  UpdateHofDto,
  ReportsQuery,
  ClassesSummaryReport,
  InstructorsWorkloadReport,
  StudentsDistributionReport,
  ProjectsStatusReport,
  MilestoneProgressReport,
  GradesDistributionReport,
  ExportReportDto,
  ExportReportResult,
  BulkAddStudentsDto,
  BulkAddStudentsResult,
  AddStudentToClassDto,
  AddStudentToClassResult,
  ClassStudentsResult,
} from "../types/admin";

/** ===== Dashboard ===== */
export const getAdminOverview = () =>
  api
    .get<ApiEnvelope<AdminOverview>>("Admin/dashboard/overview")
    .then((r) => r.data);

export const getAdminStatistics = () =>
  api
    .get<ApiEnvelope<AdminStatistics>>("Admin/dashboard/statistics")
    .then((r) => r.data);

/** ===== Charts ===== */
export const getClassesBySemesterChart = () =>
  api
    .get<
      ApiEnvelope<
        ChartResponse<{
          SemesterId: number;
          StartDate: string;
          EndDate: string;
        }>
      >
    >("Admin/dashboard/charts/classes-by-semester")
    .then((r) => r.data);

export const getProjectDistributionChart = () =>
  api
    .get<ApiEnvelope<ChartResponse<null>>>(
      "Admin/dashboard/charts/project-distribution"
    )
    .then((r) => r.data);

export const getMilestoneCompletionChart = () =>
  api
    .get<
      ApiEnvelope<
        ChartResponse<{ TotalSubmissions: number; CompletionRate: number }>
      >
    >("Admin/dashboard/charts/milestone-completion")
    .then((r) => r.data);

/** ===== Hall of Fame ===== */
export const getHallOfFame = () =>
  api
    .get<ApiEnvelope<HallOfFameItem[]>>("Admin/hall-of-fame")
    .then((r) => r.data);

export const createHallOfFame = (payload: CreateHofDto) =>
  api
    .post<ApiEnvelope<HallOfFameItem>>("Admin/hall-of-fame", payload)
    .then((r) => r.data);

export const updateHallOfFame = (hofId: number, payload: UpdateHofDto) =>
  api
    .put<ApiEnvelope<HallOfFameItem>>(`Admin/hall-of-fame/${hofId}`, payload)
    .then((r) => r.data);

export const deleteHallOfFame = (hofId: number) =>
  api
    .delete<ApiEnvelope<boolean>>(`Admin/hall-of-fame/${hofId}`)
    .then((r) => r.data);

export const getHallOfFameBySemester = (semesterId: number) =>
  api
    .get<ApiEnvelope<HallOfFameItem[]>>(`Admin/hall-of-fame/${semesterId}`)
    .then((r) => r.data);

/** ===== Leaderboard ===== */
export const getLeaderboardTop10 = (semesterId: number) =>
  api
    .get<ApiEnvelope<LeaderboardTop10>>(
      `Admin/leaderboard/${semesterId}/top-10`
    )
    .then((r) => r.data);

/** ===== Reports ===== */
export const getClassesSummaryReport = (q?: ReportsQuery) =>
  api
    .get<ApiEnvelope<ClassesSummaryReport>>("Admin/reports/classes-summary", {
      params: q,
    })
    .then((r) => r.data);

export const getInstructorsWorkloadReport = (q?: ReportsQuery) =>
  api
    .get<ApiEnvelope<InstructorsWorkloadReport>>(
      "Admin/reports/instructors-workload",
      { params: q }
    )
    .then((r) => r.data);

export const getStudentsDistributionReport = (q?: ReportsQuery) =>
  api
    .get<ApiEnvelope<StudentsDistributionReport>>(
      "Admin/reports/students-distribution",
      { params: q }
    )
    .then((r) => r.data);

export const getProjectsStatusReport = (q?: ReportsQuery) =>
  api
    .get<ApiEnvelope<ProjectsStatusReport>>("Admin/reports/projects-status", {
      params: q,
    })
    .then((r) => r.data);

export const getMilestoneProgressReport = (q?: ReportsQuery) =>
  api
    .get<ApiEnvelope<MilestoneProgressReport>>(
      "Admin/reports/milestone-progress",
      { params: q }
    )
    .then((r) => r.data);

export const getGradesDistributionReport = (q?: ReportsQuery) =>
  api
    .get<ApiEnvelope<GradesDistributionReport>>(
      "Admin/reports/grades-distribution",
      { params: q }
    )
    .then((r) => r.data);

/** ===== Reports Export ===== */
export const exportReports = (payload: ExportReportDto) =>
  api
    .post<ApiEnvelope<ExportReportResult>>("Admin/reports/export", payload)
    .then((r) => r.data);

/** ===== Classes - Bulk Add & Student Management ===== */
export const bulkAddStudents = (payload: BulkAddStudentsDto) =>
  api
    .post<ApiEnvelope<BulkAddStudentsResult>>(
      "Admin/classes/bulk-add-students",
      payload
    )
    .then((r) => r.data);

export const addStudentToClass = (
  classId: number,
  payload: AddStudentToClassDto
) =>
  api
    .post<ApiEnvelope<AddStudentToClassResult>>(
      `Admin/classes/${classId}/students`,
      payload
    )
    .then((r) => r.data);

export const getClassStudents = (classId: number) =>
  api
    .get<ApiEnvelope<ClassStudentsResult>>(`Admin/classes/${classId}/students`)
    .then((r) => r.data);

export const removeStudentFromClass = (classId: number, studentId: number) =>
  api
    .delete<ApiEnvelope<boolean>>(
      `Admin/classes/${classId}/students/${studentId}`
    )
    .then((r) => r.data);

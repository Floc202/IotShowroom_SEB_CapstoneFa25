import api from "./axios";
import type { ApiEnvelope } from "../types/base";
import type {
  Semester,
  CreateSemesterDto,
  UpdateSemesterDto,
} from "../types/semesters";

export const listSemesters = () =>
  api.get<ApiEnvelope<Semester[]>>("/Semesters").then((r) => r.data);

export const createSemester = (payload: CreateSemesterDto) =>
  api.post<ApiEnvelope<Semester>>("/Semesters", payload).then((r) => r.data);

export const getSemesterById = (semesterId: number) =>
  api
    .get<ApiEnvelope<Semester>>(`/Semesters/${semesterId}`)
    .then((r) => r.data);

export const updateSemester = (
  semesterId: number,
  payload: UpdateSemesterDto
) =>
  api
    .put<ApiEnvelope<Semester>>(`/Semesters/${semesterId}`, payload)
    .then((r) => r.data);

export const deleteSemester = (semesterId: number) =>
  api
    .delete<ApiEnvelope<boolean>>(`/Semesters/${semesterId}`)
    .then((r) => r.data);

export const getSemestersByYear = (year: number) =>
  api
    .get<ApiEnvelope<Semester[]>>(`/Semesters/year/${year}`)
    .then((r) => r.data);

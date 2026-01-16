import api from "./axios";
import type { ApiEnvelope, Id } from "../types/base";
import type {
  Syllabus,
  SyllabusByClass,
  SyllabusDetail,
  SyllabusFile,
  CreateSyllabusRequest,
  UpdateSyllabusRequest,
  UploadSyllabusFileRequest,
  UpdateSyllabusFileRequest,
} from "../types/syllabus";

const BASE = "/Syllabus";

export const createSyllabus = (req: CreateSyllabusRequest) =>
  api
    .post<ApiEnvelope<Syllabus>>(`${BASE}`, req)
    .then((r) => r.data);

export const getSyllabusById = (id: Id) =>
  api
    .get<ApiEnvelope<SyllabusDetail>>(`${BASE}/${id}`)
    .then((r) => r.data);

export const getSyllabusByClass = (classId: Id) =>
  api
    .get<ApiEnvelope<SyllabusByClass[]>>(`${BASE}/class/${classId}`)
    .then((r) => r.data);

export const getMySyllabuses = () =>
  api
    .get<ApiEnvelope<Syllabus[]>>(`${BASE}/my-syllabuses`)
    .then((r) => r.data);

export const updateSyllabus = (id: Id, req: UpdateSyllabusRequest) =>
  api
    .put<ApiEnvelope<Syllabus>>(`${BASE}/${id}`, req)
    .then((r) => r.data);

export const deleteSyllabus = (id: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`${BASE}/${id}`)
    .then((r) => r.data);

export const uploadSyllabusFile = (req: UploadSyllabusFileRequest) => {

  console.log("req: ", req);
  const formData = new FormData();
  formData.append('syllabusId', req.syllabusId.toString());
  formData.append('file', req.file);
  if (req.description) {
    formData.append('description', req.description);
  }
  if (req.displayOrder !== undefined) {
    formData.append('displayOrder', req.displayOrder.toString());
  }
  
  return api
    .post<ApiEnvelope<SyllabusFile>>(`${BASE}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((r) => r.data);
};

export const getSyllabusFiles = (syllabusId: Id) =>
  api
    .get<ApiEnvelope<SyllabusFile[]>>(`${BASE}/${syllabusId}/files`)
    .then((r) => r.data);

export const updateSyllabusFile = (fileId: Id, req: UpdateSyllabusFileRequest) =>
  api
    .put<ApiEnvelope<SyllabusFile>>(`${BASE}/files/${fileId}`, req)
    .then((r) => r.data);

export const deleteSyllabusFile = (fileId: Id) =>
  api
    .delete<ApiEnvelope<boolean>>(`${BASE}/files/${fileId}`)
    .then((r) => r.data);

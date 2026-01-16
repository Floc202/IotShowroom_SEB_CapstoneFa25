import type { Id } from "./base";

export interface Syllabus {
  syllabusId: Id;
  classId: Id;
  className: string;
  instructorId: Id;
  instructorName: string;
  title: string;
  description: string;
  version: string;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface SyllabusByClass {
  syllabusId: Id;
  classId: Id;
  className: string;
  title: string;
  version: string;
  academicYear: string;
  createdByName: string;
  createdAt: string;
  isActive: boolean;
  fileCount: number;
}

export interface SyllabusDetail extends Syllabus {
  files: SyllabusFile[];
}

export interface SyllabusFile {
  fileId: Id;
  syllabusId: Id;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  uploadedBy: Id;
  uploadedByName: string;
  uploadedAt: string;
  displayOrder: number;
}

export interface CreateSyllabusRequest {
  classId: Id;
  title: string;
  description: string;
  version: string;
  academicYear: string;
}

export interface UpdateSyllabusRequest {
  title: string;
  description: string;
  version: string;
  academicYear: string;
  isActive: boolean;
}

export interface UploadSyllabusFileRequest {
  syllabusId: Id;
  file: File;
  description?: string;
  displayOrder?: number;
}

export interface UpdateSyllabusFileRequest {
  fileName: string;
  description?: string;
  displayOrder?: number;
}

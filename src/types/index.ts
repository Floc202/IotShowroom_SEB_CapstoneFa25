export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  phone?: string;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  members?: string[];
  status: 'draft' | 'submitted' | 'in_progress' | 'evaluated';
  assets: ProjectAsset[];
  demoConfig: {
    protocol: 'mqtt' | 'websocket';
    demoUrl: string;
  };
  evaluation?: Evaluation;
  createdAt: string;
  submittedAt?: string;
  dueDate?: string;
}

export interface ProjectAsset {
  id: string;
  type: 'image' | 'video' | 'code';
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface Class {
  id: string;
  name: string;
  semester: string;
  year: string;
  instructor: string;
  instructorId: string;
  studentCount: number;
  projectCount: number;
  status: 'active' | 'archived';
  description?: string;
  enrolledStudents: string[];
  createdAt: string;
}

export interface Evaluation {
  id: string;
  projectId: string;
  instructorId: string;
  instructorName: string;
  criteria: EvaluationCriteria[];
  totalScore: number;
  maxScore: number;
  feedback: string;
  createdAt: string;
  status: 'draft' | 'submitted';
}

export interface EvaluationCriteria {
  name: string;
  maxScore: number;
  score: number;
  comment: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'class' | 'role';
  targetClass?: string;
  targetRole?: 'student' | 'instructor' | 'admin';
  createdAt: string;
  createdBy: string;
  createdByName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'archived';
}

export interface IoTData {
  timestamp: number;
  temperature: number;
  humidity: number;
  lightLevel: number;
  motionDetected: boolean;
  deviceId?: string;
  batteryLevel?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId: string;
  actionUrl?: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'semester' | 'class' | 'student' | 'project';
  filters: {
    year?: string;
    semester?: string;
    classId?: string;
    studentId?: string;
  };
  data: any;
  generatedAt: string;
  generatedBy: string;
}

export interface SystemSettings {
  siteName: string;
  emailNotifications: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  demoTimeout: number;
  evaluationDeadline: number;
}
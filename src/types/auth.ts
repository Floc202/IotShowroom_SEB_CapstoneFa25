export type RoleName = "Admin" | "Manager" | "Instructor" | "Student";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  responseCode: string;
  statusCode: number;
  data: null | {
    userId: number;
    email: string;
    fullName: string;
    roleId: number;
    roleName: RoleName;
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiry: string;
  };
  message: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface ApiEnvelope<T> {
  isSuccess: boolean;
  responseCode: string;
  statusCode: number;
  data: T;
  message: string;
}

export interface Me {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  roleName: RoleName;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

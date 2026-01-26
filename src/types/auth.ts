export type RoleName = "Admin" | "Instructor" | "Student";

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

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  email: string;
  expiresAt: string;
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  isValid: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

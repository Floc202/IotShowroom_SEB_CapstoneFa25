import api from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ChangePasswordRequest,
} from "../types/auth";
import type { ApiEnvelope } from "../types/base";

export const login = (payload: LoginRequest) =>
  api.post<LoginResponse>("/Authentication/login", payload).then((r) => r.data);

export const loginWithGoogle = (firebaseToken: string) =>
  api
    .post<LoginResponse>("/Authentication/login/google", { firebaseToken })
    .then((r) => r.data);

export const register = (payload: RegisterRequest) =>
  api
    .post<ApiEnvelope<null | { userId: number }>>("/register", payload)
    .then((r) => r.data);

export const logout = () =>
  api.post<ApiEnvelope<null>>("/Authentication/logout").then((r) => r.data);

export const refreshToken = (refreshToken: string) =>
  api
    .post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
      "/refresh-token",
      { refreshToken }
    )
    .then((r) => r.data);

export const sendOTP = (payload: SendOTPRequest) =>
  api
    .post<ApiEnvelope<SendOTPResponse>>(
      "/Authentication/forgot-password/send-otp",
      payload
    )
    .then((r) => r.data);

export const verifyOTP = (payload: VerifyOTPRequest) =>
  api
    .post<ApiEnvelope<VerifyOTPResponse>>(
      "/Authentication/forgot-password/verify-otp",
      payload
    )
    .then((r) => r.data);

export const changePasswordWithOTP = (payload: ChangePasswordRequest) =>
  api
    .post<ApiEnvelope<null>>(
      "/Authentication/forgot-password/change-password",
      payload
    )
    .then((r) => r.data);

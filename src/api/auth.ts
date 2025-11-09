import api from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/auth";
import type { ApiEnvelope } from "../types/base";

export const login = (payload: LoginRequest) =>
  api.post<LoginResponse>("/Authentication/login", payload).then((r) => r.data);

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

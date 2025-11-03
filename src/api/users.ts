import api from "./axios";
import type { ApiEnvelope, Me } from "../types/auth";

export const getMe = () =>
  api.get<ApiEnvelope<Me>>("/User/me").then((r) => r.data);

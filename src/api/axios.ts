import axios from "axios";
import { STORAGE_KEYS } from "../utils/constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
        original.headers.Authorization = `Bearer ${localStorage.getItem(
          STORAGE_KEYS.ACCESS_TOKEN
        )}`;
        return api(original);
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw error;
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/refresh-token`,
          { refreshToken }
        );
        const newAccess = data?.data?.accessToken || data?.accessToken;
        const newRefresh = data?.data?.refreshToken || data?.refreshToken;
        if (newAccess)
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccess);
        if (newRefresh)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefresh);
        queue.forEach((r) => r());
        queue = [];
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        queue = [];
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe } from "../api/users";
import { login as loginApi, logout as logoutApi } from "../api/auth";
import { STORAGE_KEYS } from "../utils/constants";
import type { Me, RoleName } from "../types/auth";

interface AuthState {
  user: Me | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: RoleName | RoleName[]) => boolean;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((res) => {
        if (res.isSuccess) setUser(res.data as Me);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await loginApi({ email, password });
      if (!res.isSuccess || !res.data) {
        return { ok: false, message: res.message || "Login failed" };
      }
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.data.refreshToken);

      const me = await getMe();

      if (me.isSuccess) setUser(me.data as Me);
      return { ok: true, data: res.data };
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      return { ok: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {}
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    setUser(null);
  };

  const hasRole = (roles: RoleName | RoleName[]) => {
    const list = Array.isArray(roles) ? roles : [roles];
    return !!user && list.includes(user.roleName);
  };

  const refreshMe = async () => {
    const me = await getMe();
    if (me.isSuccess) setUser(me.data as Me);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, hasRole, refreshMe }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

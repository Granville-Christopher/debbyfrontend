import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

type AdminUser = {
  id: string;
  email: string;
  orgId: string;
  orgName: string;
  firstName?: string | null;
  lastName?: string | null;
  adminRoles?: string[];
};

type AdminAuthResponse = {
  accessToken: string;
  csrfToken: string;
  refreshToken: string;
  user: AdminUser;
};

type AdminRegisterPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  registrationSecret?: string;
};

type AdminAuthContextValue = {
  accessToken: string | null;
  csrfToken: string | null;
  user: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: AdminRegisterPayload) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const ACCESS_KEY = "adminAccessToken";
const REFRESH_KEY = "adminRefreshToken";
const CSRF_KEY = "adminCsrfToken";
const USER_KEY = "adminUser";

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(ACCESS_KEY));
  const [csrfToken, setCsrfToken] = useState<string | null>(() => localStorage.getItem(CSRF_KEY));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AdminUser;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const updateAccessToken = useCallback((token: string | null) => {
    setAccessToken(token);
    if (token) localStorage.setItem(ACCESS_KEY, token);
    else localStorage.removeItem(ACCESS_KEY);
  }, []);

  const updateCsrfToken = useCallback((token: string | null) => {
    setCsrfToken(token);
    if (token) localStorage.setItem(CSRF_KEY, token);
    else localStorage.removeItem(CSRF_KEY);
  }, []);

  const updateUser = useCallback((nextUser: AdminUser | null) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const refresh = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_KEY);
    if (!storedRefreshToken) {
      updateAccessToken(null);
      updateCsrfToken(null);
      updateUser(null);
      return;
    }

    try {
      const csrf = await apiRequest<{ csrfToken: string }>("/admin/auth/csrf-token");
      updateCsrfToken(csrf.csrfToken);

      const data = await apiRequest<AdminAuthResponse>("/admin/auth/refresh", {
        method: "POST",
        body: { refreshToken: storedRefreshToken }
      });

      updateAccessToken(data.accessToken);
      updateCsrfToken(data.csrfToken);
      updateUser(data.user);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
      }
    } catch {
      updateAccessToken(null);
      updateCsrfToken(null);
      updateUser(null);
      localStorage.removeItem(REFRESH_KEY);
    }
  }, [updateAccessToken, updateCsrfToken, updateUser]);

  useEffect(() => {
    if (accessToken) {
      setLoading(false);
      return;
    }

    refresh().finally(() => setLoading(false));
  }, [accessToken, refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<AdminAuthResponse>("/admin/auth/login", {
        method: "POST",
        body: { email, password }
      });
      updateAccessToken(data.accessToken);
      updateCsrfToken(data.csrfToken);
      updateUser(data.user);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
    },
    [updateAccessToken, updateCsrfToken, updateUser]
  );

  const register = useCallback(
    async (payload: AdminRegisterPayload) => {
      const data = await apiRequest<AdminAuthResponse>("/admin/auth/register", {
        method: "POST",
        body: payload
      });
      updateAccessToken(data.accessToken);
      updateCsrfToken(data.csrfToken);
      updateUser(data.user);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
    },
    [updateAccessToken, updateCsrfToken, updateUser]
  );

  const logout = useCallback(async () => {
    const token = localStorage.getItem(REFRESH_KEY);
    try {
      if (csrfToken) {
        await apiRequest("/admin/auth/logout", {
          method: "POST",
          csrfToken,
          body: token ? { refreshToken: token } : {}
        });
      }
    } catch {
      // Ignore API errors on local logout.
    } finally {
      updateAccessToken(null);
      updateCsrfToken(null);
      updateUser(null);
      localStorage.removeItem(REFRESH_KEY);
    }
  }, [csrfToken, updateAccessToken, updateCsrfToken, updateUser]);

  const isAuthenticated = !!accessToken;

  const value = useMemo(
    () => ({
      accessToken,
      csrfToken,
      user,
      loading,
      isAuthenticated,
      login,
      register,
      refresh,
      logout
    }),
    [accessToken, csrfToken, user, loading, isAuthenticated, login, register, refresh, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
};

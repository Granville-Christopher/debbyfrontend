import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

export type Role = "developer" | "business" | "creator";
export type BusinessSignupProfile = {
  fullName: string;
  businessName: string;
  country: string;
  phone: string;
  industry: string;
  teamSize: string;
  website?: string;
};

type User = {
  id: string;
  email: string;
  orgId: string;
  orgName: string;
};

type AuthContextValue = {
  accessToken: string | null;
  role: Role | null;
  csrfToken: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    role: Role,
    options?: { businessProfile?: BusinessSignupProfile }
  ) => Promise<void>;
  updateRole: (newRole: Role) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthResponse = {
  accessToken: string;
  role: Role;
  csrfToken: string;
  user: User;
  refreshToken: string;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Load initial state from localStorage
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("accessToken");
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<Role | null>(() => {
    try {
      const stored = localStorage.getItem("role");
      return stored ? (stored as Role) : null;
    } catch {
      return null;
    }
  });
  const [csrfToken, setCsrfToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("csrfToken");
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Helper to update accessToken and persist to localStorage
  const updateAccessToken = useCallback((token: string | null) => {
    setAccessToken(token);
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, []);

  // Helper to update role and persist to localStorage
  const updateRoleState = useCallback((newRole: Role | null) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("role", newRole);
    } else {
      localStorage.removeItem("role");
    }
  }, []);

  // Helper to update csrfToken and persist to localStorage
  const updateCsrfToken = useCallback((token: string | null) => {
    setCsrfToken(token);
    if (token) {
      localStorage.setItem("csrfToken", token);
    } else {
      localStorage.removeItem("csrfToken");
    }
  }, []);

  // Helper to update user and persist to localStorage
  const updateUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  // Test localStorage on mount
  useEffect(() => {
    console.log("Auth: Testing localStorage");
    try {
      localStorage.setItem("test", "test");
      const testValue = localStorage.getItem("test");
      console.log("Auth: localStorage test - set and retrieved:", testValue === "test");
      localStorage.removeItem("test");
    } catch (e) {
      console.error("Auth: localStorage not available:", e);
    }
  }, []);

  // Handle OAuth callback - read access_token from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get("access_token");
    const oauthStatus = urlParams.get("oauth");

    if (oauthToken && oauthStatus === "success") {
      console.log("Auth: OAuth callback detected, processing token");
      
      // Set the access token immediately
      updateAccessToken(oauthToken);
      
      // Clean up URL - remove the token params for security
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Call backend to get full user info and refresh token
      const completeOAuth = async () => {
        try {
          // Get CSRF token first
          const csrf = await apiRequest<{ csrfToken: string }>("/auth/csrf-token");
          updateCsrfToken(csrf.csrfToken);
          
          // Get user info using the access token
          const userInfo = await apiRequest<{ user: User; role: Role; refreshToken?: string }>(
            "/auth/me",
            { accessToken: oauthToken }
          );
          
          updateUser(userInfo.user);
          updateRoleState(userInfo.role);
          
          if (userInfo.refreshToken) {
            localStorage.setItem("refreshToken", userInfo.refreshToken);
            console.log("Auth: OAuth - stored refresh token");
          }
          
          console.log("Auth: OAuth complete, user authenticated as", userInfo.role);
          setLoading(false);
        } catch (err) {
          console.error("Auth: OAuth completion failed:", err);
          // Token might still be valid, try refresh
          refresh().finally(() => setLoading(false));
        }
      };
      
      completeOAuth();
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      console.log("Auth: Starting refresh process");

      // Get refresh token from localStorage (set during login)
      const storedToken = localStorage.getItem("refreshToken");
      console.log("Auth: localStorage refreshToken exists:", !!storedToken);
      if (storedToken) {
        console.log("Auth: Token length:", storedToken.length);
        console.log("Auth: Token starts with:", storedToken.substring(0, 10) + "...");
      }

      if (!storedToken) {
        console.log("Auth: No refresh token in localStorage, skipping refresh");
        return;
      }

      // First get CSRF token (no auth needed)
      const csrf = await apiRequest<{ csrfToken: string }>("/auth/csrf-token");
      setCsrfToken(csrf.csrfToken);
      console.log("Auth: Got CSRF token");

      console.log("Auth: Sending refresh request with token");
      const requestBody = { refreshToken: storedToken };
      console.log("Auth: Request body contains refreshToken:", !!requestBody.refreshToken);

      const data = await apiRequest<AuthResponse>(
        "/auth/refresh",
        {
          method: "POST",
          body: requestBody
        }
      );

      console.log("Auth: Refresh successful, updating state");
      updateAccessToken(data.accessToken);
      updateRoleState(data.role);
      updateCsrfToken(data.csrfToken);
      updateUser(data.user);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
        console.log("Auth: Stored new refresh token");
      }
    } catch (err) {
      console.error("Auth: Refresh failed:", err);
      // If refresh fails, user needs to login again
      updateAccessToken(null);
      updateRoleState(null);
      updateCsrfToken(null);
      updateUser(null);
      localStorage.removeItem("refreshToken");
    }
  }, [updateAccessToken, updateRoleState, updateCsrfToken, updateUser]);

  useEffect(() => {
    // Check if we're in an OAuth callback flow
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthCallback = urlParams.get("oauth") === "success" && urlParams.get("access_token");

    if (isOAuthCallback) {
      console.log("Auth: OAuth callback detected, skipping initial refresh");
      return;
    }

    // Only try to refresh if we don't already have an access token
    if (!accessToken) {
      console.log("Auth: No existing token, attempting refresh");
      refresh()
        .catch((err) => {
          console.error("Auth: Refresh failed but continuing:", err);
        })
        .finally(() => {
          console.log("Auth: Setting loading to false");
          setLoading(false);
        });
    } else {
      console.log("Auth: Already have access token, skipping refresh");
      setLoading(false);
    }
  }, []); // Remove refresh dependency to prevent re-runs

  const login = useCallback(async (email: string, password: string) => {
    console.log("Auth: Starting login");
    const data = await apiRequest<AuthResponse>(
      "/auth/login",
      { method: "POST", body: { email, password } }
    );
    console.log("Auth: Login response received");
    console.log("Auth: Response keys:", Object.keys(data));
    console.log("Auth: Has refreshToken:", !!data.refreshToken);
    if (data.refreshToken) {
      console.log("Auth: Refresh token length:", data.refreshToken.length);
    }

    updateAccessToken(data.accessToken);
    updateRoleState(data.role);
    updateCsrfToken(data.csrfToken);
    updateUser(data.user);

    if (data.refreshToken) {
      console.log("Auth: Storing refresh token in localStorage");
      localStorage.setItem("refreshToken", data.refreshToken);
      const stored = localStorage.getItem("refreshToken");
      console.log("Auth: Verification - stored successfully:", !!stored && stored === data.refreshToken);
    } else {
      console.log("Auth: No refresh token in response");
    }
  }, [updateAccessToken, updateRoleState, updateCsrfToken, updateUser]);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      selectedRole: Role,
      options?: { businessProfile?: BusinessSignupProfile }
    ) => {
    const data = await apiRequest<AuthResponse>(
      "/auth/signup",
      {
        method: "POST",
        body: {
          email,
          password,
          role: selectedRole,
          ...(options?.businessProfile ? { businessProfile: options.businessProfile } : {})
        }
      }
    );
    updateAccessToken(data.accessToken);
    updateRoleState(data.role);
    updateCsrfToken(data.csrfToken);
    updateUser(data.user);
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
      console.log("Auth: Stored refresh token in localStorage");
    }
    },
    [updateAccessToken, updateRoleState, updateCsrfToken, updateUser]
  );

  const updateRole = useCallback(async (newRole: Role) => {
    const data = await apiRequest<AuthResponse>(
      "/auth/role",
      { method: "PATCH", body: { role: newRole }, csrfToken }
    );
    updateAccessToken(data.accessToken);
    updateRoleState(data.role);
    updateCsrfToken(data.csrfToken);
    updateUser(data.user);
  }, [csrfToken, updateAccessToken, updateRoleState, updateCsrfToken, updateUser]);

  const logout = useCallback(async () => {
    try {
      // Always clear local state first
      updateAccessToken(null);
      updateRoleState(null);
      updateCsrfToken(null);
      updateUser(null);
      localStorage.removeItem("refreshToken");

      // Try to call logout endpoint if we have a CSRF token
      if (csrfToken) {
        await apiRequest("/auth/logout", { method: "POST", csrfToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the API call fails, we've already cleared local state
      // so the user will appear logged out on the frontend
    }
  }, [csrfToken, updateAccessToken, updateRoleState, updateCsrfToken, updateUser]);

  const isAuthenticated = !!accessToken;

  const value = useMemo(
    () => ({ accessToken, role, csrfToken, user, loading, isAuthenticated, login, signup, updateRole, logout, refresh }),
    [accessToken, role, csrfToken, user, loading, isAuthenticated, login, signup, updateRole, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

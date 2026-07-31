"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import {
  removeAccessToken,
  setAccessToken,
} from "@/lib/auth-storage";
import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
} from "@/types/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<User>>("/auth/me");
      setUser(response.data.data);

      return response.data.data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    async function initializeAuth() {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload
    );

    const { accessToken, user: loggedInUser } = response.data.data;

    setAccessToken(accessToken);
    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post("/auth/register", payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      removeAccessToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

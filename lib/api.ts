import axios, { InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "@/lib/auth-storage";
import type { ApiResponse } from "@/types/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    isRefreshing = true;

    refreshPromise = api
      .post<ApiResponse<{ accessToken: string }>>("/auth/refresh-token")
      .then((response) => {
        const token = response.data.data.accessToken;

        if (token) {
          setAccessToken(token);
          return token;
        }

        return null;
      })
      .catch(() => {
        removeAccessToken();
        return null;
      })
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === 401;
    const isRefreshRoute = originalRequest?.url?.includes("/auth/refresh-token");

    if (
      isUnauthorized &&
      !originalRequest?._retry &&
      !isRefreshRoute &&
      !isRefreshing
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

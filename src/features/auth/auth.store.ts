import { create } from "zustand";
import { User } from "./auth.types";
import { getCurrentUser, logout as logoutApi } from "./auth.api";
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  setStoredUser,
} from "@/services/storage";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  initializeAuth: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user }),
  initializeAuth: async () => {
    set({ isLoading: true, error: null });

    const token = getAccessToken();
    if (!token) {
      // Landing page / guest: jangan broadcast clear (biar 2 tab landing tidak loop reload)
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("userData");
        localStorage.removeItem("auth_snapshot");
      } catch {
        // ignore
      }
      set({ user: null, isLoading: false });
      return;
    }

    const cachedUser = getStoredUser();
    if (cachedUser) {
      set({ user: cachedUser });
    }

    try {
      const response = await getCurrentUser();
      setStoredUser(response.data);
      set({ user: response.data, isLoading: false, error: null });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to initialize session";

      // Invalid token -> clear dengan broadcast (sesi kadaluarsa / 401) biar tab lain ikut logout
      clearAuthSession();
      set({ error: errorMessage, isLoading: false, user: null });
    }
  },
  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCurrentUser();
      setStoredUser(response.data);
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch user";
      set({ error: errorMessage, isLoading: false, user: null });
      clearAuthSession();
    }
  },
  logout: () => {
    // Fire-and-forget revoke current jti; ignore errors (expired / already revoked)
    const token = getAccessToken();
    if (token) {
      void logoutApi().catch(() => {});
    }
    clearAuthSession();
    set({ user: null, error: null });
  },
}));

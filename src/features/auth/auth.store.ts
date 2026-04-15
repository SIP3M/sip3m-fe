import { create } from "zustand";
import { User } from "./auth.types";
import { getCurrentUser } from "./auth.api";
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
      clearAuthSession();
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
    clearAuthSession();
    set({ user: null, error: null });
  },
}));

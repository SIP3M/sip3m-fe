import { create } from "zustand";
import { User } from "./auth.types";
import { getCurrentUser } from "./auth.api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  fetchCurrentUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCurrentUser();
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch user";
      set({ error: errorMessage, isLoading: false, user: null });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
    }
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    set({ user: null, error: null });
  },
}));

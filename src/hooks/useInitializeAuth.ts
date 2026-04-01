import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";

/**
 * Hook untuk initialize authentication saat app start
 * - Fetch current user dari /auth/me jika token ada
 * - Sync state dari localStorage jika ada
 */
export const useInitializeAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userDataJson = localStorage.getItem("userData");

    if (token) {
      // Jika ada token, fetch data user terbaru dari server
      fetchCurrentUser();
    } else if (userDataJson) {
      // Fallback: jika hanya ada userData di localStorage tapi token hilang
      localStorage.removeItem("userData");
    }
  }, [fetchCurrentUser, setUser]);
};

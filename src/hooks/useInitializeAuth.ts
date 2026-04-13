import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { User } from "@/features/auth/auth.types";

/**
 * Hook untuk initialize authentication saat app start
 * - Fetch current user dari /auth/me jika token ada
 * - Sync state dari localStorage jika ada
 */
export const useInitializeAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = localStorage.getItem("accessToken");
    const userDataJson = localStorage.getItem("userData");

    if (token) {
      // Hydrate dari localStorage dulu untuk render cepat
      if (userDataJson) {
        try {
          const cachedUser = JSON.parse(userDataJson) as User;
          setUser(cachedUser);
        } catch {
          localStorage.removeItem("userData");
        }
      }

      // Fetch data user terbaru dari server (background refresh)
      void fetchCurrentUser();
    } else if (userDataJson) {
      // Fallback: jika hanya ada userData di localStorage tapi token hilang
      localStorage.removeItem("userData");
    }
  }, [fetchCurrentUser, setUser]);
};

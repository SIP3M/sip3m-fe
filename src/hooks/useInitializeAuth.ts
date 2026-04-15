import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/auth.store";

/**
 * Hook untuk initialize authentication saat app start
 * - Hydrate user/token dari storage
 * - Validasi token ke /auth/me
 */
export const useInitializeAuth = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    void initializeAuth();
  }, [initializeAuth]);
};

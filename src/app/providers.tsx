import { ReactNode, useEffect } from "react";
import { useInitializeAuth } from "@/hooks/useInitializeAuth";
import { getDeviceId } from "@/utils/device";

/**
 * App Providers Component
 * - Initialize authentication saat app start
 * - Wrap seluruh aplikasi dengan providers
 */
const Providers = ({ children }: { children: ReactNode }) => {
  // Initialize auth (fetch current user saat app start)
  useInitializeAuth();

  useEffect(() => {
    try {
      getDeviceId();
    } catch {
      // ignore
    }
  }, []);

  return <>{children}</>;
};

export default Providers;

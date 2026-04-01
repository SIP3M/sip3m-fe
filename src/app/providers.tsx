import { ReactNode } from "react";
import { useInitializeAuth } from "@/hooks/useInitializeAuth";

/**
 * App Providers Component
 * - Initialize authentication saat app start
 * - Wrap seluruh aplikasi dengan providers
 */
const Providers = ({ children }: { children: ReactNode }) => {
  // Initialize auth (fetch current user saat app start)
  useInitializeAuth();

  return <>{children}</>;
};

export default Providers;

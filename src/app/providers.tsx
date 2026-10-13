import { ReactNode, useEffect } from "react";
import { useInitializeAuth } from "@/hooks/useInitializeAuth";
import { getDeviceId } from "@/utils/device";
import { api } from "@/services/api";
import { getAccessToken } from "@/services/storage";

/**
 * Cross-tab sync untuk Single-Session per Browser (Opsi 2).
 * - StorageEvent: tab lain ganti token/user/device_id -> reload biar state ikut ganti (admin -> dosen)
 * - visibility/focus: tab balik aktif -> validasi sesi, biar 401 "Sesi digantikan" ketahuan walau idle
 * BE benar: beda user_id + device_id sama = 2 baris berbeda, tidak saling tendang. Revoke hanya user_id+device_id sama.
 */
function useCrossTabSync() {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      // StorageEvent hanya fire di tab LAIN, jadi reload aman (tidak loop di tab penulis)
      // FE pakai accessToken/userData (storage.ts), spec tulis 'token' -> handle keduanya + device_id
      if (
        e.key === "accessToken" ||
        e.key === "token" ||
        e.key === "userData" ||
        e.key === "device_id"
      ) {
        window.location.reload();
      }
    };
    window.addEventListener("storage", onStorage);

    const validateOnVisible = () => {
      if (document.visibilityState === "visible") {
        const token = getAccessToken();
        if (token) void api.get("/auth/me").catch(() => {});
        // 401 interceptor di services/api.ts akan handle redirect /login?reason=session_replaced
      }
    };
    const validateOnFocus = () => {
      const token = getAccessToken();
      if (token) void api.get("/auth/me").catch(() => {});
    };

    document.addEventListener("visibilitychange", validateOnVisible);
    window.addEventListener("focus", validateOnFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", validateOnVisible);
      window.removeEventListener("focus", validateOnFocus);
    };
  }, []);
}

/**
 * App Providers Component
 * - Initialize authentication saat app start
 * - Wrap seluruh aplikasi dengan providers
 */
const Providers = ({ children }: { children: ReactNode }) => {
  // Initialize auth (fetch current user saat app start)
  useInitializeAuth();
  useCrossTabSync();

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

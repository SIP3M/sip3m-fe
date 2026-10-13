import { ReactNode, useEffect } from "react";
import { useInitializeAuth } from "@/hooks/useInitializeAuth";
import { getDeviceId } from "@/utils/device";
import { api } from "@/services/api";
import {
  getAccessToken,
  AUTH_SYNC_KEY,
  AUTH_SNAPSHOT_KEY,
  applySyncedAuth,
  clearSyncedAuth,
} from "@/services/storage";
import type { User } from "@/features/auth/auth.types";

/**
 * Cross-tab sync untuk Single-Session per Browser (Opsi 2) — Opsi B.
 * Masalah: sessionStorage isolasi per-tab, StorageEvent hanya untuk localStorage.
 * Solusi: storage.ts tiap setAuthSession/clearAuthSession tulis:
 *   - BroadcastChannel('auth') postMessage (utama, jalan untuk sessionStorage)
 *   - localStorage auth_snapshot {token,user,rememberMe} + auth_sync timestamp (fallback)
 * Di sini: dengar keduanya, applySyncedAuth ke storage lokal, lalu reload.
 * BE benar: beda user_id + device_id sama = 2 baris berbeda, tidak saling tendang.
 */
function useCrossTabSync() {
  useEffect(() => {
    const tryApplySnapshotAndReload = (reason: string) => {
      try {
        const raw = localStorage.getItem(AUTH_SNAPSHOT_KEY);
        if (raw) {
          const snap = JSON.parse(raw) as {
            token: string;
            user: User;
            rememberMe: boolean;
          };
          if (snap?.token && snap?.user) {
            applySyncedAuth({
              token: snap.token,
              user: snap.user,
              rememberMe: !!snap.rememberMe,
            });
            window.location.reload();
            return;
          }
        }
        // snapshot kosong + sync trigger => logout (clearAuthSession hapus snapshot lalu set sync)
        if (reason === AUTH_SYNC_KEY) {
          clearSyncedAuth();
          window.location.reload();
          return;
        }
        // snapshot event dengan value langsung (fallback)
        if (reason === AUTH_SNAPSHOT_KEY && raw) {
          // already handled above
        }
      } catch {
        window.location.reload();
      }
    };

    // BroadcastChannel — jalan bahkan untuk sessionStorage
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("auth");
        bc.onmessage = (ev: MessageEvent) => {
          const d = ev.data as {
            type?: string;
            token?: string;
            user?: User;
            rememberMe?: boolean;
          };
          if (!d || typeof d !== "object") return;
          if (d.type === "auth_changed" && d.token && d.user) {
            try {
              applySyncedAuth({
                token: d.token,
                user: d.user,
                rememberMe: !!d.rememberMe,
              });
            } catch {
              // ignore
            }
            window.location.reload();
          } else if (d.type === "auth_cleared") {
            try {
              clearSyncedAuth();
            } catch {
              // ignore
            }
            window.location.reload();
          }
        };
      }
    } catch {
      // ignore
    }

    const onStorage = (e: StorageEvent) => {
      // Fallback localStorage sync — storage event hanya fire di tab LAIN
      if (e.key === AUTH_SYNC_KEY || e.key === AUTH_SNAPSHOT_KEY) {
        // e.newValue untuk snapshot event bisa langsung dipakai tanpa baca lagi
        if (e.key === AUTH_SNAPSHOT_KEY && e.newValue) {
          try {
            const snap = JSON.parse(e.newValue) as {
              token: string;
              user: User;
              rememberMe: boolean;
            };
            if (snap?.token && snap?.user) {
              applySyncedAuth({
                token: snap.token,
                user: snap.user,
                rememberMe: !!snap.rememberMe,
              });
              window.location.reload();
              return;
            }
          } catch {
            // fallback ke baca snapshot
          }
        }
        tryApplySnapshotAndReload(e.key || "");
        return;
      }
      // Legacy: kalau rememberMe=true token di localStorage, event ini yang fire
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
      try {
        bc?.close();
      } catch {
        // ignore
      }
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

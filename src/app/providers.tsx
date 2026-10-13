import { ReactNode, useEffect } from "react";
import { useInitializeAuth } from "@/hooks/useInitializeAuth";
import { getDeviceId } from "@/utils/device";
import { api } from "@/services/api";
import {
  getAccessToken,
  AUTH_SYNC_KEY,
  AUTH_SNAPSHOT_KEY,
  getTabId,
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
    const myTabId = getTabId();

    const isSameToken = (incoming?: string) => {
      if (!incoming) return false;
      const cur = getAccessToken();
      return !!cur && incoming === cur;
    };

    // Dedup + debounce: cegah ping-pong 2 event berurutan (snapshot + sync) jadi 2x reload
    let lastProcessedTs = 0;
    let reloadTimer: ReturnType<typeof setTimeout> | null = null;
    const PROCESSED_TS_KEY = "last_auth_sync_ts";
    const RELOAD_LOCK_KEY = "auth_reload_lock";
    const LOCK_MS = 1500;

    const isDuplicateTs = (ts?: number) => {
      if (!ts) return false;
      try {
        const stored = Number(sessionStorage.getItem(PROCESSED_TS_KEY) || "0");
        if (ts <= stored || ts <= lastProcessedTs) return true;
      } catch {
        if (ts <= lastProcessedTs) return true;
      }
      return false;
    };
    const markProcessed = (ts: number) => {
      lastProcessedTs = ts;
      try {
        sessionStorage.setItem(PROCESSED_TS_KEY, String(ts));
      } catch {
        // ignore
      }
    };
    const isReloadLocked = () => {
      try {
        const v = Number(sessionStorage.getItem(RELOAD_LOCK_KEY) || "0");
        return Date.now() - v < LOCK_MS;
      } catch {
        return false;
      }
    };
    const lockReload = () => {
      try {
        sessionStorage.setItem(RELOAD_LOCK_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    };
    const scheduleReload = () => {
      if (reloadTimer) return;
      if (isReloadLocked()) return;
      lockReload();
      reloadTimer = setTimeout(() => {
        window.location.reload();
      }, 60);
    };

    const tryApplySnapshotAndReload = (reason: string) => {
      try {
        const raw = localStorage.getItem(AUTH_SNAPSHOT_KEY);
        if (raw) {
          const snap = JSON.parse(raw) as {
            token: string;
            user: User;
            rememberMe: boolean;
            tabId?: string;
            ts?: number;
          };
          if (snap?.ts && isDuplicateTs(snap.ts)) return;
          // Self-broadcast guard: tab penulis sendiri (tabId sama) -> skip reload
          if (snap?.tabId && snap.tabId === myTabId) return;
          if (snap?.token && isSameToken(snap.token)) return;
          if (snap?.token && snap?.user) {
            if (snap.ts) markProcessed(snap.ts);
            applySyncedAuth({
              token: snap.token,
              user: snap.user,
              rememberMe: !!snap.rememberMe,
            });
            scheduleReload();
            return;
          }
        }
        // snapshot kosong + sync trigger => logout (clearAuthSession hapus snapshot lalu set sync)
        // Hanya clear jika tab lain yang logout (snapshot null tapi sync fire -> cek bukan self)
        // Guard: removeItem snapshot 5 detik kemudian ngirim storage null -> jangan reload
        if (reason === AUTH_SYNC_KEY) {
          // remove event (newValue null) sudah dicek di onStorage; di sini hanya handle writer
          // Kalau snapshot null dan sync fire: itu logout. Jangan loop kalau kita sudah logout/guest.
          if (!raw) {
            if (!getAccessToken()) return;
            clearSyncedAuth();
            // Jika sedang di /login jangan reload loop, biar tetap di login
            if (window.location.pathname.startsWith("/login")) return;
            if (isReloadLocked()) return;
            lockReload();
            scheduleReload();
            return;
          }
          return;
        }
        // snapshot event dengan value langsung (fallback)
        if (reason === AUTH_SNAPSHOT_KEY && raw) {
          // already handled above
        }
      } catch {
        if (window.location.pathname.startsWith("/login")) return;
        if (isReloadLocked()) return;
        scheduleReload();
      }
    };

    // BroadcastChannel — jalan bahkan untuk sessionStorage; guard self-tabId + same-token + dedup
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
            tabId?: string;
            ts?: number;
          };
          if (!d || typeof d !== "object") return;
          if (d.ts && isDuplicateTs(d.ts)) return;
          // Self guard: pengirim sama dengan tab ini -> abaikan (ini yang bikin login ke-reload sendiri)
          if (d.tabId && d.tabId === myTabId) return;
          if (d.token && isSameToken(d.token)) return;
          if (d.type === "auth_changed" && d.token && d.user) {
            if (d.ts) markProcessed(d.ts);
            try {
              applySyncedAuth({
                token: d.token,
                user: d.user,
                rememberMe: !!d.rememberMe,
              });
            } catch {
              // ignore
            }
            scheduleReload();
          } else if (d.type === "auth_cleared") {
            if (!getAccessToken()) return;
            if (d.ts) markProcessed(d.ts);
            try {
              clearSyncedAuth();
            } catch {
              // ignore
            }
            if (window.location.pathname.startsWith("/login")) return;
            if (isReloadLocked()) return;
            lockReload();
            scheduleReload();
          }
        };
      }
    } catch {
      // ignore
    }

    const onStorage = (e: StorageEvent) => {
      // storage removeItem -> newValue null: jangan reload (bersihkan snapshot 5 detik itu bukan logout)
      if (e.newValue === null && e.key === AUTH_SNAPSHOT_KEY) return;
      // Fallback localStorage sync — storage event hanya fire di tab LAIN (jadi safe, tapi tetap guard)
      if (e.key === AUTH_SYNC_KEY || e.key === AUTH_SNAPSHOT_KEY) {
        // Guard self-tabId via e.newValue jika ada
        if (e.key === AUTH_SNAPSHOT_KEY && e.newValue) {
          try {
            const snap = JSON.parse(e.newValue) as {
              token: string;
              user: User;
              rememberMe: boolean;
              tabId?: string;
              ts?: number;
            };
            if (snap?.ts && isDuplicateTs(snap.ts)) return;
            if (snap?.tabId && snap.tabId === myTabId) return;
            if (snap?.token && isSameToken(snap.token)) return;
            if (snap?.token && snap?.user) {
              if (snap.ts) markProcessed(snap.ts);
              applySyncedAuth({
                token: snap.token,
                user: snap.user,
                rememberMe: !!snap.rememberMe,
              });
              scheduleReload();
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
      if (reloadTimer) clearTimeout(reloadTimer);
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

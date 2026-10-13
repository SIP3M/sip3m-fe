import { User } from "@/features/auth/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_DATA_KEY = "userData";

type AuthPersistence = "local" | "session";

const parseUser = (value: string | null): User | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
};

export const getStoredUser = (): User | null => {
  const localUser = parseUser(localStorage.getItem(USER_DATA_KEY));
  if (localUser) return localUser;

  return parseUser(sessionStorage.getItem(USER_DATA_KEY));
};

export const AUTH_SYNC_KEY = "auth_sync";
export const AUTH_SNAPSHOT_KEY = "auth_snapshot";
const TAB_ID_KEY = "tab_id";

export const getTabId = (): string => {
  try {
    let id = sessionStorage.getItem(TAB_ID_KEY);
    if (!id) {
      try {
        id = crypto.randomUUID();
      } catch {
        id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      }
      sessionStorage.setItem(TAB_ID_KEY, id);
    }
    return id;
  } catch {
    return "unknown-tab";
  }
};

const notifyAuthBroadcast = (payload: unknown) => {
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("auth");
      bc.postMessage(payload);
      bc.close();
    }
  } catch {
    // ignore
  }
};

export const clearAuthSession = () => {
  // Idempotent: jangan broadcast kalau memang sudah kosong (landing page 2 tab kosongan -> loop reload)
  const hadSession =
    !!localStorage.getItem(ACCESS_TOKEN_KEY) ||
    !!sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
    !!localStorage.getItem(USER_DATA_KEY) ||
    !!sessionStorage.getItem(USER_DATA_KEY) ||
    !!localStorage.getItem(AUTH_SNAPSHOT_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
  try {
    localStorage.removeItem(AUTH_SNAPSHOT_KEY);
  } catch {
    // ignore
  }
  if (!hadSession) return;
  // Opsi B: trigger cross-tab via localStorage + BroadcastChannel (sessionStorage tidak fire storage event)
  const tid = getTabId();
  try {
    localStorage.setItem(AUTH_SYNC_KEY, String(Date.now()));
  } catch {
    // ignore
  }
  notifyAuthBroadcast({ type: "auth_cleared", ts: Date.now(), tabId: tid });
};

export const setAuthSession = (params: {
  token: string;
  user: User;
  rememberMe: boolean;
}) => {
  const targetStorage = params.rememberMe ? localStorage : sessionStorage;
  const otherStorage = params.rememberMe ? sessionStorage : localStorage;

  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(USER_DATA_KEY);

  targetStorage.setItem(ACCESS_TOKEN_KEY, params.token);
  targetStorage.setItem(USER_DATA_KEY, JSON.stringify(params.user));

  // Opsi B: sync lintas tab — sessionStorage isolasi per-tab, jadi broadcast + snapshot localStorage
  // snapshot pakai key terpisah agar tidak mengganggu getAccessToken (yang cek accessToken)
  const tid2 = getTabId();
  try {
    localStorage.setItem(
      AUTH_SNAPSHOT_KEY,
      JSON.stringify({
        token: params.token,
        user: params.user,
        rememberMe: params.rememberMe,
        ts: Date.now(),
        tabId: tid2,
      }),
    );
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(AUTH_SYNC_KEY, String(Date.now()));
  } catch {
    // ignore
  }
  notifyAuthBroadcast({
    type: "auth_changed",
    token: params.token,
    user: params.user,
    rememberMe: params.rememberMe,
    ts: Date.now(),
    tabId: tid2,
  });
  // bersihkan snapshot setelah lewat jendela sync (tidak untuk persist login)
  setTimeout(() => {
    try {
      localStorage.removeItem(AUTH_SNAPSHOT_KEY);
    } catch {
      // ignore
    }
  }, 5000);
};

/** Dipakai cross-tab receiver: tulis tanpa re-broadcast (hindari loop) */
export const applySyncedAuth = (params: {
  token: string;
  user: User;
  rememberMe: boolean;
}) => {
  const targetStorage = params.rememberMe ? localStorage : sessionStorage;
  const otherStorage = params.rememberMe ? sessionStorage : localStorage;
  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(USER_DATA_KEY);
  targetStorage.setItem(ACCESS_TOKEN_KEY, params.token);
  targetStorage.setItem(USER_DATA_KEY, JSON.stringify(params.user));
};

export const clearSyncedAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
};

export const setStoredUser = (user: User) => {
  if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    return;
  }

  if (sessionStorage.getItem(ACCESS_TOKEN_KEY)) {
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
};

export const getAuthPersistence = (): AuthPersistence | null => {
  if (localStorage.getItem(ACCESS_TOKEN_KEY)) return "local";
  if (sessionStorage.getItem(ACCESS_TOKEN_KEY)) return "session";
  return null;
};

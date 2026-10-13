import axios from "axios";
import { getAccessToken, clearAuthSession } from "./storage";
import { DEVICE_ID_HEADER, getDeviceId } from "@/utils/device";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://sip3m-be.vercel.app/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Menambahkan Token + X-Device-Id Otomatis ke setiap Request (Opsi 2 per-browser)
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
      try {
        const deviceId = getDeviceId();
        (config.headers as Record<string, string>)[DEVICE_ID_HEADER] = deviceId;
      } catch {
        // ignore
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status: number | undefined = error?.response?.status;
    const msg: string = error?.response?.data?.message || error?.message || "";
    if (status === 401 && msg.includes("Sesi di browser ini sudah digantikan")) {
      // Single-Session per Browser: token di browser ini sudah revoked karena login ulang di browser yang sama
      clearAuthSession();
      const current = window.location.pathname + window.location.search;
      // Avoid loop: only redirect if not already on /login
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?reason=session_replaced&from=${encodeURIComponent(current)}`;
      }
      return Promise.reject(error);
    }
    if (status === 401 && msg.includes("Authorization header is missing")) {
      // Let ProtectedRoute / initializeAuth handle; don't auto-redirect here
    }
    return Promise.reject(error);
  },
);

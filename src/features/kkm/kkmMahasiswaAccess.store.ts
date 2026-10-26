import { create } from "zustand";
import { getKkmPeriodActive } from "./kkmPeriod.api";
import { getPendaftaranMe } from "./kkmPendaftaran.api";
import { useAuthStore } from "@/features/auth/auth.store";

/**
 * Status akses KKM mahasiswa — berasal dari baris pendaftaran pada periode
 * aktif (GET /kkm/pendaftaran/me, khusus mahasiswa). NONE = belum mendaftar.
 * Menu KKM terbuka otomatis saat VERIFIED (verifikasi admin LPPM).
 */
export type MahasiswaKkmAccessStatus =
  | "NONE"
  | "DRAFT"
  | "PENDING"
  | "REJECTED"
  | "VERIFIED";

interface MahasiswaAccessState {
  hasAccess: boolean;
  status: MahasiswaKkmAccessStatus;
  isLoading: boolean;
  checked: boolean;
  setHasAccess: (access: boolean) => void;
  setStatus: (status: MahasiswaKkmAccessStatus) => void;
  checkAccess: () => Promise<void>;
}

/** Paint awal dari cache lokal (sementara checkAccess berjalan). */
const getInitialAccess = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem("kkm_mahasiswa_has_access");
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // fallback
  }
  // Default false: akses modul KKM baru terbuka setelah terverifikasi.
  return false;
};

export const useKkmMahasiswaAccessStore = create<MahasiswaAccessState>((set) => ({
  hasAccess: getInitialAccess(),
  status: getInitialAccess() ? "VERIFIED" : "NONE",
  isLoading: false,
  checked: false,

  setHasAccess: (hasAccess) => {
    try {
      localStorage.setItem("kkm_mahasiswa_has_access", String(hasAccess));
    } catch {
      // ignore
    }
    set({ hasAccess, status: hasAccess ? "VERIFIED" : "NONE" });
  },

  setStatus: (status) => {
    const hasAccess = status === "VERIFIED";
    try {
      localStorage.setItem("kkm_mahasiswa_has_access", String(hasAccess));
    } catch {
      // ignore
    }
    set({ status, hasAccess });
  },

  checkAccess: async () => {
    set({ isLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ hasAccess: false, status: "NONE", isLoading: false, checked: true });
        return;
      }

      // 1) Periode aktif — pendaftaran hanya relevan pada periode ini.
      const activePeriod = await getKkmPeriodActive().catch(() => null);
      if (!activePeriod?.data?.id) {
        try {
          localStorage.setItem("kkm_mahasiswa_has_access", "false");
        } catch {
          // ignore
        }
        set({ hasAccess: false, status: "NONE", isLoading: false, checked: true });
        return;
      }

      // 2) Pendaftaran saya di periode aktif (endpoint khusus mahasiswa).
      const rows = await getPendaftaranMe(activePeriod.data.id).catch(() => null);
      const mine = rows?.[0] ?? null;
      const status: MahasiswaKkmAccessStatus = mine?.status ?? "NONE";
      const hasAccess = status === "VERIFIED";

      try {
        localStorage.setItem("kkm_mahasiswa_has_access", String(hasAccess));
      } catch {
        // ignore
      }
      set({ hasAccess, status, isLoading: false, checked: true });
    } catch {
      set({ hasAccess: false, status: "NONE", isLoading: false, checked: true });
    }
  },
}));

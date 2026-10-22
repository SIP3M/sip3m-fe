import { create } from "zustand";
import { getKkmPeserta } from "./kkmPeserta.api";
import { getKkmPeriodActive } from "./kkmPeriod.api";
import { useAuthStore } from "@/features/auth/auth.store";

export type MahasiswaKkmAccessStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface MahasiswaAccessState {
  hasAccess: boolean;
  status: MahasiswaKkmAccessStatus;
  isLoading: boolean;
  checked: boolean;
  setHasAccess: (access: boolean) => void;
  setStatus: (status: MahasiswaKkmAccessStatus) => void;
  checkAccess: () => Promise<void>;
}

const getInitialAccess = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    if (access === "verified") return true;
    if (access === "pending") return false;

    const stored = localStorage.getItem("kkm_mahasiswa_has_access");
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // fallback
  }
  // Default is false: student has NOT yet received access from Admin LPPM -> Peserta KKM
  return false;
};

export const useKkmMahasiswaAccessStore = create<MahasiswaAccessState>((set) => ({
  hasAccess: getInitialAccess(),
  status: getInitialAccess() ? "VERIFIED" : "PENDING",
  isLoading: false,
  checked: false,

  setHasAccess: (hasAccess) => {
    try {
      localStorage.setItem("kkm_mahasiswa_has_access", String(hasAccess));
    } catch {
      // ignore
    }
    set({ hasAccess, status: hasAccess ? "VERIFIED" : "PENDING" });
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
    // If URL param explicitly specifies ?access=verified or ?access=pending, respect it
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const access = params.get("access");
      if (access === "verified") {
        set({ hasAccess: true, status: "VERIFIED", isLoading: false, checked: true });
        return;
      }
      if (access === "pending") {
        set({ hasAccess: false, status: "PENDING", isLoading: false, checked: true });
        return;
      }
    }

    set({ isLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ hasAccess: false, status: "PENDING", isLoading: false, checked: true });
        return;
      }

      const activePeriod = await getKkmPeriodActive().catch(() => null);
      if (activePeriod?.data?.id) {
        const res = await getKkmPeserta({
          periode_id: activePeriod.data.id,
          search: user.username || user.email,
        }).catch(() => null);

        const myPeserta = res?.data?.find(
          (p) =>
            p.user_id === user.id ||
            p.nim === user.username ||
            p.email === user.email,
        );

        if (myPeserta) {
          const isVerif = myPeserta.status === "VERIFIED";
          try {
            localStorage.setItem("kkm_mahasiswa_has_access", String(isVerif));
          } catch {
            // ignore
          }
          set({
            hasAccess: isVerif,
            status: myPeserta.status,
            isLoading: false,
            checked: true,
          });
          return;
        }
      }

      set({ hasAccess: false, status: "PENDING", isLoading: false, checked: true });
    } catch {
      set({ hasAccess: false, status: "PENDING", isLoading: false, checked: true });
    }
  },
}));

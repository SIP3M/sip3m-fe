import { create } from "zustand";
import { getKkmDplMe } from "./kkmDpl.api";

export const DPL_DENIED_NOTICE =
  "Anda belum ditugaskan sebagai DPL KKM. Hubungi admin LPPM untuk penugasan.";

interface KkmDplState {
  /**
   * null = status masih diketahui (loading / request gagal).
   * Saat null, akses modul KKM TIDAK diblokir (fail-open) agar dosen DPL
   * tidak terkunci karena gangguan jaringan.
   */
  isDplAktif: boolean | null;
  /** Pesan notifikasi global untuk toast di DosenLayout. */
  notice: string | null;
  fetchDplStatus: () => Promise<void>;
  setNotice: (notice: string | null) => void;
  reset: () => void;
}

export const useKkmDplStore = create<KkmDplState>((set) => ({
  isDplAktif: null,
  notice: null,
  fetchDplStatus: async () => {
    try {
      const res = await getKkmDplMe();
      set({ isDplAktif: Boolean(res.data?.is_dpl_aktif) });
    } catch (error) {
      // Jangan blokir akses hanya karena gagal cek status.
      console.error("[KKM_DPL_STATUS_ERROR]", error);
    }
  },
  setNotice: (notice) => set({ notice }),
  reset: () => set({ isDplAktif: null, notice: null }),
}));

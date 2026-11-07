import { create } from "zustand";
import { getKelompokSaya } from "./kkmKelompok.api";
import type { KkmJabatanKelompok } from "./kkmKelompok.types";
import { useAuthStore } from "@/features/auth/auth.store";

/**
 * Jabatan mahasiswa pada kelompok KKM (GET /kkm/kelompok/me).
 * Menentukan apakah menu "Logbook Kelompok" & "Laporan Kelompok" terbuka —
 * hanya KETUA & SEKRETARIS; anggota biasa tetap bisa membuka menu (diklik),
 * tetapi mendapat feedback "hanya bisa diakses ketua dan sekretaris".
 */
interface KkmJabatanState {
  jabatan: KkmJabatanKelompok;
  label: string;
  /** true bila boleh mengunggah logbook & laporan kelompok */
  bolehUnggah: boolean;
  /** true bila keanggotaan sudah pernah dicek (untuk hindari fetch ganda) */
  checked: boolean;
  isLoading: boolean;
  load: () => Promise<void>;
}

export const useKkmJabatanStore = create<KkmJabatanState>((set, get) => ({
  jabatan: "ANGGOTA",
  label: "Anggota",
  bolehUnggah: false,
  checked: false,
  isLoading: false,

  load: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        set({
          jabatan: "ANGGOTA",
          label: "Anggota",
          bolehUnggah: false,
          checked: true,
          isLoading: false,
        });
        return;
      }

      const res = await getKelompokSaya();
      const jabatan = res.data.jabatan_saya ?? "ANGGOTA";
      set({
        jabatan,
        label:
          res.data.jabatan_saya_label ??
          (jabatan === "KETUA"
            ? "Ketua"
            : jabatan === "SEKRETARIS"
              ? "Sekretaris"
              : "Anggota"),
        bolehUnggah:
          res.data.boleh_unggah_kelompok ?? (jabatan === "KETUA" || jabatan === "SEKRETARIS"),
        checked: true,
        isLoading: false,
      });
    } catch {
      // 404 (belum punya kelompok) atau error jaringan → perlakukan sebagai anggota.
      set({
        jabatan: "ANGGOTA",
        label: "Anggota",
        bolehUnggah: false,
        checked: true,
        isLoading: false,
      });
    }
  },
}));

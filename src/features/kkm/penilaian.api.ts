import { api } from "@/services/api";
import type {
  PenilaianBimbinganResponse,
  PenilaianMahasiswaResponse,
  PesertaPenilaianItem,
} from "./penilaian.types";

/** Ambil daftar mahasiswa bimbingan DPL beserta nilai KKM */
export async function getPenilaianBimbingan(): Promise<PenilaianBimbinganResponse> {
  const res = await api.get<{ data: PenilaianBimbinganResponse }>("/kkm/dpl/penilaian");
  return res.data.data;
}

/** Simpan nilai satu peserta oleh DPL */
export async function upsertPenilaianPeserta(payload: {
  peserta_id: number;
  kehadiran: number;
  keaktifan: number;
  logbook: number;
  program_kerja: number;
  laporan: number;
  sikap: number;
  catatan_dpl?: string | null;
}): Promise<any> {
  const res = await api.post("/kkm/dpl/penilaian", payload);
  return res.data;
}

/** Simpan banyak nilai sekaligus (Simpan Semua Nilai) */
export async function bulkUpsertPenilaian(
  penilaianList: Array<{
    peserta_id: number;
    kehadiran: number;
    keaktifan: number;
    logbook: number;
    program_kerja: number;
    laporan: number;
    sikap: number;
    catatan_dpl?: string | null;
  }>,
): Promise<any> {
  const res = await api.post("/kkm/dpl/penilaian/bulk", {
    penilaian_list: penilaianList,
  });
  return res.data;
}

/** Ambil rekap nilai dan evaluasi KKM untuk mahasiswa yang sedang login */
export async function getPenilaianMahasiswaSaya(): Promise<PenilaianMahasiswaResponse> {
  const res = await api.get<{ data: PenilaianMahasiswaResponse }>(
    "/kkm/mahasiswa/penilaian",
  );
  return res.data.data;
}

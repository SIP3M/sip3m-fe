// Laporan KKM (individu & kelompok) — type mengikuti response BE (tag "KKM Laporan")

import type { KkmJabatanKelompok } from "./kkmKelompok.types";

/** Jendela buka/tutup unggahan (dihitung BE). */
export interface KkmLaporanJendela {
  terbuka: boolean;
  /** Alasan bila tertutup (null saat terbuka) */
  alasan: string | null;
  dibuka_pada: string | null;
  ditutup_pada: string | null;
  /** "Senin, 12 Januari 2026 23:59" */
  deadline_tampil: string | null;
  /** true bila admin LPPM belum mengatur batas waktu */
  tanpa_batas?: boolean;
}

export interface KkmLaporanBerkas {
  nama: string;
  url: string;
  ukuran: number | null;
  mime: string | null;
  diunggah_pada: string;
  diunggah_oleh: string;
  terkunci: boolean;
  /** Hanya untuk laporan kelompok */
  id?: number;
  judul?: string;
}

// ─── LAPORAN INDIVIDU ─────────────────────────────────────────────────────────

/** GET /kkm/laporan/individu/me */
export interface GetLaporanIndividuResponse {
  message: string;
  data: {
    peserta: { id: number; nama: string; nim: string | null };
    periode: { id: number; nama_periode: string; tahun_akademik: string; status: string };
    jendela: KkmLaporanJendela;
    bisa_unggah: boolean;
    laporan: KkmLaporanBerkas | null;
  };
}

/** POST /kkm/laporan/individu — multipart (file PDF) */
export interface UploadLaporanIndividuResponse {
  message: string;
  data: {
    id: number;
    nama: string;
    url: string;
    ukuran: number | null;
    diunggah_pada: string;
    deadline_tampil: string | null;
  };
}

// ─── LAPORAN KELOMPOK ─────────────────────────────────────────────────────────

/** GET /kkm/laporan/kelompok/me */
export interface GetLaporanKelompokResponse {
  message: string;
  data: {
    kelompok: { id: number; nama: string };
    periode: { id: number; nama_periode: string; tahun_akademik: string; status: string };
    jabatan: KkmJabatanKelompok;
    jabatan_label: string;
    boleh_unggah: boolean;
    alasan_tidak_boleh_unggah: string | null;
    jendela: KkmLaporanJendela;
    bisa_unggah: boolean;
    ketua: { nama: string; nim: string | null }[];
    sekretaris: { nama: string; nim: string | null }[];
    laporan: KkmLaporanBerkas | null;
  };
}

/** POST /kkm/kelompok/:id/laporan — multipart (file PDF) */
export interface UploadLaporanKelompokResponse {
  message: string;
  data: {
    id: number;
    judul: string;
    nama: string;
    url: string;
    ukuran: number | null;
    diunggah_pada: string;
    deadline_tampil: string | null;
  };
}

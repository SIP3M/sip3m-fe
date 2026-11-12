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

/** Jenis laporan kelompok (3 jenis masuk alur review). */
export type JenisLaporan = "LAPORAN_AWAL" | "LAPORAN_MINGGUAN" | "LAPORAN_AKHIR";

/** Status turunan per baris (kelompok × jenis) — dihitung BE. */
export type StatusLaporan =
  | "BELUM_UPLOAD"
  | "MENUNGGU_REVIEW"
  | "DISETUJUI"
  | "REVISI"
  | "TERLAMBAT";

/** Satu entri per jenis laporan pada halaman mahasiswa. */
export interface KkmLaporanKelompokItem {
  jenis: JenisLaporan;
  label: string;
  jendela: KkmLaporanJendela;
  bisa_unggah: boolean;
  status: StatusLaporan;
  status_label: string;
  catatan_revisi: string | null;
  reviewed_at: string | null;
  laporan: KkmLaporanBerkas | null;
}

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
    /** Semua jenis laporan (Awal/Mingguan/Akhir) + status review masing-masing */
    daftar: KkmLaporanKelompokItem[];
    /** Kompatibel lama — menunjuk jenis LAPORAN_AKHIR */
    jendela: KkmLaporanJendela;
    bisa_unggah: boolean;
    ketua: { nama: string; nim: string | null }[];
    sekretaris: { nama: string; nim: string | null }[];
    laporan: KkmLaporanBerkas | null;
  };
}

/** POST /kkm/kelompok/:id/laporan — multipart (file PDF + field jenis) */
export interface UploadLaporanKelompokResponse {
  message: string;
  data: {
    id: number;
    jenis: JenisLaporan;
    status_review: "MENUNGGU_REVIEW" | "DISETUJUI" | "REVISI";
    judul: string;
    nama: string;
    url: string;
    ukuran: number | null;
    diunggah_pada: string;
    deadline_tampil: string | null;
  };
}

// ─── ADMIN / DPL — DAFTAR & REVIEW LAPORAN ────────────────────────────────────

/** Satu baris = satu kelompok × satu jenis laporan. */
export interface KkmLaporanRow {
  /** `${kelompok_id}:${jenis}` — key unik baris (bukan id DB) */
  id: string;
  kelompok_id: number;
  kelompok: string;
  desa: string;
  kecamatan: string;
  dpl: { id: number | null; nama: string | null };
  jenis: JenisLaporan;
  jenis_label: string;
  status: StatusLaporan;
  status_label: string;
  upload_date: string | null;
  deadline: string | null;
  deadline_tampil: string | null;
  deadline_note: { text: string; type: "warning" | "danger" } | null;
  file: {
    nama: string;
    url: string;
    ukuran: number | null;
    diunggah_pada: string;
    diunggah_oleh: string;
  } | null;
  catatan_revisi: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface KkmLaporanStats {
  BELUM_UPLOAD: number;
  MENUNGGU_REVIEW: number;
  DISETUJUI: number;
  REVISI: number;
  TERLAMBAT: number;
  total: number;
}

export interface KkmLaporanMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

/** GET /kkm/laporan — query semua opsional (lihat KkmLaporanParams). */
export interface GetLaporanListResponse {
  message: string;
  data: {
    periode: {
      id: number;
      nama_periode: string;
      tahun_akademik: string;
      status: string;
    } | null;
    periode_options: { id: number; nama_periode: string; status: string }[];
    data: KkmLaporanRow[];
    meta: KkmLaporanMeta;
    stats: KkmLaporanStats;
    progress_desa: { desa: string; total: number; terupload: number; persentase: number }[];
    filters: { desa: string[]; dpl: { id: number; nama: string }[] };
  };
}

export interface KkmLaporanParams {
  periode_id?: number;
  page?: number;
  search?: string;
  status?: StatusLaporan;
  jenis?: JenisLaporan;
  desa?: string;
  dpl_id?: number;
}

/** GET /kkm/laporan/detail?kelompok_id=&jenis= */
export interface GetLaporanDetailResponse {
  message: string;
  data: KkmLaporanRow;
}

/** PATCH /kkm/laporan/review — status: DISETUJUI / REVISI (catatan wajib saat REVISI) */
export interface ReviewLaporanPayload {
  kelompok_id: number;
  jenis: JenisLaporan;
  status: "DISETUJUI" | "REVISI";
  catatan?: string;
}

export interface ReviewLaporanResponse {
  message: string;
  data: {
    kelompok_id: number;
    jenis: JenisLaporan;
    status: StatusLaporan;
    status_label: string;
    catatan_revisi: string | null;
    reviewed_at: string | null;
  };
}

/** POST /kkm/laporan/bulk-approve — maks 200 baris per aksi */
export interface BulkApprovePayload {
  items: { kelompok_id: number; jenis: JenisLaporan }[];
}

export interface BulkApproveResponse {
  message: string;
  data: { disetujui: number; dilewati: number };
}

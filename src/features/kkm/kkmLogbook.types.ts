// Module Logbook KKM (mahasiswa) — type mengikuti response BE (Swagger tag "KKM Monitoring")

export type KkmLogbookStatus = "PENDING" | "APPROVED" | "REVISI";

export interface KkmLogbookEntry {
  id: number;
  /** ISO date (YYYY-MM-DDTHH:mm:ss.sssZ) */
  tanggal: string;
  judul: string;
  deskripsi: string;
  lokasi_kegiatan: string | null;
  status: KkmLogbookStatus;
  /** URL publik file logbook PDF (null bila tanpa lampiran) */
  file_url: string | null;
  file_size: number | null;
  catatan_revisi: string | null;
  created_at: string;
}

/** GET /kkm/logbook/me */
export interface GetLogbookSayaResponse {
  message: string;
  data: {
    kelompok: {
      id: number;
      nama: string;
      periode: { id: number; nama_periode: string; status: string };
    };
    /** Entri milik sendiri, terbaru dulu */
    entries: KkmLogbookEntry[];
  };
}

/** POST /kkm/kelompok/:id/logbook — multipart (file PDF opsional) */
export interface CreateLogbookResponse {
  message: string;
  data: {
    id: number;
    tanggal: string;
    judul: string;
    created_at: string;
    file_url: string | null;
    file_size: number | null;
  };
}

// ─── Validasi logbook (DPL / admin LPPM) ─────────────────────────────────────

/** Baris daftar validasi — GET /kkm/logbook/validasi */
export interface KkmLogbookValidasiRow {
  id: number;
  kelompok_id: number;
  kelompok: { nama: string; desa: string };
  mahasiswa: { id: number; nama: string; nim: string | null };
  tanggal: string;
  judul: string;
  deskripsi: string;
  status: KkmLogbookStatus;
  catatan_revisi: string | null;
  file_url: string | null;
  file_size: number | null;
  created_at: string;
}

/** GET /kkm/logbook/validasi */
export interface GetLogbookValidasiResponse {
  message: string;
  data: KkmLogbookValidasiRow[];
  /** Dihitung dari seluruh cakupan (tanpa filter status/search) */
  stats: { menunggu: number; approved: number; revisi: number };
  meta: { totalData: number; totalPages: number; currentPage: number; limit: number };
}

/** GET /kkm/logbook/validasi/:entryId */
export interface GetLogbookValidasiDetailResponse {
  message: string;
  data: {
    id: number;
    kelompok_id: number;
    kelompok: {
      nama: string;
      lokasi: { desa: string; kecamatan: string; kabupaten: string };
    };
    mahasiswa: { id: number; nama: string; nim: string | null };
    tanggal: string;
    judul: string;
    deskripsi: string;
    lokasi_kegiatan: string | null;
    status: KkmLogbookStatus;
    catatan_revisi: string | null;
    file_url: string | null;
    file_size: number | null;
    reviewer: { id: number; nama: string } | null;
    reviewed_at: string | null;
    created_at: string;
  };
}

/** PATCH /kkm/kelompok/:id/logbook/:entryId/review */
export interface ReviewLogbookResponse {
  message: string;
  data: {
    id: number;
    status: KkmLogbookStatus;
    catatan_revisi: string | null;
    reviewed_at: string | null;
  };
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export const KKM_LOGBOOK_STATUS_LABEL: Record<KkmLogbookStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REVISI: "Revisi",
};

/** Format byte → "1,2 MB" (atau "-" bila null). */
export const formatLogbookFileSize = (bytes: number | null): string => {
  if (!bytes || bytes <= 0) return "-";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

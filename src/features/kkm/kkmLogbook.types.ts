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

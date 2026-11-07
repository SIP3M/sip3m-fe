// Logbook Kelompok KKM (mahasiswa) — type mengikuti response BE
// (tag "KKM Logbook Kelompok").

export type KkmLogbookKelompokStatusMinggu = "BELUM_DIBUKA" | "TERBUKA" | "TERKUNCI";

export type KkmJabatanKelompok = "ANGGOTA" | "KETUA" | "SEKRETARIS";

/** Berkas PDF yang terunggah pada satu minggu. */
export interface KkmLogbookKelompokBerkas {
  nama: string;
  url: string;
  ukuran: number | null;
  mime: string | null;
  diunggah_pada: string;
  diunggah_oleh: string;
}

/** Satu baris minggu (1 = minggu pertama pelaksanaan). */
export interface KkmLogbookKelompokMinggu {
  minggu_ke: number;
  /** YYYY-MM-DD */
  tanggal_mulai: string;
  /** YYYY-MM-DD — akhir jendela minggu ini */
  tanggal_batas: string;
  deadline: string;
  /** "Senin, 12 Januari 2026 23:59" */
  deadline_tampil: string;
  status: KkmLogbookKelompokStatusMinggu;
  sudah_unggah: boolean;
  berkas: KkmLogbookKelompokBerkas | null;
  bisa_unggah: boolean;
}

/** GET /kkm/logbook-kelompok/me */
export interface GetLogbookKelompokSayaResponse {
  message: string;
  data: {
    kelompok: { id: number; nama: string };
    periode: { id: number; nama_periode: string; tahun_akademik: string; status: string };
    jabatan: KkmJabatanKelompok;
    jabatan_label: string;
    boleh_unggah: boolean;
    alasan_tidak_boleh_unggah: string | null;
    pengaturan: {
      teratur: boolean;
      hari: number | null;
      nama_hari: string | null;
      jam: string;
      tampilan: string;
      pelaksanaan: string | null;
      penarikan: string | null;
    };
    minggu_total: number;
    minggu: KkmLogbookKelompokMinggu[];
    stats: {
      total_minggu: number;
      sudah_unggah: number;
      belum_unggah: number;
      minggu_terbuka: number;
    };
  };
}

/** POST /kkm/kelompok/:id/logbook-kelompok — multipart (minggu_ke + file PDF) */
export interface UploadLogbookKelompokResponse {
  message: string;
  data: {
    id: number;
    minggu_ke: number;
    nama: string;
    url: string;
    ukuran: number | null;
    diunggah_pada: string;
    deadline_tampil: string;
  };
}

export const KKM_LOGBOOK_KELOMPOK_STATUS_LABEL: Record<
  KkmLogbookKelompokStatusMinggu,
  string
> = {
  BELUM_DIBUKA: "Belum Dibuka",
  TERBUKA: "Terbuka",
  TERKUNCI: "Terkunci",
};

/** Format byte → "1,2 MB" (atau "-" bila null). */
export const formatBerkasSize = (bytes: number | null): string => {
  if (!bytes || bytes <= 0) return "-";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

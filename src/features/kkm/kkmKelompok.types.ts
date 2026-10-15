// Module Kelompok KKM — type mengikuti response BE (Swagger tag "KKM Kelompok")
// Status & komposisi dihitung BE (derived) — FE hanya merender nilai dari BE.

export type KkmKelompokStatus = "AKTIF" | "BELUM_LENGKAP" | "BERMASALAH";
export type KkmKelompokKomposisi = "SEIMBANG" | "DOMINASI" | "PERLU_PENYESUAIAN";
export type KkmKelompokVerifikasiStatus = "VERIFIED" | "PENDING" | "REJECTED";
export type KkmKelompokDokumenType =
  | "PROPOSAL_PROGRAM_KERJA"
  | "LOGBOOK_KELOMPOK"
  | "LAPORAN_AKHIR";

export interface KkmKelompokGender {
  laki: number;
  perempuan: number;
  unknown: number;
}

export interface KkmKelompokProdiItem {
  nama: string;
  jumlah: number;
}

// ─── List (GET /kkm/kelompok) ────────────────────────────────────────────────
export interface KkmKelompokListItem {
  id: number;
  nama: string;
  dpl_id: number | null;
  dpl_name: string | null;
  lokasi: {
    desa: string;
    kecamatan: string;
    kabupaten: string;
    kuota: number;
  };
  jumlah_anggota: number;
  terverifikasi: number;
  pending: number;
  rejected: number;
  gender: KkmKelompokGender;
  prodi: KkmKelompokProdiItem[];
  status: KkmKelompokStatus;
  komposisi: KkmKelompokKomposisi;
  persentase_terisi: number;
}

export interface KkmKelompokListMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetKkmKelompokListResponse {
  message: string;
  data: KkmKelompokListItem[];
  meta: KkmKelompokListMeta;
}

export interface KkmKelompokListParams {
  periode_id: number;
  page?: number;
  search?: string;
  status?: KkmKelompokStatus | "";
  komposisi?: KkmKelompokKomposisi | "";
  desa?: string;
  dpl_id?: number | "";
}

// ─── Stats (GET /kkm/kelompok/stats) ─────────────────────────────────────────
export interface KkmKelompokStats {
  periode: {
    id: number;
    nama_periode: string;
    tahun_akademik: string;
  };
  total_kelompok: number;
  aktif: number;
  belum_lengkap: number;
  bermasalah: number;
  total_mahasiswa: number;
}

export interface GetKkmKelompokStatsResponse {
  message: string;
  data: KkmKelompokStats;
}

// ─── Detail (GET /kkm/kelompok/:id) ──────────────────────────────────────────
export interface KkmKelompokProgressStage {
  key: string;
  label: string;
  date: string | null;
  done: boolean;
}

export interface KkmKelompokProgress {
  stages: KkmKelompokProgressStage[];
  tahap_saat_ini: string;
}

export interface KkmKelompokAnggota {
  peserta_id: number;
  user_id: number;
  nim: string;
  nama: string;
  email: string | null;
  semester: number | null;
  nomor_hp: string | null;
  jenis_kelamin: string | null;
  fakultas: string | null;
  prodi: string | null;
  status: KkmKelompokVerifikasiStatus;
}

export interface KkmKelompokDokumen {
  id: number;
  document_type: KkmKelompokDokumenType;
  title: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string | null;
  url: string;
}

export interface KkmKelompokDetail {
  id: number;
  nama: string;
  status: KkmKelompokStatus;
  komposisi: KkmKelompokKomposisi;
  persentase_terisi: number;
  jumlah_anggota: number;
  kuota: number;
  verifikasi: {
    verified: number;
    pending: number;
    rejected: number;
  };
  periode: {
    id: number;
    nama_periode: string;
    tahun_akademik: string;
    jenis: string;
    status: string;
  };
  progress: KkmKelompokProgress;
  lokasi: {
    id: number;
    desa: string;
    kecamatan: string;
    kabupaten: string;
    kuota: number;
  };
  dpl: {
    id: number;
    name: string;
    email: string | null;
    nidn_nip: string | null;
  } | null;
  gender: KkmKelompokGender;
  prodi: KkmKelompokProdiItem[];
  anggota: KkmKelompokAnggota[];
  dokumen: KkmKelompokDokumen[];
}

export interface GetKkmKelompokDetailResponse {
  message: string;
  data: KkmKelompokDetail;
}

// ─── Mutations ───────────────────────────────────────────────────────────────
/** PATCH /kkm/kelompok/:id — null = cabut DPL */
export interface UpdateKkmKelompokPayload {
  dpl_id: number | null;
}

/** POST /kkm/kelompok/:id/anggota */
export interface AddKkmKelompokAnggotaPayload {
  peserta_ids: number[];
}

export interface KkmKelompokMessageResponse {
  message: string;
  data?: { count?: number; id?: number; dpl_id?: number | null } | null;
}

export interface UploadKkmKelompokDokumenResponse {
  message: string;
  data?: {
    id: number;
    document_type: KkmKelompokDokumenType;
    title: string;
  };
}

// ─── UI helpers ──────────────────────────────────────────────────────────────
export const KKM_KELOMPOK_STATUS_OPTIONS: KkmKelompokStatus[] = [
  "AKTIF",
  "BELUM_LENGKAP",
  "BERMASALAH",
];

export const KKM_KELOMPOK_KOMPOSISI_OPTIONS: KkmKelompokKomposisi[] = [
  "SEIMBANG",
  "DOMINASI",
  "PERLU_PENYESUAIAN",
];

export const KKM_KELOMPOK_DOKUMEN_SLOTS: KkmKelompokDokumenType[] = [
  "PROPOSAL_PROGRAM_KERJA",
  "LOGBOOK_KELOMPOK",
  "LAPORAN_AKHIR",
];

export const KKM_KELOMPOK_DOKUMEN_LABEL: Record<KkmKelompokDokumenType, string> = {
  PROPOSAL_PROGRAM_KERJA: "Proposal Program Kerja",
  LOGBOOK_KELOMPOK: "Logbook Kelompok",
  LAPORAN_AKHIR: "Laporan Akhir",
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

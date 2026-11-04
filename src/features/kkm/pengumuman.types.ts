// Tipe fitur Pengumuman KKM — selaras dengan BE src/kkm/pengumuman

export type PengumumanPrioritas = "PENTING" | "SEDANG" | "INFORMASI";
export type PengumumanStatus = "SCHEDULED" | "PUBLISHED";
export type PublishMode = "now" | "scheduled";

export type PengumumanTargetType =
  | "PESERTA"
  | "DPL"
  | "KELOMPOK"
  | "DESA"
  | "PERIODE"
  | "FAKULTAS";

/** Satu centang audiens pada form buat pengumuman. */
export interface PengumumanTargetInput {
  type: PengumumanTargetType;
  ref_id?: number | null;
}

export interface LampiranPengumuman {
  name: string | null;
  size: number | null;
  mime: string | null;
  url: string;
}

export interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  kategori: string;
  prioritas: PengumumanPrioritas;
  status: PengumumanStatus;
  published_at: string | null;
  scheduled_at: string | null;
  is_pinned: boolean;
  lampiran: LampiranPengumuman | null;
  created_by: string | null;
  created_at: string;
  audiens: string[];
  total_penerima: number;
  dibaca: number;
  /** khusus sisi penerima: null = belum dibaca */
  read_at?: string | null;
}

export interface PengumumanStats {
  total: number;
  penting: number;
  sedang: number;
  informasi: number;
  dipinned: number;
  terjadwal: number;
}

export interface PengumumanListMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetPengumumanAdminResponse {
  message: string;
  data: Pengumuman[];
  stats: PengumumanStats;
  meta: PengumumanListMeta;
}

export interface PengumumanListParams {
  page?: number;
  search?: string;
  kategori?: string;
  prioritas?: PengumumanPrioritas | "";
  status?: PengumumanStatus | "";
  audiens?: PengumumanTargetType | "";
}

export interface CreatePengumumanPayload {
  judul: string;
  isi: string;
  kategori: string;
  prioritas: PengumumanPrioritas;
  targets: PengumumanTargetInput[];
  publish_mode: PublishMode;
  scheduled_at?: string;
  lampiran?: File | null;
}

export interface UpdatePengumumanPayload {
  judul?: string;
  isi?: string;
  kategori?: string;
  prioritas?: PengumumanPrioritas;
}

export interface PengumumanMessageResponse {
  message: string;
  data?: unknown;
}

/** Opsi dropdown dari master referensi (jenis KATEGORI_PENGUMUMAN). */
export interface OpsiKategori {
  id: number;
  nama: string;
}

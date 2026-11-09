export type KkmJenis = "REGULER" | "TEMATIK";
export type KkmStatus = "DRAFT" | "AKTIF" | "DIJADWALKAN" | "SELESAI";

export interface KkmPeriod {
  id: number;
  nama_periode: string;
  tahun_akademik: string; // "2025/2026"
  tahun: number;
  jenis: KkmJenis;
  deskripsi?: string | null;
  tgl_buka_daftar?: string | null; // YYYY-MM-DD
  tgl_tutup_daftar?: string | null;
  tgl_pembekalan?: string | null;
  tgl_pelaksanaan?: string | null;
  tgl_penarikan?: string | null;
  deadline_laporan?: string | null;
  /** 1 = Senin .. 7 = Minggu — hari deadline mingguan logbook individu */
  logbook_individu_hari?: number | null;
  /** "HH:mm" — jam tutup logbook individu tiap minggu */
  logbook_individu_jam?: string | null;
  /** 1 = Senin .. 7 = Minggu — hari deadline mingguan logbook kelompok */
  logbook_kelompok_hari?: number | null;
  /** "HH:mm" — jam tutup logbook kelompok tiap minggu */
  logbook_kelompok_jam?: string | null;
  /** Deadline laporan individu (YYYY-MM-DD) */
  deadline_laporan_individu?: string | null;
  /** "HH:mm" */
  jam_laporan_individu?: string | null;
  /** "HH:mm" — jam tutup laporan kelompok (tanggal pada deadline_laporan) */
  jam_laporan_kelompok?: string | null;
  target_peserta: number;
  minimal_semester?: number | null;
  maks_anggota_kelompok: number;
  boleh_lintas_fakultas: boolean;
  wajib_campur_prodi: boolean;
  assign_dpl_otomatis: boolean;
  maks_kelompok_per_dosen?: number | null;
  status: KkmStatus;
  created_at?: string;
  updated_at?: string;
}

export interface KkmPeriodMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetKkmPeriodsResponse {
  message: string;
  data: KkmPeriod[];
  meta: KkmPeriodMeta;
}

export interface GetKkmPeriodActiveResponse {
  message: string;
  data: KkmPeriod | null;
}

export interface GetKkmPeriodByIdResponse {
  message: string;
  data: KkmPeriod;
}

export interface KkmPeriodPayload {
  nama_periode: string;
  tahun_akademik: string;
  tahun: number;
  jenis: KkmJenis;
  deskripsi?: string | null;
  tgl_buka_daftar?: string | null;
  tgl_tutup_daftar?: string | null;
  tgl_pembekalan?: string | null;
  tgl_pelaksanaan?: string | null;
  tgl_penarikan?: string | null;
  deadline_laporan?: string | null;
  /** 1 = Senin .. 7 = Minggu — hari deadline mingguan logbook individu */
  logbook_individu_hari?: number | null;
  /** "HH:mm" — jam tutup logbook individu tiap minggu */
  logbook_individu_jam?: string | null;
  /** 1 = Senin .. 7 = Minggu — hari deadline mingguan logbook kelompok */
  logbook_kelompok_hari?: number | null;
  /** "HH:mm" — jam tutup logbook kelompok tiap minggu */
  logbook_kelompok_jam?: string | null;
  /** Deadline laporan individu (YYYY-MM-DD) */
  deadline_laporan_individu?: string | null;
  /** "HH:mm" */
  jam_laporan_individu?: string | null;
  /** "HH:mm" — jam tutup laporan kelompok (tanggal pada deadline_laporan) */
  jam_laporan_kelompok?: string | null;
  target_peserta?: number;
  minimal_semester?: number | null;
  maks_anggota_kelompok?: number;
  boleh_lintas_fakultas?: boolean;
  wajib_campur_prodi?: boolean;
  assign_dpl_otomatis?: boolean;
  maks_kelompok_per_dosen?: number | null;
  status?: KkmStatus;
}

export interface KkmPeriodListParams {
  page?: number;
  search?: string;
  status?: KkmStatus | string;
  jenis?: KkmJenis | string;
  tahun?: string | number;
  tahun_akademik?: string;
  limit?: number;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[] | string>;
  error?: string;
}

export const KKM_JENIS_OPTIONS: KkmJenis[] = ["REGULER", "TEMATIK"];
export const KKM_STATUS_OPTIONS: KkmStatus[] = ["DRAFT", "AKTIF", "DIJADWALKAN", "SELESAI"];

/** Hari deadline mingguan logbook kelompok — 1 = Senin .. 7 = Minggu (ISO-8601). */
export const KKM_HARI_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" },
];

// Untuk FE select Tahun Akademik: generate 2020/2021 ... 2035/2036
export const TAHUN_AKADEMIK_OPTIONS: string[] = Array.from({ length: 20 }, (_, i) => {
  const start = 2020 + i;
  return `${start}/${start + 1}`;
});

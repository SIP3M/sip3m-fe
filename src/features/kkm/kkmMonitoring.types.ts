/**
 * Tipe untuk GET /kkm/monitoring (Monitoring KKM — ADMIN_LPPM & STAFF_LPPM).
 *
 * Kontrak BE — SEMUA nilai turunan (status, progres, tahapan, indikator, delta)
 * dihitung di backend; FE hanya render apa adanya:
 * - `periode` = null bila tidak ada periode AKTIF → `data: []`, angka semua 0 (bukan error)
 * - `stats` dihitung dari SELURUH kelompok periode (di atas filter status/search)
 *   → dipakai untuk kartu ringkasan & hitung tab
 * - `meta` mencerminkan hasil SETELAH filter (totalData = jumlah kelompok cocok)
 * - `filters` = opsi dropdown desa & DPL dari seluruh kelompok periode
 */

export type MonitoringStatus =
  | "AKTIF"
  | "PERLU_PERHATIAN"
  | "BERMASALAH"
  | "SELESAI";

export type MonitoringIndikator =
  | "NORMAL"
  | "TIDAK_ADA_AKTIVITAS"
  | "DPL_BELUM_MONITORING"
  | "LOGBOOK_KURANG";

export interface KkmMonitoringPeriode {
  id: number;
  nama_periode: string;
  tahun_akademik: string;
  status: string;
}

export interface KkmMonitoringDpl {
  /** null bila kelompok belum ada DPL */
  id: number | null;
  nama: string | null;
  /** ISO timestamp — null bila DPL belum pernah monitoring */
  last_monitored_at: string | null;
  /** Label siap tampil ("Hari ini", "3 hari lalu") — null = Belum pernah */
  terakhir: string | null;
}

export interface KkmMonitoringLogbook {
  jumlah: number;
  /** entri 7 hari terakhir − entri 7 hari sebelumnya (bisa negatif) */
  delta: number;
}

export interface KkmMonitoringRow {
  id: number;
  nama: string;
  jumlah_anggota: number;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  dpl: KkmMonitoringDpl;
  logbook: KkmMonitoringLogbook;
  /** MONITORING_DPL | PROGRAM_KERJA | LOGBOOK_AKTIF | LAPORAN_AKHIR | SELESAI */
  tahapan: string;
  tahapan_label: string;
  /** 0–100 — dari backend, jangan dihitung ulang di FE */
  progress: number;
  /** MonitoringIndikator — dibiarkan `string` agar aman thd nilai baru */
  indikator: MonitoringIndikator | string;
  indikator_label: string;
  /** MonitoringStatus — dibiarkan `string` agar aman thd nilai baru */
  status: MonitoringStatus | string;
  status_label: string;
}

export interface KkmMonitoringMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface KkmMonitoringStats {
  total_kelompok: number;
  kelompok_aktif: number;
  perlu_perhatian: number;
  bermasalah: number;
  selesai: number;
  /** 0–100, sudah dibulatkan BE */
  rata_rata_progress: number;
}

export interface KkmMonitoringFilters {
  desa: string[];
  dpl: { id: number; nama: string }[];
}

export interface GetKkmMonitoringResponse {
  message: string;
  periode: KkmMonitoringPeriode | null;
  data: KkmMonitoringRow[];
  meta: KkmMonitoringMeta;
  stats: KkmMonitoringStats;
  filters: KkmMonitoringFilters;
}

/** Semua query opsional; kosongkan = default BE (periode AKTIF terbaru, tanpa filter) */
export interface KkmMonitoringParams {
  periode_id?: number;
  page?: number;
  search?: string;
  status?: MonitoringStatus;
  /** persis, case-insensitive (BE) */
  desa?: string;
  dpl_id?: number;
}

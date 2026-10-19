/**
 * Tipe untuk GET /dashboard/kkm (Dashboard KKM admin/staff).
 *
 * Kontrak BE:
 * - `data.periode` = null bila tidak ada periode aktif (angka semua 0, bukan error)
 * - `status_kelompok` selalu berisi 3 entri (jumlah boleh 0) — derive isi-vs-kuota
 * - `peserta_per_prodi` & `distribusi_per_desa` urut menurun
 */

export interface KkmDashboardPeriode {
  id: number;
  nama_periode: string;
  tahun_akademik: string;
  status: string;
}

export interface KkmDashboardSummaryCards {
  /** Mahasiswa */
  total_peserta: number;
  /** Kelompok */
  total_kelompok: number;
  /** Desa penempatan */
  total_desa: number;
  /** Distinct DPL (dosen) pada kelompok */
  total_dpl: number;
  /** peserta.kelompok_id = null */
  belum_dapat_kelompok: number;
  /** peserta.status = PENDING */
  menunggu_verifikasi: number;
}

/** Dipakai untuk peserta_per_prodi dan distribusi_per_desa */
export interface KkmDashboardNamaJumlah {
  nama: string;
  jumlah: number;
}

/** Hasil deriveStatus (isi vs kuota) — bukan lifecycle */
export interface KkmDashboardStatusKelompok {
  /** AKTIF | BELUM_LENGKAP | BERMASALAH */
  status: string;
  label: string;
  jumlah: number;
}

export interface KkmDashboardData {
  periode: KkmDashboardPeriode | null;
  summary_cards: KkmDashboardSummaryCards;
  peserta_per_prodi: KkmDashboardNamaJumlah[];
  status_kelompok: KkmDashboardStatusKelompok[];
  distribusi_per_desa: KkmDashboardNamaJumlah[];
}

export interface GetKkmDashboardResponse {
  message: string;
  data: KkmDashboardData;
}

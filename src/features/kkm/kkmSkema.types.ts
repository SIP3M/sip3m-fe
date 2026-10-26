/**
 * Tipe untuk GET /kkm/skema (Portal Mahasiswa — "Pilih Skema KKM").
 *
 * Kontrak BE (Jalur A: 1 kartu = 1 Periode KKM):
 * - Kartu HANYA berisi periode berstatus AKTIF/DIJADWALKAN yang masih dalam
 *   jendela buka_daftar → tutup_daftar. `status` dipakai FE utk menampilkan
 *   kartu DIJADWAKAN sbg "segera dibuka" (tombol daftar nonaktif).
 * - `terisi` = peserta VERIFIED, `menunggu` = PENDING, `sisa` = max(0, kuota-terisi)
 * - `stats` & `filters` GLOBAL (identik di semua query — diverifikasi live)
 * - `periode_aktif` bisa null (tanpa efek pada `skema`)
 */

export type SkemaJenis = "REGULER" | "TEMATIK";

export interface KkmSkemaPeriodeAktif {
  id: number;
  nama_periode: string;
  tahun_akademik: string;
  jenis: SkemaJenis | string;
  status: string;
}

export interface KkmSkemaTanggal {
  buka_daftar: string | null;
  tutup_daftar: string | null;
  pelaksanaan: string | null;
  penarikan: string | null;
}

export interface KkmSkema {
  id: number;
  nama: string;
  deskripsi: string | null;
  /** REGULER | TEMATIK (dibiarkan string agar aman thd nilai baru) */
  jenis: SkemaJenis | string;
  durasi_hari: number | null;
  tanggal: KkmSkemaTanggal;
  kuota: number;
  /** peserta VERIFIED */
  terisi: number;
  /** peserta PENDING */
  menunggu: number;
  sisa: number;
  persentase_terisi: number;
  /** kabupaten tujuan */
  wilayah: string[];
  /** ISO — batas akhir pendaftaran */
  batas_daftar: string | null;
  /** AKTIF | DIJADWAKAN — DIJADWAKAN ditampilkan "segera dibuka" (tombol nonaktif) */
  status: string;
}

export interface KkmSkemaStats {
  total_skema: number;
  akumulasi_kuota: number;
  akumulasi_terisi: number;
  batas_akhir: string | null;
}

export interface KkmSkemaFilters {
  jenis: SkemaJenis[] | string[];
  wilayah: string[];
}

export interface GetKkmSkemaResponse {
  message: string;
  periode_aktif: KkmSkemaPeriodeAktif | null;
  skema: KkmSkema[];
  stats: KkmSkemaStats;
  filters: KkmSkemaFilters;
}

/** Query opsional — `jenis` = tab, `wilayah` = cocok sebagian kabupaten (case-insensitive) */
export interface KkmSkemaParams {
  jenis?: SkemaJenis;
  wilayah?: string;
}

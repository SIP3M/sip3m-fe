export type PolaProdi = "CAMPUR" | "MIN_3_PRODI" | "FAKULTAS" | "RANDOM";
export type LokasiMode = "RANDOM" | "KUOTA";
export type MetodeDpl = "RANDOM" | "FAKULTAS" | "BEBAN_SEIMBANG" | "BEBAN" | string;

export interface KkmGenerateStats {
  periode: { id: number; nama_periode: string; tahun_akademik?: string } | null;
  total_peserta: number;
  sudah_verified: number;
  belum_verifikasi: number;
  belum_kelompok: number;
  belum_syarat_semester: number;
  total_desa: number;
  total_kelompok: number;
  dpl_tersedia: number;
  total_dosen: number;
  desa_hampir_penuh: number;
  prodi_tidak_seimbang: number;
  // compat aliases BE might use
  total?: number;
  verified?: number;
  totalPeserta?: number;
}

export interface GetKkmGenerateStatsResponse {
  message: string;
  data: KkmGenerateStats;
}

export interface KkmGenerateValidasi {
  periode?: { id: number; nama_periode: string } | null;
  siap_diproses?: number;
  total_desa?: number;
  total_kelompok?: number;
  desa_hampir_penuh?: number;
  dpl_tersedia?: number;
  total_dosen?: number;
  belum_syarat?: number;
  belum_syarat_semester?: number;
  prodi_tidak_seimbang?: number;
  rekomendasi?: string | null;
  errors?: string[];
  warnings?: string[];
  // some BE return checks array
  checks?: Array<{ text: string; type: "ok" | "warning" | "error" }>;
}

export interface GetKkmGenerateValidasiResponse {
  message: string;
  data: KkmGenerateValidasi;
}

export interface KkmGenerateKelompokPreview {
  kelompok_id: number;
  nama: string;
  desa: string | null;
  kecamatan?: string | null;
  kuota?: number | null;
  kapasitas_efektif?: number | null;
  jumlah_anggota: number;
  gender?: { L: number; P: number } | Record<string, number>;
  prodi_mix?: Record<string, number>;
  anggota_preview?: Array<{
    nim: string;
    nama: string;
    prodi: string;
    fakultas: string;
    semester: number | null;
    jenis_kelamin: string;
  }>;
}

export interface KkmGeneratePreviewData {
  periode?: { id: number; nama_periode: string } | null;
  total_peserta?: number;
  total_kelompok?: number;
  per_kelompok: KkmGenerateKelompokPreview[];
  // execute also returns preview
  updated?: number;
}

export interface GetKkmGeneratePreviewResponse {
  message: string;
  data: KkmGeneratePreviewData;
}

export interface KkmGeneratePayload {
  periode_id: number;
  jumlah_anggota_per_kelompok: number;
  pola_prodi: PolaProdi;
  gender_balance: boolean;
  lokasi_mode: LokasiMode;
  assign_dpl_otomatis: boolean;
  metode_dpl?: MetodeDpl;
  maks_kelompok_per_dpl?: number;
  ikuti_kuota_desa: boolean;
}

export interface KkmGenerateExecuteResponse {
  message: string;
  data: {
    updated: number;
    preview?: KkmGeneratePreviewData;
    total_peserta?: number;
    total_kelompok?: number;
    per_kelompok?: KkmGenerateKelompokPreview[];
  };
}

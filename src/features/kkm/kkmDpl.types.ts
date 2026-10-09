export interface KkmDplDosen {
  id: number;
  name: string;
  nidn_nip: string;
  fakultas: string | null;
  prodi: string | null;
}

export interface KkmDplKelompokInfo {
  count: number;
  maksimal: number | null;
}

export interface KkmDplPeriodeRef {
  id: number;
  nama_periode: string;
  tahun_akademik: string;
}

export interface KkmDplRow {
  dosen: KkmDplDosen;
  status_dpl: string; // "Aktif" | "Belum Ditugaskan"
  is_dpl_aktif: boolean;
  kelompok: KkmDplKelompokInfo;
  desa_bimbingan: string[];
  periode: KkmDplPeriodeRef | null;
}

export interface KkmDplMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetKkmDplResponse {
  message: string;
  data: KkmDplRow[];
  meta: KkmDplMeta;
}

export interface KkmDplListParams {
  periode_id?: number | null;
  page?: number;
  limit?: number;
  search?: string;
  fakultas?: string;
  status?: string; // "Aktif" | "Belum Ditugaskan"
}

export interface KkmDplStats {
  periode: KkmDplPeriodeRef | null;
  total_dpl_aktif: number;
  belum_ditugaskan: number;
  total_kelompok: number;
  rata_rata_bimbingan: number;
}

export interface GetKkmDplStatsResponse {
  message: string;
  data: KkmDplStats;
}

export interface KkmDplDosenOption {
  id: number;
  name: string;
  nidn_nip: string;
  fakultas: string | null;
  prodi: string | null;
}

export interface GetKkmDplDosenResponse {
  message: string;
  data: KkmDplDosenOption[];
}

export interface KkmDplKelompokItem {
  id: number;
  nama: string;
  desa?: string | null;
  kuota?: number | null;
  dpl_id?: number | null;
  lokasi_id?: number | null;
  lokasi?: {
    desa?: string | null;
    kecamatan?: string | null;
    kabupaten?: string | null;
    kuota?: number | null;
  } | null;
}

export interface GetKkmDplKelompokResponse {
  message: string;
  data: KkmDplKelompokItem[];
}

export interface GetKkmDplMeResponse {
  message: string;
  data: { is_dpl_aktif: boolean; user_id: number };
}

export interface AssignDplPayload {
  dosen_id: number;
  periode_id: number;
  kelompok_ids: number[];
  maksimal_kelompok: number;
}

export interface CabutDplPayload {
  dosen_id: number;
  periode_id: number;
}

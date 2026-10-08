export type KkmLocationStatus = "Tersedia" | "Penuh";

export interface KkmLocation {
  id: number;
  periode_id: number;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  kuota: number;
  terisi: number;
  status: KkmLocationStatus;
  created_at?: string;
  updated_at?: string;
  periode?: {
    id: number;
    nama_periode: string;
    tahun_akademik: string;
  };
}

export interface KkmLocationMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetKkmLocationsResponse {
  message: string;
  data: KkmLocation[];
  meta: KkmLocationMeta;
}

export interface GetKkmLocationByIdResponse {
  message: string;
  data: KkmLocation;
}

export interface KkmLocationStatsPerKecamatan {
  kecamatan: string;
  kabupaten: string;
  jumlah_desa: number;
  kuota: number;
  terisi: number;
}

export interface KkmLocationStats {
  periode: { id: number; nama_periode: string; tahun_akademik: string };
  total_desa: number;
  total_kecamatan: number;
  total_kuota: number;
  total_terisi: number;
  per_kecamatan: KkmLocationStatsPerKecamatan[];
}

export interface GetKkmLocationStatsResponse {
  message: string;
  data: KkmLocationStats;
}

export interface CreateKkmLocationPayload {
  periode_id: number;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  kuota: number;
}

export interface UpdateKkmLocationPayload {
  kabupaten?: string;
  kecamatan?: string;
  desa?: string;
  kuota?: number;
}

export interface KkmLocationListParams {
  periode_id: number;
  page?: number;
  limit?: number;
  search?: string;
  kecamatan?: string;
  kabupaten?: string;
  status?: KkmLocationStatus | string;
}

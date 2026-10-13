export type KkmPesertaStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type KkmPesertaStatusKelompok = "Belum Ditempatkan" | "Sudah Ditempatkan";

export interface KkmPesertaKelompok {
  id: number;
  nama: string;
  desa: string | null;
}

export interface KkmPeserta {
  id: number;
  periode_id: number;
  user_id: number;
  nim: string;
  nama: string;
  email: string;
  prodi: string | null;
  fakultas: string | null;
  semester: number | null;
  status: KkmPesertaStatus;
  kelompok: KkmPesertaKelompok | null;
  status_kelompok: KkmPesertaStatusKelompok;
  created_at?: string;
  updated_at?: string;
}

export interface KkmPesertaMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetKkmPesertaResponse {
  message: string;
  data: KkmPeserta[];
  meta: KkmPesertaMeta;
}

export interface KkmPesertaStats {
  periode: { id: number; nama_periode: string; tahun_akademik: string } | null;
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  belum_kelompok: number;
}

export interface GetKkmPesertaStatsResponse {
  message: string;
  data: KkmPesertaStats;
}

export interface GetKkmPesertaByIdResponse {
  message: string;
  data: {
    id: number;
    periode_id: number;
    periode?: { id: number; nama_periode: string; tahun_akademik?: string } | null;
    status: KkmPesertaStatus;
    kelompok: KkmPesertaKelompok | null;
    status_kelompok: KkmPesertaStatusKelompok;
    user: {
      id: number;
      nim: string;
      nama: string;
      email: string;
      semester: number | null;
      nomor_hp?: string | null;
      alamat?: string | null;
      fakultas: string | null;
      prodi: string | null;
    };
    // fallback flat fields if BE returns flat
    nim?: string;
    nama?: string;
    fakultas?: string | null;
    prodi?: string | null;
    semester?: number | null;
  };
}

export interface KkmPesertaListParams {
  periode_id: number;
  page?: number;
  limit?: number;
  search?: string;
  fakultas?: string;
  prodi?: string;
  semester?: number | string;
  kelompok_id?: number | string;
  status?: KkmPesertaStatus | string;
  status_kelompok?: KkmPesertaStatusKelompok | string;
}

export interface BulkStatusPayload {
  periode_id: number;
  peserta_ids: number[];
  status: KkmPesertaStatus;
}

export interface AssignKelompokPayload {
  peserta_ids: number[];
  kelompok_id: number;
}

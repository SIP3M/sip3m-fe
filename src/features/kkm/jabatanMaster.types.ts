export interface JabatanKelompokMaster {
  id: number;
  nama: string;
  max_per_kelompok: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJabatanMasterDTO {
  nama: string;
  max_per_kelompok?: number | null;
}

export interface UpdateJabatanMasterDTO {
  nama?: string;
  max_per_kelompok?: number | null;
}

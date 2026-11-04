export interface KomponenPenilaian {
  kehadiran: number;
  keaktifan: number;
  logbook: number;
  program_kerja: number;
  laporan: number;
  sikap: number;
}

export interface PesertaPenilaianItem {
  peserta_id: number;
  nama: string;
  nim: string;
  kelompok_id: number;
  kelompok_nama: string;
  periode: {
    id: number;
    nama_periode: string;
    tahun_akademik: string;
  };
  penilaian: KomponenPenilaian & {
    nilai_akhir: number;
    grade: string;
    catatan_dpl?: string | null;
    is_saved: boolean;
    dinilai_at?: string | null;
  };
}

export interface PenilaianBimbinganResponse {
  bobot: {
    kehadiran: string;
    keaktifan: string;
    logbook: string;
    program_kerja: string;
    laporan: string;
    sikap: string;
  };
  kelompok_list: Array<{ id: number; nama: string }>;
  peserta: PesertaPenilaianItem[];
}

export interface PenilaianMahasiswaResponse {
  peserta_id: number;
  periode: {
    id: number;
    nama_periode: string;
    tahun_akademik: string;
  };
  kelompok: {
    nama: string;
    desa: string;
    dpl: {
      id: number;
      name: string;
      nidn_nip: string | null;
    } | null;
  } | null;
  penilaian: KomponenPenilaian & {
    nilai_akhir: number;
    grade: string;
    catatan_dpl: string | null;
    is_saved: boolean;
    dinilai_at: string | null;
    penilai?: {
      id: number;
      name: string;
      nidn_nip: string | null;
    } | null;
  };
  bobot_komponen: Array<{ komponen: string; bobot: string }>;
}

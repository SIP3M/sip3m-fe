import { api } from "@/services/api";

/** Status pendaftaran KKM mandiri (mahasiswa) — sama dengan enum BE. */
export type PendaftaranStatus = "DRAFT" | "PENDING" | "VERIFIED" | "REJECTED";

export const UKURAN_JAKET_OPTIONS = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;

/** Referensi periode pada baris pendaftaran (untuk tampilan). */
export interface PendaftaranPeriodeRef {
  id: number;
  nama_periode: string;
  tahun_akademik: string;
  jenis: string;
  status: string;
}

/** Satu baris pendaftaran KKM milik mahasiswa. */
export interface PendaftaranItem {
  id: number;
  periode_id: number;
  status: PendaftaranStatus;
  no_wa: string | null;
  ukuran_jaket: string | null;
  nama_kontak_darurat: string | null;
  no_hp_kontak_darurat: string | null;
  alamat_domisili: string | null;
  bukti_ukt_url: string | null;
  periode: PendaftaranPeriodeRef | null;
  created_at: string;
  updated_at: string;
}

/**
 * GET /kkm/pendaftaran/me — riwayat pendaftaran KKM milik mahasiswa login
 * (khusus role MAHASISWA). Dengan `periodeId` hanya periode itu (dipakai
 * form & store akses gembok menu untuk membaca status).
 */
export const getPendaftaranMe = async (
  periodeId?: number,
): Promise<PendaftaranItem[]> => {
  const res = await api.get<{ data: PendaftaranItem[] }>(
    "/kkm/pendaftaran/me",
    { params: periodeId ? { periode_id: periodeId } : undefined },
  );
  return res.data.data;
};

/**
 * POST /kkm/pendaftaran — simpan draft (aksi=draft) / kirim (aksi=kirim).
 * Body multipart: field formulir + berkas `bukti_ukt` (PDF/JPG/PNG ≤5MB).
 */
export const upsertPendaftaran = async (
  payload: FormData,
): Promise<{ message: string; data: PendaftaranItem }> => {
  const res = await api.post<{ message: string; data: PendaftaranItem }>(
    "/kkm/pendaftaran",
    payload,
    {
      // Instance `api` punya default Content-Type application/json — tanpa ini
      // axios mengubah FormData jadi string JSON, berkas `bukti_ukt` hilang dan
      // server menolak kirim dengan "Bukti pembayaran UKT wajib diunggah".
      // (Pola sama dgn proposal.api & kkmKelompok.api; browser menambahkan
      // boundary saat multipart.)
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
};

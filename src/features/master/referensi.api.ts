import { api } from "@/services/api";

/**
 * API Master Referensi (Skema Penelitian & Sumber Pendanaan proposal).
 *
 * - GET /referensi/:jenis        — publik, hanya opsi aktif (form proposal).
 * - GET/POST /master/referensi…  — ADMIN_SISTEM (guard di BE).
 */
export type JenisReferensi = "SKEMA" | "SUMBER_PENDANAAN";

export interface ReferensiItem {
  id: number;
  jenis: string;
  nama: string;
  is_aktif: boolean;
  urut: number;
}

/** Daftar opsi aktif untuk dropdown (publik). */
export const getReferensiAktif = async (
  jenis: JenisReferensi,
): Promise<ReferensiItem[]> => {
  const res = await api.get<{ data: ReferensiItem[] }>(`/referensi/${jenis}`);
  return res.data.data;
};

/** Daftar lengkap (termasuk nonaktif) — halaman kelola ADMIN_SISTEM. */
export const getReferensiAll = async (
  jenis: JenisReferensi,
): Promise<ReferensiItem[]> => {
  const res = await api.get<{ data: ReferensiItem[] }>(
    `/master/referensi/${jenis}`,
  );
  return res.data.data;
};

export const createReferensi = (
  jenis: JenisReferensi,
  payload: { nama: string; urut?: number },
) => api.post<{ message: string }>(`/master/referensi/${jenis}`, payload);

export const updateReferensi = (
  id: number,
  payload: { nama?: string; is_aktif?: boolean; urut?: number },
) => api.patch<{ message: string }>(`/master/referensi/${id}`, payload);

export const deleteReferensi = (id: number) =>
  api.delete<{ message: string }>(`/master/referensi/${id}`);

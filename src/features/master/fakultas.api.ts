import { api } from "@/services/api";

/**
 * API master data Fakultas & Program Studi.
 *
 * - GET bersifat publik (juga dipakai dropdown user/proposal).
 * - Tulis (create/update/delete) HANYA untuk role ADMIN_SISTEM — guard di BE.
 * - Envelope BE: `{ message, data? }`; validasi 400 memuat `errors`.
 */

export interface FakultasItem {
  id: number;
  nama: string;
  /** Hanya dikirim oleh GET /fakultas (additive, aman diabaikan). */
  _count?: { program_studi: number; users: number };
}

export interface ProgramStudiItem {
  id: number;
  nama: string;
  fakultas_id: number;
  /** Hanya dikirim oleh GET /program-studi (daftar datar). */
  fakultas?: { id: number; nama: string } | null;
  /** Jumlah user pada prodi ini — dipakai guard hapus di BE. */
  _count?: { users: number };
}

export interface MessageResponse {
  message: string;
}

interface FakultasResponse extends MessageResponse {
  data: FakultasItem;
}

interface ProgramStudiResponse extends MessageResponse {
  data: ProgramStudiItem;
}

interface DeleteResponse extends MessageResponse {
  data: { id: number };
}

// =============================================
// Read-only (publik)
// =============================================

export const getFakultasList = async (): Promise<{ data: FakultasItem[] }> => {
  const res = await api.get<{ data: FakultasItem[] }>("/fakultas");
  return res.data;
};

export const getProgramStudiList = async (
  fakultasId: number,
): Promise<{ data: ProgramStudiItem[] }> => {
  const res = await api.get<{ data: ProgramStudiItem[] }>(
    `/fakultas/${fakultasId}/program-studi`,
  );
  return res.data;
};

/** Seluruh prodi lintas fakultas (untuk halaman Kelola Program Studi datar). */
export const getAllProgramStudi = async (): Promise<{
  data: ProgramStudiItem[];
}> => {
  const res = await api.get<{ data: ProgramStudiItem[] }>("/program-studi");
  return res.data;
};

// =============================================
// CRUD — hanya ADMIN_SISTEM
// =============================================

export const createFakultas = async (nama: string): Promise<FakultasResponse> => {
  const res = await api.post<FakultasResponse>("/fakultas", { nama });
  return res.data;
};

export const updateFakultas = async (
  id: number,
  nama: string,
): Promise<FakultasResponse> => {
  const res = await api.patch<FakultasResponse>(`/fakultas/${id}`, { nama });
  return res.data;
};

export const deleteFakultas = async (id: number): Promise<DeleteResponse> => {
  const res = await api.delete<DeleteResponse>(`/fakultas/${id}`);
  return res.data;
};

export const createProgramStudi = async (
  fakultasId: number,
  nama: string,
): Promise<ProgramStudiResponse> => {
  const res = await api.post<ProgramStudiResponse>(
    `/fakultas/${fakultasId}/program-studi`,
    { nama },
  );
  return res.data;
};

export const updateProgramStudi = async (
  id: number,
  nama: string,
): Promise<ProgramStudiResponse> => {
  const res = await api.patch<ProgramStudiResponse>(`/program-studi/${id}`, {
    nama,
  });
  return res.data;
};

export const deleteProgramStudi = async (id: number): Promise<DeleteResponse> => {
  const res = await api.delete<DeleteResponse>(`/program-studi/${id}`);
  return res.data;
};

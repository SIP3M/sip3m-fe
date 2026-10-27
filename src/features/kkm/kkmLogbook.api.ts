import { api } from "@/services/api";
import type {
  CreateLogbookResponse,
  GetLogbookSayaResponse,
  GetLogbookValidasiDetailResponse,
  GetLogbookValidasiResponse,
  KkmLogbookStatus,
  ReviewLogbookResponse,
} from "./kkmLogbook.types";

const BASE = "/kkm";

/** GET /kkm/logbook/me — logbook milik mahasiswa yang login */
export const getLogbookSaya = async (): Promise<GetLogbookSayaResponse> => {
  const res = await api.get<GetLogbookSayaResponse>(`${BASE}/logbook/me`);
  return res.data;
};

/**
 * POST /kkm/kelompok/:id/logbook — tambah entri logbook.
 * FormData dikirim dgn header multipart eksplisit (default axios JSON
 * di api.ts mengubah FormData jadi string JSON — pola proposal.api).
 */
export const createLogbook = async (
  kelompokId: number,
  payload: { tanggal: string; judul: string; deskripsi: string; file?: File | null },
): Promise<CreateLogbookResponse> => {
  const formData = new FormData();
  formData.append("tanggal", payload.tanggal);
  formData.append("judul", payload.judul);
  formData.append("deskripsi", payload.deskripsi);
  if (payload.file) formData.append("file", payload.file);
  const res = await api.post<CreateLogbookResponse>(
    `${BASE}/kelompok/${kelompokId}/logbook`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

// ─── Validasi logbook (DPL / admin LPPM) ─────────────────────────────────────

/**
 * GET /kkm/logbook/validasi — daftar entri lintas kelompok bimbingan
 * (DOSEN: kelompok bimbingannya; admin/staff: semua).
 */
export const getLogbookValidasi = async (params?: {
  status?: KkmLogbookStatus;
  page?: number;
  search?: string;
}): Promise<GetLogbookValidasiResponse> => {
  const res = await api.get<GetLogbookValidasiResponse>(`${BASE}/logbook/validasi`, {
    params,
  });
  return res.data;
};

/** GET /kkm/logbook/validasi/:entryId — detail entri utk halaman detail validasi */
export const getLogbookValidasiDetail = async (
  entryId: number,
): Promise<GetLogbookValidasiDetailResponse> => {
  const res = await api.get<GetLogbookValidasiDetailResponse>(
    `${BASE}/logbook/validasi/${entryId}`,
  );
  return res.data;
};

/**
 * PATCH /kkm/kelompok/:id/logbook/:entryId/review — APPROVED / REVISI.
 * `catatan` wajib saat REVISI (divalidasi BE); diabaikan saat APPROVED.
 */
export const reviewLogbook = async (
  kelompokId: number,
  entryId: number,
  payload: { status: "APPROVED" | "REVISI"; catatan?: string },
): Promise<ReviewLogbookResponse> => {
  const res = await api.patch<ReviewLogbookResponse>(
    `${BASE}/kelompok/${kelompokId}/logbook/${entryId}/review`,
    payload,
  );
  return res.data;
};

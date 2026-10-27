import { api } from "@/services/api";
import type {
  CreateLogbookResponse,
  GetLogbookSayaResponse,
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

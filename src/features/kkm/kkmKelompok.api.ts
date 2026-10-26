import { api } from "@/services/api";
import type {
  AddKkmKelompokAnggotaPayload,
  GetKelompokSayaResponse,
  GetKkmKelompokDetailResponse,
  GetKkmKelompokListResponse,
  GetKkmKelompokStatsResponse,
  KkmKelompokListParams,
  KkmKelompokMessageResponse,
  UpdateKkmKelompokPayload,
  UploadKkmKelompokDokumenResponse,
} from "./kkmKelompok.types";

const BASE = "/kkm/kelompok";

const cleanParams = (params: Record<string, string | number | undefined>): Record<string, string | number> => {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    if (typeof v === "string" && !v.trim()) continue;
    out[k] = typeof v === "string" ? v.trim() : v;
  }
  return out;
};

/** GET /kkm/kelompok — card list (limit 12 dari BE) */
export const getKkmKelompokList = async (
  params: KkmKelompokListParams,
): Promise<GetKkmKelompokListResponse> => {
  const res = await api.get<GetKkmKelompokListResponse>(BASE, {
    params: cleanParams({
      periode_id: params.periode_id,
      page: params.page ?? 1,
      search: params.search,
      status: params.status || undefined,
      komposisi: params.komposisi || undefined,
      desa: params.desa,
      dpl_id: params.dpl_id === "" ? undefined : params.dpl_id,
    }),
  });
  return res.data;
};

/** GET /kkm/kelompok/stats — 5 kartu statistik */
export const getKkmKelompokStats = async (
  periode_id: number,
): Promise<GetKkmKelompokStatsResponse> => {
  const res = await api.get<GetKkmKelompokStatsResponse>(`${BASE}/stats`, {
    params: { periode_id },
  });
  return res.data;
};

/** GET /kkm/kelompok/me — kelompok mahasiswa yang login (halaman "Kelompok Saya") */
export const getKelompokSaya = async (): Promise<GetKelompokSayaResponse> => {
  const res = await api.get<GetKelompokSayaResponse>(`${BASE}/me`);
  return res.data;
};

/** GET /kkm/kelompok/:id — detail lengkap (anggota, dokumen, progress) */
export const getKkmKelompokById = async (
  id: number | string,
): Promise<GetKkmKelompokDetailResponse> => {
  const res = await api.get<GetKkmKelompokDetailResponse>(`${BASE}/${id}`);
  return res.data;
};

/** PATCH /kkm/kelompok/:id — ganti/cabut DPL (null = cabut) */
export const updateKkmKelompok = async (
  id: number | string,
  payload: UpdateKkmKelompokPayload,
): Promise<KkmKelompokMessageResponse> => {
  const res = await api.patch<KkmKelompokMessageResponse>(`${BASE}/${id}`, payload);
  return res.data;
};

/** POST /kkm/kelompok/:id/anggota — tambah peserta ke kelompok */
export const addKkmKelompokAnggota = async (
  id: number | string,
  payload: AddKkmKelompokAnggotaPayload,
): Promise<KkmKelompokMessageResponse> => {
  const res = await api.post<KkmKelompokMessageResponse>(`${BASE}/${id}/anggota`, payload);
  return res.data;
};

/** DELETE /kkm/kelompok/:id/anggota/:pesertaId — peserta kembali "Belum Ditempatkan" */
export const removeKkmKelompokAnggota = async (
  id: number | string,
  pesertaId: number | string,
): Promise<KkmKelompokMessageResponse> => {
  const res = await api.delete<KkmKelompokMessageResponse>(
    `${BASE}/${id}/anggota/${pesertaId}`,
  );
  return res.data;
};

/** POST /kkm/kelompok/:id/dokumen — multipart (file PDF max 10MB + document_type) */
export const uploadKkmKelompokDokumen = async (
  id: number | string,
  file: File,
  document_type: string,
): Promise<UploadKkmKelompokDokumenResponse> => {
  const formData = new FormData();
  formData.append("document_type", document_type);
  formData.append("file", file);
  const res = await api.post<UploadKkmKelompokDokumenResponse>(`${BASE}/${id}/dokumen`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** DELETE /kkm/kelompok/dokumen/:docId */
export const deleteKkmKelompokDokumen = async (
  docId: number | string,
): Promise<KkmKelompokMessageResponse> => {
  const res = await api.delete<KkmKelompokMessageResponse>(`${BASE}/dokumen/${docId}`);
  return res.data;
};

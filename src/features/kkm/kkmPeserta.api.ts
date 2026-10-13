import { api } from "@/services/api";
import type {
  AssignKelompokPayload,
  BulkStatusPayload,
  GetKkmPesertaByIdResponse,
  GetKkmPesertaResponse,
  GetKkmPesertaStatsResponse,
  KkmPesertaListParams,
  KkmPesertaStatus,
} from "./kkmPeserta.types";

const BASE = "/kkm/peserta";

export const getKkmPesertaStats = async (periode_id: number): Promise<GetKkmPesertaStatsResponse> => {
  const res = await api.get<GetKkmPesertaStatsResponse>(`${BASE}/stats`, { params: { periode_id } });
  return res.data;
};

export const getKkmPeserta = async (params: KkmPesertaListParams): Promise<GetKkmPesertaResponse> => {
  const cleaned: Record<string, string | number | undefined> = {
    periode_id: params.periode_id,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search?.trim() || undefined,
    fakultas: params.fakultas?.trim() || undefined,
    prodi: params.prodi?.trim() || undefined,
    semester: params.semester !== undefined && String(params.semester).trim() !== "" ? String(params.semester) : undefined,
    kelompok_id: params.kelompok_id !== undefined && String(params.kelompok_id).trim() !== "" ? String(params.kelompok_id) : undefined,
    status: params.status?.trim() || undefined,
    status_kelompok: params.status_kelompok?.trim() || undefined,
  } as Record<string, string | number | undefined>;
  Object.keys(cleaned).forEach((k) => cleaned[k] === undefined && delete cleaned[k]);
  const res = await api.get<GetKkmPesertaResponse>(BASE, { params: cleaned });
  return res.data;
};

export const getKkmPesertaById = async (id: number | string): Promise<GetKkmPesertaByIdResponse> => {
  const res = await api.get<GetKkmPesertaByIdResponse>(`${BASE}/${id}`);
  return res.data;
};

export const updateKkmPesertaStatus = async (id: number | string, status: KkmPesertaStatus): Promise<{ message: string; data?: unknown }> => {
  const res = await api.patch<{ message: string; data?: unknown }>(`${BASE}/${id}/status`, { status });
  return res.data;
};

export const bulkUpdateKkmPesertaStatus = async (payload: BulkStatusPayload): Promise<{ message: string; data?: { count: number } }> => {
  const res = await api.patch<{ message: string; data?: { count: number } }>(`${BASE}/bulk-status`, payload);
  return res.data;
};

export const assignKkmPesertaKelompok = async (payload: AssignKelompokPayload): Promise<{ message: string; data?: { count: number } }> => {
  const res = await api.post<{ message: string; data?: { count: number } }>(`${BASE}/assign-kelompok`, payload);
  return res.data;
};

export const exportKkmPeserta = async (params: Omit<KkmPesertaListParams, "page" | "limit"> & { page?: number }): Promise<Blob> => {
  const cleaned: Record<string, string | number | undefined> = {
    periode_id: params.periode_id,
    search: params.search?.trim() || undefined,
    fakultas: params.fakultas?.trim() || undefined,
    prodi: params.prodi?.trim() || undefined,
    semester: params.semester !== undefined && String(params.semester).trim() !== "" ? String(params.semester) : undefined,
    kelompok_id: params.kelompok_id !== undefined && String(params.kelompok_id).trim() !== "" ? String(params.kelompok_id) : undefined,
    status: params.status?.trim() || undefined,
    status_kelompok: params.status_kelompok?.trim() || undefined,
  } as Record<string, string | number | undefined>;
  Object.keys(cleaned).forEach((k) => cleaned[k] === undefined && delete cleaned[k]);
  const res = await api.get<Blob>(`${BASE}/export`, { params: cleaned, responseType: "blob" as const });
  return res.data as Blob;
};

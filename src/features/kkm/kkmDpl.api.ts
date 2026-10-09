import { api } from "@/services/api";
import type {
  AssignDplPayload,
  CabutDplPayload,
  GetKkmDplDosenResponse,
  GetKkmDplKelompokResponse,
  GetKkmDplMeResponse,
  GetKkmDplResponse,
  GetKkmDplStatsResponse,
  KkmDplListParams,
} from "./kkmDpl.types";

const BASE = "/kkm/dpl";

export const getKkmDpl = async (params: KkmDplListParams = {}): Promise<GetKkmDplResponse> => {
  const cleaned: Record<string, string | number | undefined> = {
    periode_id: params.periode_id ?? undefined,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search?.trim() || undefined,
    fakultas: params.fakultas?.trim() || undefined,
    status: params.status?.trim() || undefined,
  };
  Object.keys(cleaned).forEach((k) => cleaned[k] === undefined && delete cleaned[k]);
  const res = await api.get<GetKkmDplResponse>(BASE, { params: cleaned });
  return res.data;
};

export const getKkmDplStats = async (periode_id: number): Promise<GetKkmDplStatsResponse> => {
  const res = await api.get<GetKkmDplStatsResponse>(`${BASE}/stats`, { params: { periode_id } });
  return res.data;
};

export const getKkmDplDosen = async (params: { search?: string; limit?: number } = {}): Promise<GetKkmDplDosenResponse> => {
  const cleaned: Record<string, string | number | undefined> = {
    search: params.search?.trim() || undefined,
    limit: params.limit ?? 20,
  };
  Object.keys(cleaned).forEach((k) => cleaned[k] === undefined && delete cleaned[k]);
  const res = await api.get<GetKkmDplDosenResponse>(`${BASE}/dosen`, { params: cleaned });
  return res.data;
};

export const getKkmDplKelompok = async (params: { periode_id: number; unassigned_only?: boolean; search?: string }): Promise<GetKkmDplKelompokResponse> => {
  const cleaned: Record<string, string | number | boolean | undefined> = {
    periode_id: params.periode_id,
    unassigned_only: params.unassigned_only,
    search: params.search?.trim() || undefined,
  };
  Object.keys(cleaned).forEach((k) => cleaned[k] === undefined && delete cleaned[k]);
  const res = await api.get<GetKkmDplKelompokResponse>(`${BASE}/kelompok`, { params: cleaned });
  return res.data;
};

export const getKkmDplMe = async (): Promise<GetKkmDplMeResponse> => {
  const res = await api.get<GetKkmDplMeResponse>(`${BASE}/me`);
  return res.data;
};

export const assignKkmDpl = async (payload: AssignDplPayload): Promise<{ message: string; data?: unknown }> => {
  const res = await api.post<{ message: string; data?: unknown }>(`${BASE}/assign`, payload);
  return res.data;
};

export const cabutKkmDpl = async (payload: CabutDplPayload): Promise<{ message: string; data?: unknown }> => {
  const res = await api.post<{ message: string; data?: unknown }>(`${BASE}/cabut`, payload);
  return res.data;
};

export const generateKkmKelompok = async (periode_id: number): Promise<{ message: string; data?: { created: number } }> => {
  const res = await api.post<{ message: string; data?: { created: number } }>(`/kkm/kelompok/generate`, { periode_id });
  return res.data;
};

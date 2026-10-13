import { api } from "@/services/api";
import type {
  GetKkmGeneratePreviewResponse,
  GetKkmGenerateStatsResponse,
  GetKkmGenerateValidasiResponse,
  KkmGenerateExecuteResponse,
  KkmGeneratePayload,
} from "./kkmGenerate.types";

const BASE = "/kkm/generate";

export const getKkmGenerateStats = async (periode_id: number): Promise<GetKkmGenerateStatsResponse> => {
  const res = await api.get<GetKkmGenerateStatsResponse>(`${BASE}/stats`, { params: { periode_id } });
  return res.data;
};

export const getKkmGenerateValidasi = async (params: { periode_id: number; jumlah_anggota_per_kelompok: number }): Promise<GetKkmGenerateValidasiResponse> => {
  const res = await api.get<GetKkmGenerateValidasiResponse>(`${BASE}/validasi`, { params });
  return res.data;
};

// Some BE expose GET /preview with query, others POST. Support both: primary POST, fallback GET
export const getKkmGeneratePreviewQuery = async (params: KkmGeneratePayload): Promise<GetKkmGeneratePreviewResponse> => {
  const res = await api.get<GetKkmGeneratePreviewResponse>(`${BASE}/preview`, { params });
  return res.data;
};

export const postKkmGeneratePreview = async (payload: KkmGeneratePayload): Promise<GetKkmGeneratePreviewResponse> => {
  const res = await api.post<GetKkmGeneratePreviewResponse>(`${BASE}/preview`, payload);
  return res.data;
};

export const executeKkmGenerate = async (payload: KkmGeneratePayload): Promise<KkmGenerateExecuteResponse> => {
  const res = await api.post<KkmGenerateExecuteResponse>(`${BASE}/execute`, payload);
  return res.data;
};

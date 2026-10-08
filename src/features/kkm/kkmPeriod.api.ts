import { api } from "@/services/api";
import type {
  GetKkmPeriodActiveResponse,
  GetKkmPeriodByIdResponse,
  GetKkmPeriodsResponse,
  KkmPeriodListParams,
  KkmPeriodPayload,
} from "./kkmPeriod.types";

const BASE = "/kkm/periods";

export const getKkmPeriods = async (params: KkmPeriodListParams = {}): Promise<GetKkmPeriodsResponse> => {
  const normalized: Record<string, string | number | undefined> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search?.trim() || undefined,
    status: params.status?.trim?.() || undefined,
    jenis: params.jenis?.trim?.() || undefined,
    tahun: params.tahun !== undefined && String(params.tahun).trim() !== "" ? params.tahun : undefined,
    tahun_akademik: params.tahun_akademik?.trim() || undefined,
  };
  // Remove empty keys
  Object.keys(normalized).forEach((k) => normalized[k] === undefined && delete normalized[k]);

  const res = await api.get<GetKkmPeriodsResponse>(BASE, { params: normalized });
  return res.data;
};

export const getKkmPeriodActive = async (): Promise<GetKkmPeriodActiveResponse> => {
  const res = await api.get<GetKkmPeriodActiveResponse>(`${BASE}/active`);
  return res.data;
};

export const getKkmPeriodById = async (id: number | string): Promise<GetKkmPeriodByIdResponse> => {
  const res = await api.get<GetKkmPeriodByIdResponse>(`${BASE}/${id}`);
  return res.data;
};

/** summary optional: if BE has not released, caller should fallback to dummy 0 */
export const getKkmPeriodSummary = async (id: number | string): Promise<any> => {
  const res = await api.get(`${BASE}/${id}/summary`);
  return res.data;
};

export const createKkmPeriod = async (payload: KkmPeriodPayload): Promise<GetKkmPeriodByIdResponse> => {
  const res = await api.post<GetKkmPeriodByIdResponse>(BASE, payload);
  return res.data;
};

export const updateKkmPeriod = async (id: number | string, payload: Partial<KkmPeriodPayload>): Promise<GetKkmPeriodByIdResponse> => {
  const res = await api.put<GetKkmPeriodByIdResponse>(`${BASE}/${id}`, payload);
  return res.data;
};

export const activateKkmPeriod = async (id: number | string): Promise<GetKkmPeriodByIdResponse> => {
  const res = await api.patch<GetKkmPeriodByIdResponse>(`${BASE}/${id}/activate`);
  return res.data;
};

export const updateKkmPeriodStatus = async (id: number | string, status: string): Promise<GetKkmPeriodByIdResponse> => {
  const res = await api.patch<GetKkmPeriodByIdResponse>(`${BASE}/${id}/status`, { status });
  return res.data;
};

export const runKkmAutoComplete = async (): Promise<{ message: string; data?: any }> => {
  const res = await api.post<{ message: string; data?: any }>(`${BASE}/run-auto-complete`);
  return res.data;
};

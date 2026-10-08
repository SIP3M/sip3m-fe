import { api } from "@/services/api";
import type {
  CreateKkmLocationPayload,
  GetKkmLocationByIdResponse,
  GetKkmLocationsResponse,
  GetKkmLocationStatsResponse,
  KkmLocationListParams,
  UpdateKkmLocationPayload,
} from "./kkmLocation.types";

const BASE = "/kkm/locations";

export const getKkmLocations = async (params: KkmLocationListParams): Promise<GetKkmLocationsResponse> => {
  const cleaned: Record<string, string | number | undefined> = {
    periode_id: params.periode_id,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search?.trim() || undefined,
    kecamatan: params.kecamatan?.trim() || undefined,
    kabupaten: params.kabupaten?.trim() || undefined,
    status: params.status?.trim() || undefined,
  };
  Object.keys(cleaned).forEach((k) => cleaned[k] === undefined && delete cleaned[k]);
  const res = await api.get<GetKkmLocationsResponse>(BASE, { params: cleaned });
  return res.data;
};

export const getKkmLocationStats = async (periode_id: number): Promise<GetKkmLocationStatsResponse> => {
  const res = await api.get<GetKkmLocationStatsResponse>(`${BASE}/stats`, { params: { periode_id } });
  return res.data;
};

export const getKkmLocationById = async (id: number | string): Promise<GetKkmLocationByIdResponse> => {
  const res = await api.get<GetKkmLocationByIdResponse>(`${BASE}/${id}`);
  return res.data;
};

export const createKkmLocation = async (payload: CreateKkmLocationPayload): Promise<GetKkmLocationByIdResponse> => {
  const res = await api.post<GetKkmLocationByIdResponse>(BASE, payload);
  return res.data;
};

export const updateKkmLocation = async (id: number | string, payload: UpdateKkmLocationPayload): Promise<GetKkmLocationByIdResponse> => {
  const res = await api.put<GetKkmLocationByIdResponse>(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteKkmLocation = async (id: number | string): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`${BASE}/${id}`);
  return res.data;
};

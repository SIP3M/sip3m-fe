import { api } from "@/services/api";
import type {
  GetPengabdianRepositoryResponse,
  GetPublikasiResponse,
  PengabdianSearchParams,
  PublikasiSearchParams,
} from "./repository.types";

export const getPengabdianRepository = async (
  params: PengabdianSearchParams = {},
): Promise<GetPengabdianRepositoryResponse> => {
  const cleaned: Record<string, string | number | undefined> = {
    page: params.page ?? 1,
    limit: params.limit ?? 5,
    search: params.search?.trim() || undefined,
  };
  Object.keys(cleaned).forEach((key) => cleaned[key] === undefined && delete cleaned[key]);

  const res = await api.get<GetPengabdianRepositoryResponse>(
    "/public/repository/pengabdian",
    { params: cleaned },
  );
  return res.data;
};

export const getPublikasi = async (
  params: PublikasiSearchParams,
): Promise<GetPublikasiResponse> => {
  const res = await api.get<GetPublikasiResponse>("/public/repository/publikasi", {
    params: {
      search: params.search.trim(),
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sort: params.sort ?? "relevance",
    },
  });
  return res.data;
};

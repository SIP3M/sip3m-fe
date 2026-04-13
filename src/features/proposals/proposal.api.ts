import { api } from "@/services/api";
import { GetAllProposalsResponse } from "./proposal.types";

interface GetAllProposalsParams {
  page?: number;
  search?: string;
}

export const getAllProposals = async (
  params?: GetAllProposalsParams,
): Promise<GetAllProposalsResponse> => {
  const res = await api.get<GetAllProposalsResponse>("/getAllProposals", {
    params: {
      page: params?.page ?? 1,
      search: params?.search?.trim() || undefined,
    },
  });

  return res.data;
};

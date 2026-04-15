import { api } from "@/services/api";
import {
  GetAllProposalsResponse,
  GetProposalByIdResponse,
  UpdateProposalStatusPayload,
  UpdateProposalStatusResponse,
} from "./proposal.types";

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

export const getProposalById = async (
  id: number,
): Promise<GetProposalByIdResponse> => {
  const res = await api.get<GetProposalByIdResponse>(`/proposals/${id}`);
  return res.data;
};

export const updateProposalStatus = async (
  id: number,
  payload: UpdateProposalStatusPayload,
): Promise<UpdateProposalStatusResponse> => {
  const res = await api.patch<UpdateProposalStatusResponse>(
    `/proposals/${id}/status`,
    payload,
  );
  return res.data;
};

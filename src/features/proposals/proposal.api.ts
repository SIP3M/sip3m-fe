import { api } from "@/services/api";
import {
  DeleteProposalResponse,
  GetAllProposalsResponse,
  GetProposalByIdResponse,
  ProposalStatus,
  SubmitProposalResponse,
  UpsertProposalPayload,
  UpdateProposalStatusPayload,
  UpdateProposalStatusResponse,
} from "./proposal.types";

interface GetAllProposalsParams {
  page?: number;
  search?: string;
  status?: ProposalStatus;
}

const PROPOSALS_ENDPOINT = "/proposals";

export const getAllProposals = async (
  params?: GetAllProposalsParams,
): Promise<GetAllProposalsResponse> => {
  const res = await api.get<GetAllProposalsResponse>(PROPOSALS_ENDPOINT, {
    params: {
      page: params?.page ?? 1,
      search: params?.search?.trim() || undefined,
      status: params?.status?.trim() || undefined,
    },
  });

  return res.data;
};

export const getMyProposals = async (
  params?: GetAllProposalsParams,
): Promise<GetAllProposalsResponse> => {
  const res = await api.get<GetAllProposalsResponse>("/proposals/me", {
    params: {
      page: params?.page ?? 1,
      search: params?.search?.trim() || undefined,
      status: params?.status?.trim() || undefined,
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

const buildProposalFormData = (payload: UpsertProposalPayload) => {
  const formData = new FormData();

  if (payload.title !== undefined) {
    formData.append("title", payload.title);
  }

  if (payload.faculty !== undefined) {
    formData.append("faculty", payload.faculty);
  }

  if (payload.skema !== undefined) {
    formData.append("skema", payload.skema);
  }

  if (payload.sumber_data_penelitian !== undefined) {
    formData.append("sumber_data_penelitian", payload.sumber_data_penelitian);
  }

  if (payload.instansi !== undefined) {
    formData.append("instansi", payload.instansi);
  }

  if (payload.funding_request_amount !== undefined) {
    formData.append(
      "funding_request_amount",
      String(payload.funding_request_amount),
    );
  }

  if (payload.is_draft !== undefined) {
    formData.append("is_draft", String(payload.is_draft));
  }

  if (payload.proposal_file) {
    formData.append("proposal_file", payload.proposal_file);
  }

  if (payload.rab_file) {
    formData.append("rab_file", payload.rab_file);
  }

  return formData;
};

export const createProposal = async (
  payload: UpsertProposalPayload,
): Promise<GetProposalByIdResponse> => {
  const res = await api.post<GetProposalByIdResponse>(
    "/proposals",
    buildProposalFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
};

export const updateProposal = async (
  id: number,
  payload: UpsertProposalPayload,
): Promise<GetProposalByIdResponse> => {
  const res = await api.put<GetProposalByIdResponse>(
    `/proposals/${id}`,
    buildProposalFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
};

export const deleteProposal = async (
  id: number,
): Promise<DeleteProposalResponse> => {
  const res = await api.delete<DeleteProposalResponse>(`/proposals/${id}`);
  return res.data;
};

export const submitProposal = async (
  id: number,
): Promise<SubmitProposalResponse> => {
  const res = await api.patch<SubmitProposalResponse>(
    `/proposals/${id}/submit`,
  );
  return res.data;
};

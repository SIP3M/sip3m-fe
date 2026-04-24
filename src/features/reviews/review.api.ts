import { api } from "@/services/api";
import type {
  AssignReviewersResponse,
  AssignedProposalsResponse,
  EvaluatePayload,
  EvaluateResponse,
  ReviewHistoryResponse,
  ProposalStatus,
} from "./review.types";

// ─── Assign Reviewers (Admin) ─────────────────────────────────────────────────
export const assignReviewers = async (
  proposalId: number,
  reviewerIds: number[],
): Promise<AssignReviewersResponse> => {
  if (!Number.isInteger(proposalId) || proposalId <= 0) {
    throw new Error("ID proposal tidak valid.");
  }
  if (reviewerIds.length !== 2) {
    throw new Error("Harus memilih tepat 2 reviewer.");
  }
  if (reviewerIds[0] === reviewerIds[1]) {
    throw new Error("ID reviewer tidak boleh sama.");
  }

  const res = await api.post<AssignReviewersResponse>(
    `/proposals/${proposalId}/assign-reviewers`,
    { reviewerIds },
  );
  return res.data;
};

// ─── GET /proposals/assigned ──────────────────────────────────────────────────
export interface GetAssignedParams {
  page?: number;
  search?: string;
  status?: ProposalStatus;
}

export const getAssignedProposals = async (
  params: GetAssignedParams = {},
): Promise<AssignedProposalsResponse> => {
  const res = await api.get<AssignedProposalsResponse>("/proposals/assigned", {
    params: {
      page: params.page ?? 1,
      ...(params.search ? { search: params.search } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
  });
  return res.data;
};

// ─── PUT /proposals/{id}/evaluate ─────────────────────────────────────────────
export const evaluateProposal = async (
  proposalId: number,
  payload: EvaluatePayload,
): Promise<EvaluateResponse> => {
  if (!Number.isInteger(proposalId) || proposalId <= 0) {
    throw new Error("ID proposal tidak valid.");
  }

  const res = await api.put<EvaluateResponse>(
    `/proposals/${proposalId}/evaluate`,
    payload,
  );
  return res.data;
};

// ─── GET /proposals/{id}/reviews ──────────────────────────────────────────────
export const getProposalReviews = async (
  proposalId: number,
): Promise<ReviewHistoryResponse> => {
  if (!Number.isInteger(proposalId) || proposalId <= 0) {
    throw new Error("ID proposal tidak valid.");
  }

  const res = await api.get<ReviewHistoryResponse>(
    `/proposals/${proposalId}/reviews`,
  );
  return res.data;
};

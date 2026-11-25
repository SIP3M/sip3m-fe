import { api } from "@/services/api";
import type {
  AssignManualReviewerResponse,
  AssignReviewersResponse,
  AssignedProposalsResponse,
  EvaluatePayload,
  EvaluateResponse,
  ReassignReviewerResponse,
  ReviewerCandidatesResponse,
  ReviewHistoryResponse,
  ProposalStatus,
} from "./review.types";

// ─── Assign Reviewers (Admin) ─────────────────────────────────────────────────
export const assignReviewers = async (
  proposalId: number,
): Promise<AssignReviewersResponse> => {
  if (!Number.isInteger(proposalId) || proposalId <= 0) {
    throw new Error("ID proposal tidak valid.");
  }

  const res = await api.post<AssignReviewersResponse>(
    `/proposals/${proposalId}/assign-reviewers`,
    {},
  );
  return res.data;
};

// ─── Plotting manual ─────────────────────────────────────────────────────────
const assertValidProposalId = (proposalId: number) => {
  if (!Number.isInteger(proposalId) || proposalId <= 0) {
    throw new Error("ID proposal tidak valid.");
  }
};

/**
 * Daftar kandidat reviewer untuk SATU proposal.
 * Berlaku untuk proposal yang belum maupun sudah terplot (untuk alur
 * ubah penugasan/reassign).
 */
export const getReviewerCandidates = async (
  proposalId: number,
): Promise<ReviewerCandidatesResponse> => {
  assertValidProposalId(proposalId);

  const res = await api.get<ReviewerCandidatesResponse>(
    `/proposals/${proposalId}/reviewer-candidates`,
  );
  return res.data;
};

/**
 * Plot reviewer MANUAL untuk satu proposal — hanya untuk proposal yang
 * belum terplot. 409 bila sudah terplot (gunakan reassignReviewer) atau
 * ada konflik kepentingan.
 */
export const assignManualReviewer = async (
  proposalId: number,
  reviewerId: number,
): Promise<AssignManualReviewerResponse> => {
  assertValidProposalId(proposalId);
  if (!Number.isInteger(reviewerId) || reviewerId <= 0) {
    throw new Error("ID reviewer tidak valid.");
  }

  const res = await api.post<AssignManualReviewerResponse>(
    `/proposals/${proposalId}/reviewer`,
    { reviewerId },
  );
  return res.data;
};

/**
 * Ganti reviewer untuk proposal yang SUDAH terplot.
 * Endpoint: PUT /proposals/{id}/reviewer
 */
export const reassignReviewer = async (
  proposalId: number,
  reviewerId: number,
): Promise<ReassignReviewerResponse> => {
  assertValidProposalId(proposalId);
  if (!Number.isInteger(reviewerId) || reviewerId <= 0) {
    throw new Error("ID reviewer tidak valid.");
  }

  const res = await api.put<ReassignReviewerResponse>(
    `/proposals/${proposalId}/reviewer`,
    { reviewerId },
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

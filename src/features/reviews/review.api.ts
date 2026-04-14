import { api } from "@/services/api";
import { AssignReviewersResponse } from "./review.types";

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
    {
      reviewerIds,
    },
  );

  return res.data;
};

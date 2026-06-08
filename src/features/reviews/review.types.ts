// ─── Proposal Status ─────────────────────────────────────────────────────────
export type ProposalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ADMIN_VERIFIED"
  | "UNDER_REVIEW"
  | "REVISION"
  | "ACCEPTED"
  | "REJECTED";

// ─── Review Decision (only these 3 are allowed from reviewer) ────────────────
export type ReviewDecision = "ACCEPTED" | "REJECTED" | "REVISION";

// ─── Assigned Proposal (GET /proposals/assigned) ─────────────────────────────
export interface AssignedProposal {
  id: number;
  title: string;
  lead_researcher_id: number;
  user: {
    name: string;
    nidn_nip: string;
  };
  faculty: string;
  skema: string;
  funding_request_amount: number;
  status: ProposalStatus;
  proposal_file_path: string | null;
  rab_file_path: string | null;
  submitted_at: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface AssignedProposalMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface AssignedProposalsResponse {
  message: string;
  data: AssignedProposal[];
  meta: AssignedProposalMeta;
}

// ─── Evaluate Proposal (PUT /proposals/{id}/evaluate) ────────────────────────
export interface EvaluatePayloadDraft {
  is_draft: true;
  status?: ReviewDecision;
  score_perumusan?: number;
  score_tinjauan?: number;
  score_metode?: number;
  score_anggaran?: number;
  score_luaran?: number;
  kekuatan_proposal?: string;
  kelemahan_proposal?: string;
  rekomendasi_akhir?: string;
  notes?: string;
}

export interface EvaluatePayloadFinal {
  is_draft: false;
  status: ReviewDecision;
  score_perumusan: number;
  score_tinjauan: number;
  score_metode: number;
  score_anggaran: number;
  score_luaran: number;
  kekuatan_proposal: string;
  kelemahan_proposal: string;
  rekomendasi_akhir: string;
  notes?: string;
}

export type EvaluatePayload = EvaluatePayloadDraft | EvaluatePayloadFinal;

export interface ReviewRecord {
  id: number;
  proposal_id: number;
  reviewer_id: number;
  status: ProposalStatus;
  notes: string | null;
  score_perumusan: number | null;
  score_tinjauan: number | null;
  score_metode: number | null;
  score_anggaran: number | null;
  score_luaran: number | null;
  total_score: number | null;
  kekuatan_proposal: string | null;
  kelemahan_proposal: string | null;
  rekomendasi_akhir: string | null;
  created_at: string;
}

export interface EvaluateDraftResponse {
  message: string;
  data: ReviewRecord;
}

export interface EvaluateSubmitResponse {
  message: string;
  data: {
    review: ReviewRecord;
    proposal: AssignedProposal;
  };
}

export type EvaluateResponse = EvaluateDraftResponse | EvaluateSubmitResponse;

// ─── Review History (GET /proposals/{id}/reviews) ────────────────────────────
export interface ReviewHistoryItem extends ReviewRecord {
  reviewer: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ReviewHistoryResponse {
  message: string;
  data: ReviewHistoryItem[];
}

// ─── Legacy types (kept for backward compat) ─────────────────────────────────
export interface ReviewProposal {
  id: number;
  title: string;
  category: string;
  status: string;
  reviewer: string;
}

export interface ReviewerOption {
  id: number;
  name: string;
  email: string;
  role: "REVIEWER" | "REVIEWER_EKSTERNAL";
}

export interface AssignReviewersResponse {
  message: string;
  data: AssignedProposal;
}

export type ProposalStatus =
  | "REVIEW"
  | "SUBMITTED"
  | "APPROVED"
  | "DRAFT"
  | "REVISION";

export interface Proposal {
  id: number;
  title: string;
  lead_researcher_id: number;
  user?: {
    name: string;
    nidn_nip: string;
  } | null;
  faculty: string;
  skema: string;
  funding_request_amount: number;
  status: ProposalStatus;
  proposal_file_path: string | null;
  rab_file_path: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetAllProposalsResponse {
  message: string;
  data: Proposal[];
  meta: ProposalMeta;
}

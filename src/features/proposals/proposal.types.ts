export type ProposalStatus =
  | "REVIEW"
  | "SUBMITTED"
  | "APPROVED"
  | "DRAFT"
  | "REVISION"
  | "ADMIN_VERIFIED"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "ACCEPTED";

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
  sumber_data_penelitian?: string | null;
  instansi?: string | null;
  dosen_terlibat?: string | null;
  nidn_dosen_terlibat?: string | null;
  nama_anggota?: string | null;
  nim_anggota?: string | null;
  funding_request_amount: number;
  status: ProposalStatus;
  proposal_file_path: string | null;
  rab_file_path: string | null;
  file_info?: {
    proposal_file?: {
      previous_path?: string | null;
      previous_name?: string | null;
      current_path?: string | null;
      current_name?: string | null;
      replaced?: boolean;
    };
    rab_file?: {
      previous_path?: string | null;
      previous_name?: string | null;
      current_path?: string | null;
      current_name?: string | null;
      replaced?: boolean;
    };
  };
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  reviews?: Array<{
    id: number;
    status: string;
    rekomendasi_akhir?: string | null;
    kelemahan_proposal?: string | null;
    kekuatan_proposal?: string | null;
    notes?: string | null;
    created_at: string;
    reviewer?: {
      name: string;
    } | null;
  }> | null;
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

export interface GetProposalByIdResponse {
  message: string;
  data: Proposal;
}

export type ProposalStatusUpdate =
  | "ADMIN_VERIFIED"
  | "UNDER_REVIEW"
  | "REVISION"
  | "ACCEPTED"
  | "REJECTED";

export interface UpdateProposalStatusPayload {
  status: ProposalStatusUpdate;
  notes?: string;
}

export interface UpdateProposalStatusResponse {
  message: string;
  data: Proposal;
}

export interface UpsertProposalPayload {
  title?: string;
  faculty?: string;
  skema?: string;
  sumber_data_penelitian?: string;
  instansi?: string;
  funding_request_amount?: number | string;
  dosen_terlibat?: string;
  nidn_dosen_terlibat?: string;
  nama_anggota?: string;
  nim_anggota?: string;
  is_draft?: boolean;
  proposal_file?: File;
  rab_file?: File;
}

export interface DeleteProposalResponse {
  message: string;
}

export interface SubmitProposalResponse {
  message: string;
  data: Proposal;
}

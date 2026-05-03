import { ProposalStatus } from "./proposal.types";

export type DosenProposalStatusFilter = "ALL" | ProposalStatus;

export type ProposalFormValues = {
  title: string;
  faculty: string;
  prodi: string;
  skema: string;
  sumber_data_penelitian: string;
  instansi: string;
  funding_request_amount: string;
  proposal_file: File | null;
  rab_file: File | null;
};

export type ProposalFormMode = "create" | "edit";

export type ProposalApiError = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

export type FinanceDisbursementStatus =
  | "DISETUJUI"
  | "MENUNGGU_PERSETUJUAN"
  | "TERCAIRKAN"
  | "DITOLAK";

export interface FinanceProjectListItem {
  id: number;
  project_code: string | null;
  title: string;
  status: string;
  created_at: string;
  funding_request_amount: number;
  realized_amount: number;
  sisa_anggaran: number;
  disbursement_status: FinanceDisbursementStatus;
  disbursement_approved_at: string | null;
  disbursed_at: string | null;
  disbursement_note: string | null;
  transfer_proof_url: string | null;
  approved_by: string | null;
  disbursed_by: string | null;
  proposal: {
    id: number;
    title: string;
    skema: string;
    sumber_pendanaan: string | null;
    rab_file_path: string | null;
  };
  ketua: {
    id: number;
    name: string;
    nidn_nip: string | null;
    fakultas: string | null;
  };
}

export interface FinanceProjectDetail extends FinanceProjectListItem {
  summary: string | null;
  start_date: string | null;
  end_date: string | null;
  overall_progress: number;
}

export interface FinanceSummary {
  total_anggaran_hibah: number;
  dana_terserap: number;
  sisa_anggaran: number;
  jumlah_proyek: number;
  menunggu_persetujuan: number;
  disetujui: number;
  tercairkan: number;
}

export interface FinanceMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetFinanceProjectsParams {
  status?: FinanceDisbursementStatus | "";
  search?: string;
  skema?: string;
  tahun?: number | "";
  page?: number;
  limit?: number;
}

export interface FinanceSummaryResponse {
  message: string;
  data: FinanceSummary;
}

export interface FinanceProjectsResponse {
  message: string;
  data: FinanceProjectListItem[];
  meta: FinanceMeta;
}

export interface FinanceProjectDetailResponse {
  message: string;
  data: FinanceProjectDetail;
}

export interface FinanceProjectMutationResponse {
  message: string;
  data: FinanceProjectListItem;
}

export interface DisburseProjectPayload {
  realized_amount: number;
  note?: string;
  transfer_proof?: File | null;
}

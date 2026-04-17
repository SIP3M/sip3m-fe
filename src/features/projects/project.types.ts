export type MonitoringStatusFilter = "PENDING" | "SEDANG_BERJALAN" | "SELESAI";

export type CalculatedProjectStatus = "ON TRACK" | "DELAYED" | "COMPLETED";

export interface MonitoringProjectSummary {
  total_aktif: number;
  total_selesai: number;
  total_terlambat: number;
}

export interface MonitoringProjectListItem {
  id: number;
  project_code: string;
  title: string;
  status: MonitoringStatusFilter;
  created_at: string;
  user: {
    name: string;
  } | null;
  progress_percentage: number;
  milestone_berikutnya: string | null;
  calculated_status: CalculatedProjectStatus;
}

export interface MonitoringMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface MonitoringProjectsPayload {
  summary: MonitoringProjectSummary;
  data: MonitoringProjectListItem[];
  meta: MonitoringMeta;
}

export interface GetMonitoringProjectsResponse {
  message: string;
  data: MonitoringProjectsPayload;
}

export interface MonitoringMilestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  sequence: number;
  target_percentage: number;
  due_date: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE" | string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonitoringDocument {
  id: number;
  project_id: number;
  milestone_id: number | null;
  document_type: string;
  title: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  verification_status: "PENDING" | "APPROVED" | "REJECTED" | string;
  verification_notes: string | null;
  uploaded_by: number;
  uploaded_at: string;
}

export interface MonitoringProjectDetail {
  id: number;
  proposal_id: number;
  project_code: string;
  title: string;
  summary: string | null;
  start_date: string | null;
  end_date: string | null;
  overall_progress: number;
  status: MonitoringStatusFilter;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  disbursement_status: string;
  realized_amount: number;
  disbursed_at: string | null;
  user: {
    name: string;
    nidn_nip: string | null;
  } | null;
  progress_percentage: number;
  milestone_berikutnya: string | null;
  calculated_status: CalculatedProjectStatus;
  milestones: MonitoringMilestone[];
  documents: MonitoringDocument[];
}

export interface GetMonitoringProjectDetailResponse {
  message: string;
  data: MonitoringProjectDetail;
}

import { api } from "@/services/api";

/**
 * API verifikasi administrasi — dipakai role REVIEWER_ADMINISTRASI (dan Ketua
 * LPPM sebagai override). Semua endpoint dijaga izin
 * `proposal.verifikasi-administrasi` di backend.
 */
export type AdminVerificationDecision = "LOLOS" | "REVISI" | "TOLAK";

export type AdminVerificationDecisionDb =
  | "LOLOS"
  | "REVISI"
  | "TOLAK"
  | "TARIK_KEMBALI";

export interface AdminChecklistItem {
  kode: string;
  label: string;
  urut: number;
}

export interface AdminVerificationHistoryRow {
  id: number;
  decision: AdminVerificationDecisionDb;
  catatan: string | null;
  checklist: Array<{ kode: string; label: string; checked: boolean }> | null;
  created_at: string;
  verifier: { id: number; name: string };
}

export interface AdminQueueItem {
  id: number;
  title: string;
  lead_researcher_id: number;
  faculty: string | null;
  funding_request_amount: number;
  status: string;
  skema: string;
  proposal_file_path: string | null;
  rab_file_path: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  admin_verifier_id: number | null;
  admin_claimed_at: string | null;
  admin_verifier: { id: number; name: string } | null;
  user: { name: string; nidn_nip: string | null } | null;
  latest_admin_verification: {
    decision: AdminVerificationDecisionDb;
    catatan: string | null;
    created_at: string;
    verifier: { name: string };
  } | null;
  claimed_by_me: boolean;
}

export interface AdminQueueMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface AdminQueueResponse {
  message: string;
  data: AdminQueueItem[];
  meta: AdminQueueMeta;
}

export interface AdminVerificationStats {
  antrean: number;
  belum_diklaim: number;
  diklaim_saya: number;
  revisi: number;
  lolos_hari_ini: number;
  total_lolos: number;
}

export type AdminQueueFilter = "all" | "unclaimed" | "mine";

export const getAdminVerificationQueue = async (params?: {
  page?: number;
  search?: string;
  skema?: string;
  admin_status?: AdminQueueFilter;
}): Promise<AdminQueueResponse> => {
  const res = await api.get<AdminQueueResponse>(
    "/proposals/admin-verification/queue",
    {
      params: {
        page: params?.page ?? 1,
        search: params?.search?.trim() || undefined,
        skema: params?.skema?.trim() || undefined,
        admin_status:
          params?.admin_status && params.admin_status !== "all"
            ? params.admin_status
            : undefined,
      },
    },
  );

  return res.data;
};

export const getAdminVerificationChecklist = async () => {
  const res = await api.get<{ data: AdminChecklistItem[] }>(
    "/proposals/admin-verification/checklist",
  );
  return res.data.data;
};

export const getAdminVerificationStats = async () => {
  const res = await api.get<{ data: AdminVerificationStats }>(
    "/proposals/admin-verification/stats",
  );
  return res.data.data;
};

export const claimAdminVerification = async (proposalId: number) => {
  const res = await api.post<{ message: string }>(
    `/proposals/${proposalId}/admin-verification/claim`,
  );
  return res.data;
};

export const releaseAdminVerificationClaim = async (proposalId: number) => {
  const res = await api.delete<{ message: string }>(
    `/proposals/${proposalId}/admin-verification/claim`,
  );
  return res.data;
};

export const submitAdminVerification = async (
  proposalId: number,
  payload: {
    keputusan: AdminVerificationDecision;
    catatan?: string;
    checklist: Array<{ kode: string; checked: boolean }>;
  },
) => {
  const res = await api.post<{ message: string }>(
    `/proposals/${proposalId}/admin-verification`,
    payload,
  );
  return res.data;
};

export const revokeAdminVerification = async (
  proposalId: number,
  catatan?: string,
) => {
  const res = await api.post<{ message: string }>(
    `/proposals/${proposalId}/admin-verification/revoke`,
    { catatan },
  );
  return res.data;
};

export interface AdminHistoryResponse {
  message: string;
  data: Array<
    AdminVerificationHistoryRow & {
      proposal: { id: number; title: string } | null;
      verifier: { id: number; name: string };
    }
  >;
  meta: AdminQueueMeta;
}

export const getAdminVerificationHistory = async (params?: {
  page?: number;
  hanya_saya?: boolean;
}): Promise<AdminHistoryResponse> => {
  const res = await api.get<AdminHistoryResponse>(
    "/proposals/admin-verification/history",
    {
      params: {
        page: params?.page ?? 1,
        hanya_saya: params?.hanya_saya ? "true" : undefined,
      },
    },
  );

  return res.data;
};

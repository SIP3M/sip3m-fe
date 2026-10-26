import { api } from "@/services/api";

/**
 * API Audit Log (khusus ADMIN_SISTEM — guard di BE).
 *
 * - GET /audit-logs        — daftar + pagination + filter dropdown
 * - GET /audit-logs/export — unduh CSV (blob)
 */

export interface AuditLogRow {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_role: string | null;
  modul: string;
  aksi: string;
  objek: string;
  objek_id: string | null;
  ip: string | null;
  status: "SUCCESS" | "FAILED";
  created_at: string;
}

export interface AuditLogListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  /** Daftar nilai unik dari DB — untuk opsi dropdown filter. */
  filters: { moduls: string[]; aksis: string[] };
}

export interface AuditLogListResponse {
  data: AuditLogRow[];
  meta: AuditLogListMeta;
}

export interface AuditLogParams {
  q?: string;
  modul?: string;
  aksi?: string;
  status?: "SUCCESS" | "FAILED";
  page?: number;
  limit?: number;
}

/** Buang param kosong supaya tidak mengirim `q=` ke BE. */
const cleanParams = (
  params: AuditLogParams,
): Record<string, string | number> =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null,
    ),
  ) as Record<string, string | number>;

export const getAuditLogs = async (
  params: AuditLogParams,
): Promise<AuditLogListResponse> => {
  const res = await api.get<AuditLogListResponse>("/audit-logs", {
    params: cleanParams(params),
  });
  return res.data;
};

export const getAuditLogExport = async (
  params: AuditLogParams,
): Promise<Blob> => {
  const res = await api.get<Blob>("/audit-logs/export", {
    params: cleanParams(params),
    responseType: "blob",
  });
  return res.data;
};

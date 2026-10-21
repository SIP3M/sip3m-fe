import { api } from "@/services/api";
import type {
  GetKkmMonitoringResponse,
  KkmMonitoringParams,
} from "./kkmMonitoring.types";

const BASE = "/kkm/monitoring";

/**
 * Monitoring KKM (role: ADMIN_LPPM, STAFF_LPPM — 403 untuk lainnya).
 *
 * Query semua opsional (lihat `KkmMonitoringParams`):
 * - `periode_id` kosong → periode berstatus AKTIF terbaru
 * - `page` default 1 (meta mencerminkan hasil setelah filter)
 * - `status` enum, `desa` persis (case-insensitive), `dpl_id` int, `search` bebas
 *
 * @returns { periode, data, meta, stats, filters } — semua nilai turunan dari BE.
 */
export const getKkmMonitoring = async (
  params: KkmMonitoringParams = {},
): Promise<GetKkmMonitoringResponse> => {
  const query: Record<string, string | number | undefined> = {
    periode_id: params.periode_id,
    page: params.page ?? 1,
    search: params.search?.trim() || undefined,
    status: params.status,
    desa: params.desa?.trim() || undefined,
    dpl_id: params.dpl_id,
  };
  Object.keys(query).forEach(
    (key) => query[key] === undefined && delete query[key],
  );

  const res = await api.get<GetKkmMonitoringResponse>(BASE, { params: query });
  return res.data;
};

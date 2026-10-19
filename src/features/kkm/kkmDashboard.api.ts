import { api } from "@/services/api";
import type { GetKkmDashboardResponse } from "./kkmDashboard.types";

const BASE = "/dashboard/kkm";

/**
 * Dashboard KKM (role: ADMIN_LPPM, STAFF_LPPM).
 *
 * @param periodeId - Tanpa argumen → periode berstatus AKTIF.
 *                    Dengan argumen → periode itu (404 bila tidak ada,
 *                    400 bila bukan angka).
 */
export const getKkmDashboard = async (
  periodeId?: number,
): Promise<GetKkmDashboardResponse> => {
  const res = await api.get<GetKkmDashboardResponse>(BASE, {
    params: periodeId !== undefined ? { periode_id: periodeId } : {},
  });
  return res.data;
};

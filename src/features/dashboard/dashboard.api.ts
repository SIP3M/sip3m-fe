import { api } from "@/services/api";
import { GetAdminDashboardResponse } from "./dashboard.types";

export const getAdminDashboard = async (
  tahun?: number,
): Promise<GetAdminDashboardResponse> => {
  const res = await api.get<GetAdminDashboardResponse>("/dashboard/admin", {
    params: tahun !== undefined ? { tahun } : {},
  });
  return res.data;
};

import { api } from "@/services/api";
import {
  GetAdminDashboardResponse,
  GetStaffDashboardResponse,
} from "./dashboard.types";

export const getAdminDashboard = async (
  tahun?: number,
): Promise<GetAdminDashboardResponse> => {
  const res = await api.get<GetAdminDashboardResponse>("/dashboard/admin", {
    params: tahun !== undefined ? { tahun } : {},
  });
  return res.data;
};

export const getStaffDashboard =
  async (): Promise<GetStaffDashboardResponse> => {
    const res = await api.get<GetStaffDashboardResponse>("/dashboard/staff");
    return res.data;
  };

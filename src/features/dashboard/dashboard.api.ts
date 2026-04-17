import { api } from "@/services/api";
import { GetAdminDashboardResponse } from "./dashboard.types";

export const getAdminDashboard =
  async (): Promise<GetAdminDashboardResponse> => {
    const res = await api.get<GetAdminDashboardResponse>("/dashboard/admin");
    return res.data;
  };

import { api } from "@/services/api";
import {
  GetMonitoringProjectDetailResponse,
  GetMonitoringProjectsResponse,
  MonitoringStatusFilter,
} from "./project.types";

export interface GetMonitoringProjectsParams {
  page?: number;
  search?: string;
  statusFilter?: MonitoringStatusFilter;
}

export const getMonitoringProjects = async (
  params?: GetMonitoringProjectsParams,
): Promise<GetMonitoringProjectsResponse> => {
  const res = await api.get<GetMonitoringProjectsResponse>(
    "/monitoring/projects",
    {
      params: {
        page: params?.page ?? 1,
        search: params?.search?.trim() || undefined,
        statusFilter: params?.statusFilter || undefined,
      },
    },
  );

  return res.data;
};

export const getMonitoringProjectById = async (
  id: number,
): Promise<GetMonitoringProjectDetailResponse> => {
  const res = await api.get<GetMonitoringProjectDetailResponse>(
    `/monitoring/projects/${id}`,
  );

  return res.data;
};

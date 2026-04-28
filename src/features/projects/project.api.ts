import { api } from "@/services/api";
import {
  GetMonitoringProjectDetailResponse,
  GetMonitoringProjectsResponse,
  MonitoringStatusFilter,
  GetPengabdianProjectsResponse,
  UploadMilestoneDocumentsResponse,
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

// ─── Pengabdian (Dosen) ────────────────────────────────────────────────────────────────────────────

export interface GetPengabdianProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  is_archived?: boolean;
}

export const getPengabdianProjects = async (
  params?: GetPengabdianProjectsParams,
): Promise<GetPengabdianProjectsResponse> => {
  const res = await api.get<GetPengabdianProjectsResponse>(
    "/pengabdian/projects",
    {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search?.trim() || undefined,
        is_archived: params?.is_archived ?? false,
      },
    },
  );
  return res.data;
};

export const uploadMilestoneDocuments = async (
  projectId: number,
  milestoneId: number,
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<UploadMilestoneDocumentsResponse> => {
  const res = await api.post<UploadMilestoneDocumentsResponse>(
    `/pengabdian/projects/${projectId}/milestones/${milestoneId}/documents`,
    formData,
    {
      headers: {
        // Let browser set Content-Type with boundary automatically
        "Content-Type": undefined as unknown as string,
      },
      onUploadProgress,
    },
  );
  return res.data;
};

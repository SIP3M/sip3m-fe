import { api } from "@/services/api";
import {
  DisburseProjectPayload,
  FinanceProjectDetailResponse,
  FinanceProjectMutationResponse,
  FinanceProjectsResponse,
  FinanceSummaryResponse,
  GetFinanceProjectsParams,
} from "./finance.types";

const buildParams = (params?: GetFinanceProjectsParams) => ({
  status: params?.status || undefined,
  search: params?.search?.trim() || undefined,
  skema: params?.skema?.trim() || undefined,
  tahun: params?.tahun ? params.tahun : undefined,
  page: params?.page ?? 1,
  limit: params?.limit ?? 10,
});

/** Ringkasan anggaran untuk kartu dashboard keuangan. */
export const getFinanceSummary = async (): Promise<FinanceSummaryResponse> => {
  const res = await api.get<FinanceSummaryResponse>("/finances/summary");
  return res.data;
};

/** Daftar proyek yang sudah punya anggaran (proposal ACCEPTED). */
export const getFinanceProjects = async (
  params?: GetFinanceProjectsParams,
): Promise<FinanceProjectsResponse> => {
  const res = await api.get<FinanceProjectsResponse>("/finances/projects", {
    params: buildParams(params),
  });
  return res.data;
};

export const getFinanceProjectById = async (
  projectId: number,
): Promise<FinanceProjectDetailResponse> => {
  const res = await api.get<FinanceProjectDetailResponse>(
    `/finances/projects/${projectId}`,
  );
  return res.data;
};

/** KETUA_LPPM: setujui anggaran proyek sebelum pencairan dapat diinput. */
export const approveProjectFunding = async (
  projectId: number,
): Promise<FinanceProjectMutationResponse> => {
  const res = await api.patch<FinanceProjectMutationResponse>(
    `/finances/projects/${projectId}/approve`,
  );
  return res.data;
};

/** KEUANGAN: input/edit nominal dana cair + catatan + bukti transfer opsional. */
export const disburseProject = async (
  projectId: number,
  payload: DisburseProjectPayload,
): Promise<FinanceProjectMutationResponse> => {
  const formData = new FormData();
  formData.append("realized_amount", String(payload.realized_amount));
  if (payload.note?.trim()) formData.append("note", payload.note.trim());
  if (payload.transfer_proof) {
    formData.append("transfer_proof", payload.transfer_proof);
  }

  const res = await api.patch<FinanceProjectMutationResponse>(
    `/finances/projects/${projectId}/disburse`,
    formData,
    {
      headers: {
        // Biarkan browser menetapkan boundary multipart.
        "Content-Type": undefined as unknown as string,
      },
    },
  );
  return res.data;
};

/** Unduh rekap keuangan (xlsx) sesuai filter yang aktif. */
export const downloadFinanceExcel = async (
  params?: GetFinanceProjectsParams,
): Promise<void> => {
  const res = await api.get<Blob>("/finances/export/excel", {
    params: buildParams(params),
    responseType: "blob",
  });

  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Rekap_Keuangan.xlsx";
  link.click();
  URL.revokeObjectURL(url);
};

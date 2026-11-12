import { api } from "@/services/api";
import type {
  BulkApprovePayload,
  BulkApproveResponse,
  GetLaporanDetailResponse,
  GetLaporanIndividuResponse,
  GetLaporanKelompokResponse,
  GetLaporanListResponse,
  KkmLaporanParams,
  ReviewLaporanPayload,
  ReviewLaporanResponse,
  UploadLaporanIndividuResponse,
  UploadLaporanKelompokResponse,
} from "./kkmLaporan.types";

const BASE = "/kkm";

// ─── LAPORAN INDIVIDU ─────────────────────────────────────────────────────────

/** GET /kkm/laporan/individu/me — status jendela + berkas milik mahasiswa */
export const getLaporanIndividu =
  async (): Promise<GetLaporanIndividuResponse> => {
    const res = await api.get<GetLaporanIndividuResponse>(
      `${BASE}/laporan/individu/me`,
    );
    return res.data;
  };

/** POST /kkm/laporan/individu — unggah / ganti laporan individu (1 PDF) */
export const uploadLaporanIndividu = async (
  file: File,
): Promise<UploadLaporanIndividuResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<UploadLaporanIndividuResponse>(
    `${BASE}/laporan/individu`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

// ─── LAPORAN KELOMPOK ─────────────────────────────────────────────────────────

/** GET /kkm/laporan/kelompok/me — status jendela + dokumen LAPORAN_AKHIR */
export const getLaporanKelompok =
  async (): Promise<GetLaporanKelompokResponse> => {
    const res = await api.get<GetLaporanKelompokResponse>(
      `${BASE}/laporan/kelompok/me`,
    );
    return res.data;
  };

/** POST /kkm/kelompok/:id/laporan — ketua/sekretaris (dicek di BE); field `jenis` (default LAPORAN_AKHIR) */
export const uploadLaporanKelompok = async (
  kelompokId: number,
  file: File,
  jenis: "LAPORAN_AWAL" | "LAPORAN_MINGGUAN" | "LAPORAN_AKHIR" = "LAPORAN_AKHIR",
): Promise<UploadLaporanKelompokResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jenis", jenis);
  const res = await api.post<UploadLaporanKelompokResponse>(
    `${BASE}/kelompok/${kelompokId}/laporan`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

// ─── ADMIN / DPL — DAFTAR & REVIEW LAPORAN ────────────────────────────────────

/**
 * GET /kkm/laporan — daftar laporan lintas kelompok + stats + opsi filter.
 *
 * Role DOSEN (DPL) otomatis dibatasi kelompok bimbingan **di server**.
 * Query semua opsional (lihat `KkmLaporanParams`); `periode_id` kosong →
 * periode AKTIF terbaru. Stats & opsi filter dihitung dari seluruh baris
 * scope (sebelum filter tab/search).
 */
export const getLaporanList = async (
  params: KkmLaporanParams = {},
): Promise<GetLaporanListResponse> => {
  const query: Record<string, string | number | undefined> = {
    periode_id: params.periode_id,
    page: params.page ?? 1,
    search: params.search?.trim() || undefined,
    status: params.status,
    jenis: params.jenis,
    desa: params.desa?.trim() || undefined,
    dpl_id: params.dpl_id,
  };
  Object.keys(query).forEach(
    (key) => query[key] === undefined && delete query[key],
  );
  const res = await api.get<GetLaporanListResponse>(`${BASE}/laporan`, {
    params: query,
  });
  return res.data;
};

/** GET /kkm/laporan/detail?kelompok_id=&jenis= — satu baris + URL file. */
export const getLaporanDetail = async (
  kelompokId: number,
  jenis: string,
): Promise<GetLaporanDetailResponse> => {
  const res = await api.get<GetLaporanDetailResponse>(`${BASE}/laporan/detail`, {
    params: { kelompok_id: kelompokId, jenis },
  });
  return res.data;
};

/** PATCH /kkm/laporan/review — DISETUJUI / REVISI (catatan wajib saat REVISI). */
export const reviewLaporan = async (
  payload: ReviewLaporanPayload,
): Promise<ReviewLaporanResponse> => {
  const res = await api.patch<ReviewLaporanResponse>(
    `${BASE}/laporan/review`,
    payload,
  );
  return res.data;
};

/** POST /kkm/laporan/bulk-approve — setujui massal (maks 200 baris). */
export const bulkApproveLaporan = async (
  payload: BulkApprovePayload,
): Promise<BulkApproveResponse> => {
  const res = await api.post<BulkApproveResponse>(
    `${BASE}/laporan/bulk-approve`,
    payload,
  );
  return res.data;
};

/** GET /kkm/laporan/export — Excel sesuai filter aktif (blob). */
export const exportLaporanExcel = async (
  params: KkmLaporanParams = {},
): Promise<Blob> => {
  const query: Record<string, string | number | undefined> = {
    periode_id: params.periode_id,
    search: params.search?.trim() || undefined,
    status: params.status,
    jenis: params.jenis,
    desa: params.desa?.trim() || undefined,
    dpl_id: params.dpl_id,
  };
  Object.keys(query).forEach(
    (key) => query[key] === undefined && delete query[key],
  );
  const res = await api.get<Blob>(`${BASE}/laporan/export`, {
    params: query,
    responseType: "blob" as const,
  });
  return res.data;
};

/** GET /kkm/laporan/zip — ZIP semua file PDF sesuai filter aktif (blob). */
export const downloadLaporanZip = async (
  params: KkmLaporanParams = {},
): Promise<Blob> => {
  const query: Record<string, string | number | undefined> = {
    periode_id: params.periode_id,
    search: params.search?.trim() || undefined,
    status: params.status,
    jenis: params.jenis,
    desa: params.desa?.trim() || undefined,
    dpl_id: params.dpl_id,
  };
  Object.keys(query).forEach(
    (key) => query[key] === undefined && delete query[key],
  );
  const res = await api.get<Blob>(`${BASE}/laporan/zip`, {
    params: query,
    responseType: "blob" as const,
  });
  return res.data;
};

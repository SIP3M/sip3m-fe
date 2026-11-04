import { api } from "@/services/api";
import type {
  CreatePengumumanPayload,
  GetPengumumanAdminResponse,
  Pengumuman,
  PengumumanListParams,
  PengumumanMessageResponse,
  UpdatePengumumanPayload,
} from "./pengumuman.types";

const ADMIN_BASE = "/kkm/pengumuman";
const READER_BASE = "/pengumuman";

// ─── ADMIN (ADMIN_LPPM; baca juga STAFF/ADMIN_SISTEM) ───────────────────────

/** GET /kkm/pengumuman — daftar + stats + paginasi */
export const getPengumumanAdmin = async (
  params: PengumumanListParams = {},
): Promise<GetPengumumanAdminResponse> => {
  const cleaned: Record<string, string | number | undefined> = {
    page: params.page ?? 1,
    search: params.search?.trim() || undefined,
    kategori: params.kategori || undefined,
    prioritas: params.prioritas || undefined,
    status: params.status || undefined,
    audiens: params.audiens || undefined,
  };
  Object.keys(cleaned).forEach(
    (k) => cleaned[k] === undefined && delete cleaned[k],
  );
  const res = await api.get<GetPengumumanAdminResponse>(ADMIN_BASE, {
    params: cleaned,
  });
  return res.data;
};

/** POST /kkm/pengumuman — multipart (targets dikirim sebagai JSON string) */
export const createPengumuman = async (
  payload: CreatePengumumanPayload,
): Promise<{ message: string; data: Pengumuman }> => {
  const fd = new FormData();
  fd.append("judul", payload.judul);
  fd.append("isi", payload.isi);
  fd.append("kategori", payload.kategori);
  fd.append("prioritas", payload.prioritas);
  fd.append("targets", JSON.stringify(payload.targets));
  fd.append("publish_mode", payload.publish_mode);
  if (payload.publish_mode === "scheduled" && payload.scheduled_at) {
    fd.append("scheduled_at", payload.scheduled_at);
  }
  if (payload.lampiran) fd.append("lampiran", payload.lampiran);

  const res = await api.post<{ message: string; data: Pengumuman }>(
    ADMIN_BASE,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

/** GET /kkm/pengumuman/:id */
export const getPengumumanDetail = async (
  id: number | string,
): Promise<{ message: string; data: Pengumuman }> => {
  const res = await api.get<{ message: string; data: Pengumuman }>(
    `${ADMIN_BASE}/${id}`,
  );
  return res.data;
};

/** PATCH /kkm/pengumuman/:id */
export const updatePengumuman = async (
  id: number | string,
  payload: UpdatePengumumanPayload,
): Promise<{ message: string; data: Pengumuman }> => {
  const res = await api.patch<{ message: string; data: Pengumuman }>(
    `${ADMIN_BASE}/${id}`,
    payload,
  );
  return res.data;
};

/** PATCH /kkm/pengumuman/:id/pin */
export const togglePinPengumuman = async (
  id: number | string,
): Promise<{ message: string; data: { id: number; is_pinned: boolean } }> => {
  const res = await api.patch<{
    message: string;
    data: { id: number; is_pinned: boolean };
  }>(`${ADMIN_BASE}/${id}/pin`);
  return res.data;
};

/** PATCH /kkm/pengumuman/:id/publish — terbitkan sekarang */
export const publishPengumuman = async (
  id: number | string,
): Promise<{ message: string; data: Pengumuman }> => {
  const res = await api.patch<{ message: string; data: Pengumuman }>(
    `${ADMIN_BASE}/${id}/publish`,
  );
  return res.data;
};

/** DELETE /kkm/pengumuman/:id */
export const deletePengumuman = async (
  id: number | string,
): Promise<PengumumanMessageResponse> => {
  const res = await api.delete<PengumumanMessageResponse>(
    `${ADMIN_BASE}/${id}`,
  );
  return res.data;
};

// ─── PENERIMA (mahasiswa / dosen / semua role login) ────────────────────────

/** GET /pengumuman — yang menyasar saya, lengkap dengan read_at */
export const getPengumumanSaya = async (): Promise<{
  message: string;
  data: Pengumuman[];
}> => {
  const res = await api.get<{ message: string; data: Pengumuman[] }>(
    READER_BASE,
  );
  return res.data;
};

/** GET /pengumuman/:id */
export const getPengumumanSayaDetail = async (
  id: number | string,
): Promise<{ message: string; data: Pengumuman }> => {
  const res = await api.get<{ message: string; data: Pengumuman }>(
    `${READER_BASE}/${id}`,
  );
  return res.data;
};

/** POST /pengumuman/:id/read — tandai sudah dibaca */
export const markPengumumanRead = async (
  id: number | string,
): Promise<{ message: string; data: { read_at: string | null } }> => {
  const res = await api.post<{
    message: string;
    data: { read_at: string | null };
  }>(`${READER_BASE}/${id}/read`);
  return res.data;
};

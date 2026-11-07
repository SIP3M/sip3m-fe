import { api } from "@/services/api";
import type {
  GetLaporanIndividuResponse,
  GetLaporanKelompokResponse,
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

/** POST /kkm/kelompok/:id/laporan — ketua/sekretaris (dicek di BE) */
export const uploadLaporanKelompok = async (
  kelompokId: number,
  file: File,
): Promise<UploadLaporanKelompokResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<UploadLaporanKelompokResponse>(
    `${BASE}/kelompok/${kelompokId}/laporan`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

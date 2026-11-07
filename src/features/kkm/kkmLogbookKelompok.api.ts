import { api } from "@/services/api";
import type {
  GetLogbookKelompokSayaResponse,
  UploadLogbookKelompokResponse,
} from "./kkmLogbookKelompok.types";

const BASE = "/kkm";

/** GET /kkm/logbook-kelompok/me — jadwal mingguan + riwayat milik mahasiswa */
export const getLogbookKelompokSaya =
  async (): Promise<GetLogbookKelompokSayaResponse> => {
    const res = await api.get<GetLogbookKelompokSayaResponse>(
      `${BASE}/logbook-kelompok/me`,
    );
    return res.data;
  };

/**
 * POST /kkm/kelompok/:id/logbook-kelompok — unggah PDF mingguan.
 * Hanya Ketua/Sekretaris yang diterima (dicek di BE).
 * Upload ulang menimpa minggu yang sama selama belum lewat deadline.
 */
export const uploadLogbookKelompok = async (
  kelompokId: number,
  mingguKe: number,
  file: File,
): Promise<UploadLogbookKelompokResponse> => {
  const formData = new FormData();
  formData.append("minggu_ke", String(mingguKe));
  formData.append("file", file);
  const res = await api.post<UploadLogbookKelompokResponse>(
    `${BASE}/kelompok/${kelompokId}/logbook-kelompok`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

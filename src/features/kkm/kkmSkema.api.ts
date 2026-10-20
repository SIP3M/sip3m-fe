import { api } from "@/services/api";
import type { GetKkmSkemaResponse, KkmSkemaParams } from "./kkmSkema.types";

const BASE = "/kkm/skema";

/**
 * Daftar skema KKM yang pendaftarannya terbuka (role: MAHASISWA;
 * ADMIN_LPPM & STAFF_LPPM juga boleh untuk preview).
 *
 * Query opsional:
 * - `jenis`  → REGULER | TEMATIK (filter tab)
 * - `wilayah` → cocokkan SEBAGIAN kabupaten, case-insensitive
 *
 * `stats`/`filters` selalu global (tidak ikut query) — diverifikasi live.
 */
export const getKkmSkema = async (
  params: KkmSkemaParams = {},
): Promise<GetKkmSkemaResponse> => {
  const query: Record<string, string> = {};
  if (params.jenis) query.jenis = params.jenis;
  if (params.wilayah?.trim()) query.wilayah = params.wilayah.trim();

  const res = await api.get<GetKkmSkemaResponse>(BASE, { params: query });
  return res.data;
};

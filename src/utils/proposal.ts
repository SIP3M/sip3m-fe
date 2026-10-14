// Opsi B: ketua eksplisit per Peran, fallback ke peng-upload untuk proposal lama
export type KetuaSource = {
  nama_ketua?: string | null;
  nidn_ketua?: string | null;
  user?: { name: string; nidn_nip?: string | null } | null;
};

export const getKetuaNama = (p: KetuaSource): string => {
  const v = p.nama_ketua?.trim();
  if (v) return v;
  return p.user?.name ?? "-";
};

export const getKetuaNidn = (p: KetuaSource): string => {
  const v = p.nidn_ketua?.trim();
  if (v) return v;
  return p.user?.nidn_nip ?? "-";
};

export const isKetuaDiffFromUploader = (p: KetuaSource): boolean => {
  const ketua = p.nama_ketua?.trim();
  if (!ketua) return false;
  return ketua !== p.user?.name;
};

// ─── Anti-double helpers (BE commit f0be231) ───────────────────────────────
export const normalizeNama = (s: string): string =>
  s.trim().replace(/\s+/g, " ").toLowerCase();

export const normalizeNidn = (s: string): string => s.trim().toLowerCase();
export const normalizeNim = (s: string): string => s.trim().toLowerCase();

/** Split string that may contain , ; or newline separated values */
export const splitList = (s: string): string[] =>
  s
    .split(/[,;\n]+/g)
    .map((t) => t.trim())
    .filter(Boolean);

export const findDuplicateValues = (values: string[]): string | null => {
  const seen = new Set<string>();
  for (const v of values) {
    const key = normalizeNama(v);
    if (!key) continue;
    if (seen.has(key)) return v;
    seen.add(key);
  }
  return null;
};

export const findDuplicateNidn = (values: string[]): string | null => {
  const seen = new Set<string>();
  for (const v of values) {
    const key = normalizeNidn(v);
    if (!key) continue;
    if (seen.has(key)) return v;
    seen.add(key);
  }
  return null;
};

// ─── BE tim limit 5 (Opsi A: 5 dosen + 5 mahasiswa terpisah) ───────────────────
export const TIM_DOSEN_MAX = 5;
export const TIM_MHS_MAX = 5;

/** Jumlah token setelah split ,;\n (shared dengan BE superRefine) */
export const countTokens = (raw: string): number => splitList(raw).length;

export const getTimDosenLimitErrors = (dosenTerlibatRaw: string, nidnRaw: string): Record<string, string> => {
  const errs: Record<string, string> = {};
  const dosenCount = splitList(dosenTerlibatRaw).length;
  const nidnCount = splitList(nidnRaw).length;
  if (dosenCount > TIM_DOSEN_MAX) {
    errs.dosen_terlibat = `Maksimal ${TIM_DOSEN_MAX} dosen terlibat. Saat ini ${dosenCount}.`;
  }
  if (nidnCount > TIM_DOSEN_MAX) {
    errs.nidn_dosen_terlibat = `Maksimal ${TIM_DOSEN_MAX} NIDN. Saat ini ${nidnCount}.`;
  }
  const dosenHas = dosenCount > 0;
  const nidnHas = nidnCount > 0;
  if (dosenHas && nidnHas && dosenCount !== nidnCount) {
    errs.nidn_dosen_terlibat = `Jumlah NIDN (${nidnCount}) harus sama dengan jumlah dosen (${dosenCount}) — berpasangan urut.`;
  }
  return errs;
};

export const getTimMhsLimitErrors = (namaRaw: string, nimRaw: string): Record<string, string> => {
  const errs: Record<string, string> = {};
  const namaCount = splitList(namaRaw).length;
  const nimCount = splitList(nimRaw).length;
  if (namaCount > TIM_MHS_MAX) {
    errs.nama_anggota = `Maksimal ${TIM_MHS_MAX} mahasiswa. Saat ini ${namaCount}.`;
  }
  if (nimCount > TIM_MHS_MAX) {
    errs.nim_anggota = `Maksimal ${TIM_MHS_MAX} NIM. Saat ini ${nimCount}.`;
  }
  const namaHas = namaCount > 0;
  const nimHas = nimCount > 0;
  if (namaHas && nimHas && namaCount !== nimCount) {
    errs.nim_anggota = `Jumlah NIM (${nimCount}) harus sama dengan jumlah mahasiswa (${namaCount}) — berpasangan urut.`;
  }
  return errs;
};

export type RowLike = { nama?: string; nidn?: string; nim?: string };
export const getRowCounts = (rows: RowLike[]): { dosen: number; nidn: number; namaMhs: number; nim: number } => {
  const dosenTokens: string[] = [];
  const nidnTokens: string[] = [];
  const namaTokens: string[] = [];
  const nimTokens: string[] = [];
  for (const r of rows as any[]) {
    if (typeof r.nama === "string") namaTokens.push(...splitList(r.nama));
    if (typeof r.nidn === "string") nidnTokens.push(...splitList(r.nidn));
    if (typeof r.nim === "string") nimTokens.push(...splitList(r.nim));
  }
  return {
    dosen: namaTokens.length || (rows as any[]).filter((r) => (r.nama || "").trim()).length,
    nidn: nidnTokens.length || (rows as any[]).filter((r) => (r.nidn || "").trim()).length,
    namaMhs: namaTokens.length,
    nim: nimTokens.length,
  };
};

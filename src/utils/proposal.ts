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

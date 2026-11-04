/**
 * Util pengumuman KKM — parser **bold** sederhana tanpa library markdown,
 * plus pemformat tanggal & ringkasan isi untuk kartu daftar.
 */

export interface TeksSegment {
  text: string;
  bold: boolean;
}

export interface TeksParagraf {
  segments: TeksSegment[];
}

const BOLD_PATTERN = /\*\*([^*]+)\*\*/g;

/**
 * Pecah isi pengumuman jadi paragraf + segment (teks biasa / teks tebal).
 * Baris kosong = pemisah paragraf; `**teks**` = tebal.
 */
export function parseIsiPengumuman(isi: string): TeksParagraf[] {
  const paragraphs = isi.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return paragraphs
    .map((raw) => {
      const line = raw.replace(/\n/g, " ").trim();
      if (!line) return { segments: [] };

      const segments: TeksSegment[] = [];
      let cursor = 0;

      for (const match of line.matchAll(BOLD_PATTERN)) {
        const index = match.index ?? 0;
        if (index > cursor) {
          segments.push({ text: line.slice(cursor, index), bold: false });
        }
        segments.push({ text: match[1], bold: true });
        cursor = index + match[0].length;
      }
      if (cursor < line.length) {
        segments.push({ text: line.slice(cursor), bold: false });
      }

      return { segments };
    })
    .filter((p) => p.segments.length > 0);
}

/** Ringkasan satu baris untuk kartu daftar (format ** dihapus). */
export function ringkasIsi(isi: string, max = 160): string {
  const flat = isi.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1)}…`;
}

/** "2026-01-20T00:00:00.000Z" → "20 Jan 2026" */
export function formatTanggalPengumuman(iso?: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "2026-01-20T08:00:00.000Z" → "08.00 WIB" */
export function formatJamPengumuman(iso?: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} WIB`;
}

/** Format ukuran file lampiran: 204800 → "200 KB" */
export function formatUkuranFile(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "-";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

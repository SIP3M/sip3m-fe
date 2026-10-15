import type { ReactNode } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { KkmKelompokKomposisi, KkmKelompokStatus } from "./kkmKelompok.types";

/** Pesan error BE (axios) — prioritaskan errors[field] pertama, lalu message. */
export const getKkmErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errors?: Record<string, string[] | string> }
      | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first[0]) return first[0];
      if (typeof first === "string" && first) return first;
    }
    if (err.response?.status === 403) return "Akses ditolak. Hanya ADMIN LPPM.";
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

const STATUS_STYLE: Record<KkmKelompokStatus, { label: string; className: string }> = {
  AKTIF: { label: "Aktif", className: "bg-green-50 text-green-700 border-green-200" },
  BELUM_LENGKAP: {
    label: "Belum Lengkap",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  BERMASALAH: { label: "Bermasalah", className: "bg-red-50 text-red-700 border-red-200" },
};

/** Badge status kelompok — label & warna, nilainya tetap dari BE (derived). */
export function KelompokStatusBadge({ status }: { status: KkmKelompokStatus }) {
  const style = STATUS_STYLE[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };
  const icon =
    status === "AKTIF" ? (
      <CheckCircle2 size={12} />
    ) : status === "BELUM_LENGKAP" ? (
      <Clock3 size={12} />
    ) : (
      <AlertTriangle size={12} />
    );
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {icon}
      {style.label}
    </span>
  );
}

const KOMPOSISI_STYLE: Record<KkmKelompokKomposisi, { label: string; className: string }> = {
  SEIMBANG: { label: "Komposisi Seimbang", className: "bg-green-50 text-green-700 border-green-200" },
  DOMINASI: { label: "Komposisi Dominasi", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PERLU_PENYESUAIAN: {
    label: "Komposisi Perlu Penyesuaian",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function KomposisiBadge({ komposisi }: { komposisi: KkmKelompokKomposisi }) {
  const style = KOMPOSISI_STYLE[komposisi] ?? {
    label: komposisi,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {komposisi === "SEIMBANG" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
      {style.label}
    </span>
  );
}

/** Warna progres dari BE: ≥80 hijau, 50–80 kuning, <50 merah. */
export const getFilledBarColor = (percent: number): string => {
  if (percent >= 80) return "bg-green-500";
  if (percent >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

export const getFilledBarTrack = (percent: number): string => {
  if (percent >= 80) return "bg-green-100";
  if (percent >= 50) return "bg-yellow-100";
  return "bg-red-100";
};

export function FilledProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(percent || 0)));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${getFilledBarTrack(safe)} ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${getFilledBarColor(safe)}`}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

export function GenderCount({
  laki,
  perempuan,
}: {
  laki: number;
  perempuan: number;
}) {
  return (
    <span className="inline-flex items-center gap-3 text-xs text-gray-600">
      <span className="inline-flex items-center gap-1" title="Laki-laki">
        <span className="text-blue-600">♂</span>
        <span className="font-semibold">{laki}</span>
      </span>
      <span className="inline-flex items-center gap-1" title="Perempuan">
        <span className="text-pink-600">♀</span>
        <span className="font-semibold">{perempuan}</span>
      </span>
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-gray-500">
      <span className="text-gray-300">{icon}</span>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

import { FinanceDisbursementStatus } from "./finance.types";

const STATUS_LABEL: Record<FinanceDisbursementStatus, string> = {
  MENUNGGU_PERSETUJUAN: "Menunggu Persetujuan",
  DISETUJUI: "Disetujui",
  TERCAIRKAN: "Tercairkan",
  DITOLAK: "Ditolak",
};

const STATUS_CLASS: Record<FinanceDisbursementStatus, string> = {
  MENUNGGU_PERSETUJUAN: "bg-yellow-100 text-yellow-700",
  DISETUJUI: "bg-blue-100 text-blue-700",
  TERCAIRKAN: "bg-green-100 text-green-700",
  DITOLAK: "bg-red-100 text-red-700",
};

export const statusLabel = (status: FinanceDisbursementStatus | string) =>
  STATUS_LABEL[status as FinanceDisbursementStatus] ?? status;

export const statusClass = (status: FinanceDisbursementStatus | string) =>
  STATUS_CLASS[status as FinanceDisbursementStatus] ??
  "bg-gray-100 text-gray-600";

export const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/** URL dokumen RAB/bukti: pakai URL absolut bila sudah berupa http(s). */
export const toFileUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ??
    "https://sip3m-be.vercel.app";
  return `${base}/${path.replace(/^\/+/, "")}`;
};

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardList,
} from "lucide-react";
import {
  getAuditLogs,
  getAuditLogExport,
  type AuditLogListMeta,
  type AuditLogRow,
} from "./audit.api";

const LIMIT = 20;

// =============================================
// Format & badge
// =============================================

const pad = (n: number): string => String(n).padStart(2, "0");

/** ISO → "2026-01-15 10:23:41" (waktu lokal browser) */
const fmtTs = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const AKSI_BADGE: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-600",
  LOGIN: "bg-indigo-100 text-indigo-700",
  LOGOUT: "bg-slate-100 text-slate-600",
  REGISTER: "bg-teal-100 text-teal-700",
  ACTIVATE: "bg-teal-100 text-teal-700",
  DEACTIVATE: "bg-orange-100 text-orange-700",
  UPLOAD: "bg-purple-100 text-purple-700",
  EXPORT: "bg-amber-100 text-amber-700",
  BACKUP: "bg-gray-200 text-gray-600",
};

const aksiClass = (aksi: string): string =>
  AKSI_BADGE[aksi] ?? "bg-gray-100 text-gray-600";

// =============================================
// Halaman
// =============================================

export default function AuditLogPage() {
  // filter
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [modul, setModul] = useState("");
  const [aksi, setAksi] = useState("");
  const [status, setStatus] = useState<"" | "SUCCESS" | "FAILED">("");

  // data
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [meta, setMeta] = useState<AuditLogListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [detail, setDetail] = useState<AuditLogRow | null>(null);

  // debounce pencarian
  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAuditLogs({
        q,
        modul,
        aksi,
        status: status || undefined,
        page,
        limit: LIMIT,
      });
      setRows(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      const e = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      const s = e.response?.status;
      setError(
        s === 401
          ? "Sesi berakhir, silakan login ulang."
          : s === 403
            ? "Akses ditolak — halaman ini khusus Admin Sistem."
            : e.response?.data?.message ||
              e.message ||
              "Gagal memuat audit log.",
      );
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [q, modul, aksi, status, page]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const resetFilters = () => {
    setQInput("");
    setQ("");
    setModul("");
    setAksi("");
    setStatus("");
    setPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await getAuditLogExport({
        q,
        modul,
        aksi,
        status: status || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Gagal mengunduh file CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilter = Boolean(qInput || modul || aksi || status);
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const fromRow = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const toRow = Math.min(page * LIMIT, total);

  const modulOptions = meta?.filters.moduls ?? [];
  const aksiOptions = meta?.filters.aksis ?? [];

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="mt-1 text-sm text-gray-500">
            Rekam jejak seluruh aktivitas dan perubahan dalam sistem LPPM
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-75"
        >
          <Download size={16} />
          {isExporting ? "Menyiapkan..." : "Export Log"}
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 bg-white">
            <Search size={16} className="shrink-0 text-gray-400" />
            <input
              type="text"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Cari objek atau pengguna..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
            <SelectFilter
              value={modul}
              onChange={(v) => {
                setModul(v);
                setPage(1);
              }}
              allLabel="Semua Modul"
              options={modulOptions}
            />
            <SelectFilter
              value={aksi}
              onChange={(v) => {
                setAksi(v);
                setPage(1);
              }}
              allLabel="Semua Aksi"
              options={aksiOptions}
            />
            <SelectFilter
              value={status}
              onChange={(v) => {
                setStatus(v as "" | "SUCCESS" | "FAILED");
                setPage(1);
              }}
              allLabel="Semua Status"
              options={[
                { value: "SUCCESS", label: "Berhasil" },
                { value: "FAILED", label: "Gagal" },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilter}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Modul</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Objek</th>
                <th className="px-6 py-4">IP</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-4 py-4" aria-label="Aksi" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    Memuat audit log...
                  </td>
                </tr>
              )}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center">
                    <ClipboardList size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">
                      {hasFilter
                        ? "Tidak ada log yang cocok dengan filter."
                        : "Belum ada audit log."}
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {fmtTs(r.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {r.user_name ?? "System"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.user_role ?? "System"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                      {r.modul}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${aksiClass(r.aksi)}`}
                      >
                        {r.aksi}
                      </span>
                    </td>
                    <td className="max-w-md px-6 py-4 text-gray-700">
                      <span className="line-clamp-2" title={r.objek}>
                        {r.objek}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-500">
                      {r.ip ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {r.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          <span aria-hidden>✓</span> Berhasil
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                          <span aria-hidden>✕</span> Gagal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDetail(r)}
                        title="Lihat detail"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {fromRow}–{toRow} dari {total} entri
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <span className="text-xs text-gray-400">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Detail Log</h2>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              <DetailRow label="Timestamp" value={fmtTs(detail.created_at)} />
              <DetailRow
                label="Pengguna"
                value={`${detail.user_name ?? "System"} (${
                  detail.user_role ?? "System"
                })`}
              />
              <DetailRow label="Modul" value={detail.modul} />
              <DetailRow label="Aksi" value={detail.aksi} />
              <DetailRow label="Objek" value={detail.objek} />
              <DetailRow
                label="ID Objek"
                value={detail.objek_id ?? "-"}
              />
              <DetailRow label="IP" value={detail.ip ?? "-"} />
              <DetailRow
                label="Status"
                value={detail.status === "SUCCESS" ? "Berhasil" : "Gagal"}
              />
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// Sub components
// =============================================

interface SelectOption {
  value: string;
  label: string;
}

function SelectFilter({
  value,
  onChange,
  allLabel,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  options: SelectOption[] | string[];
}) {
  const opts: SelectOption[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 py-2.5 text-sm text-gray-700 outline-none focus:border-red-400 cursor-pointer"
      >
        <option value="">{allLabel}</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-gray-400">{label}</dt>
      <dd className="flex-1 break-words text-gray-800">{value}</dd>
    </div>
  );
}

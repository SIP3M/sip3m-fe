import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "@/components/common/Pagination";
import {
  getAdminVerificationHistory,
  type AdminVerificationDecisionDb,
} from "./adminVerification.api";

type HistoryRow = {
  id: number;
  decision: AdminVerificationDecisionDb;
  catatan: string | null;
  created_at: string;
  proposal: { id: number; title: string } | null;
  verifier: { id: number; name: string };
  checklist: Array<{ kode: string; label: string; checked: boolean }> | null;
};

const decisionLabel: Record<AdminVerificationDecisionDb, string> = {
  LOLOS: "Lolos Administrasi",
  REVISI: "Minta Revisi",
  TOLAK: "Ditolak",
  TARIK_KEMBALI: "Ditarik Kembali",
};

const decisionClass: Record<AdminVerificationDecisionDb, string> = {
  LOLOS: "bg-emerald-100 text-emerald-700",
  REVISI: "bg-amber-100 text-amber-700",
  TOLAK: "bg-red-100 text-red-700",
  TARIK_KEMBALI: "bg-gray-200 text-gray-700",
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getErrorMessage = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? err.response?.data?.message || err.message || fallback
    : err instanceof Error
      ? err.message
      : fallback;

export default function AdminVerificationHistory() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hanyaSaya, setHanyaSaya] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getAdminVerificationHistory({ page, hanya_saya: hanyaSaya })
      .then((res) => {
        if (cancelled) return;
        setRows(res.data as HistoryRow[]);
        setTotalPages(res.meta.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err, "Gagal memuat riwayat verifikasi."));
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, hanyaSaya]);

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Riwayat Verifikasi Administrasi
          </h1>
          <p className="text-sm text-gray-500">
            Jejak keputusan verifikator, termasuk checklist yang dicentang saat
            keputusan diambil.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={hanyaSaya}
            onChange={(e) => {
              setHanyaSaya(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 accent-red-600"
          />
          Hanya keputusan saya
        </label>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Waktu</th>
              <th className="px-4 py-3">Proposal</th>
              <th className="px-4 py-3">Keputusan</th>
              <th className="px-4 py-3">Catatan</th>
              <th className="px-4 py-3">Verifikator</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Memuat riwayat...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Belum ada keputusan verifikasi administrasi.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800">
                      {row.proposal?.title ?? "-"}
                    </p>
                    <p className="text-xs text-gray-400">
                      PROP-{row.proposal?.id ?? "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${decisionClass[row.decision]}`}
                    >
                      {decisionLabel[row.decision]}
                    </span>
                  </td>
                  <td className="max-w-sm px-4 py-4 text-gray-600">
                    {row.catatan || "-"}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {row.verifier.name}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center border-t border-gray-100 p-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

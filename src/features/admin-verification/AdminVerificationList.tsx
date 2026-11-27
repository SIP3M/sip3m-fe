import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, Search } from "lucide-react";
import Pagination from "@/components/common/Pagination";
import {
  claimAdminVerification,
  getAdminVerificationQueue,
  type AdminQueueFilter,
  type AdminQueueItem,
} from "./adminVerification.api";

const ITEMS_PER_PAGE = 5;

const statusLabel: Record<string, string> = {
  SUBMITTED: "Menunggu Verifikasi",
  ADMIN_REVISION: "Revisi Administrasi",
};

const statusClass: Record<string, string> = {
  SUBMITTED: "bg-orange-100 text-orange-700",
  ADMIN_REVISION: "bg-red-100 text-red-700",
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? err.response?.data?.message || err.message || fallback
    : err instanceof Error
      ? err.message
      : fallback;

export default function AdminVerificationList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<AdminQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<AdminQueueFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    getAdminVerificationQueue({
      page,
      search: debouncedSearch,
      admin_status: filter,
    })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setRows(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalItems(res.meta.totalData);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setError(getErrorMessage(err, "Gagal memuat antrean verifikasi."));
        setRows([]);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsLoading(false);
      });
  }, [page, debouncedSearch, filter]);

  const openDetail = async (row: AdminQueueItem) => {
    if (row.claimed_by_me || row.admin_verifier_id === null) {
      if (!row.claimed_by_me) {
        setClaimingId(row.id);
        try {
          await claimAdminVerification(row.id);
        } catch (err) {
          setError(getErrorMessage(err, "Gagal mengklaim proposal."));
          setClaimingId(null);
          return;
        } finally {
          setClaimingId(null);
        }
      }
      navigate(`/reviewer-administrasi-dashboard/antrean/${row.id}`);
      return;
    }

    setError(
      `Proposal ini sedang diperiksa oleh ${row.admin_verifier?.name ?? "verifikator lain"}.`,
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Antrean Verifikasi Administrasi
          </h1>
          <p className="text-sm text-gray-500">
            Ambil satu proposal, periksa kelengkapan berkas, lalu tetapkan
            keputusan.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{totalItems}</span>{" "}
          pengajuan di antrean
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex w-72 items-center rounded-lg border px-3">
            <Search size={16} className="text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 text-sm outline-none"
              placeholder="Cari judul atau nama peneliti..."
            />
          </div>

          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as AdminQueueFilter);
              setPage(1);
            }}
            className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-red-500"
          >
            <option value="all">Semua antrean</option>
            <option value="unclaimed">Belum diklaim</option>
            <option value="mine">Diklaim saya</option>
          </select>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-gray-500">
            <tr>
              <th className="py-3">Tgl Masuk</th>
              <th>Judul Proposal</th>
              <th>Peneliti</th>
              <th>Skema</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Memuat antrean...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Tidak ada pengajuan pada antrean ini.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isMine = row.claimed_by_me;
                const claimedByOther =
                  !!row.admin_verifier_id && !row.claimed_by_me;

                return (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-4">
                      {formatDate(row.submitted_at || row.created_at)}
                    </td>
                    <td className="max-w-xs">
                      <p className="font-medium text-gray-800">{row.title}</p>
                      {row.latest_admin_verification?.catatan && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-red-600">
                          Catatan terakhir:{" "}
                          {row.latest_admin_verification.catatan}
                        </p>
                      )}
                    </td>
                    <td>{row.user?.name ?? `ID ${row.lead_researcher_id}`}</td>
                    <td>{row.skema}</td>
                    <td>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          statusClass[row.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabel[row.status] ?? row.status}
                      </span>
                    </td>
                    <td>
                      {claimedByOther ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Lock size={13} />
                          {row.admin_verifier?.name ?? "Diklaim"}
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={claimingId === row.id}
                          onClick={() => void openDetail(row)}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {claimingId === row.id
                            ? "Mengklaim..."
                            : isMine
                              ? "Lanjutkan pemeriksaan"
                              : "Klaim & periksa"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center border-t border-gray-200 pt-4">
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

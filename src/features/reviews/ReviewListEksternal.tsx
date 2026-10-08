import {
  Search,
  FileText,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedProposals } from "./review.api";
import type { AssignedProposal, ProposalStatus } from "./review.types";
import { getKetuaNama, getKetuaNidn, isKetuaDiffFromUploader } from "@/utils/proposal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  UNDER_REVIEW: { label: "Sedang Direview", bg: "bg-blue-100",   text: "text-blue-700" },
  REVISION:     { label: "Revisi",          bg: "bg-orange-100", text: "text-orange-700" },
  ACCEPTED:     { label: "Diterima",        bg: "bg-green-100",  text: "text-green-700" },
  REJECTED:     { label: "Ditolak",         bg: "bg-red-100",    text: "text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

// ─── Filter Options ───────────────────────────────────────────────────────────
const FILTER_OPTIONS: { label: string; value: ProposalStatus | "ALL" }[] = [
  { label: "Semua", value: "ALL" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Revisi", value: "REVISION" },
  { label: "Diterima", value: "ACCEPTED" },
  { label: "Ditolak", value: "REJECTED" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReviewListEksternal() {
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<AssignedProposal[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 1, currentPage: 1, limit: 5 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // ── Debounce ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAssignedProposals({
        page,
        search: debouncedSearch || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setProposals(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const underReview = proposals.filter((p) => p.status === "UNDER_REVIEW").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── HEADER ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tugas Review Saya</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Daftar proposal yang ditugaskan kepada Anda sebagai Reviewer Eksternal.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border rounded-lg px-3 py-1.5 transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Perlu Direview</p>
            <p className="text-2xl font-bold text-gray-800">{isLoading ? "—" : underReview}</p>
          </div>
          <div className="bg-orange-100 p-2.5 rounded-lg">
            <AlertCircle className="text-orange-500" size={18} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Tugas</p>
            <p className="text-2xl font-bold text-gray-800">{isLoading ? "—" : meta.totalData}</p>
          </div>
          <div className="bg-gray-100 p-2.5 rounded-lg">
            <FileText className="text-gray-500" size={18} />
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTER ── */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center bg-gray-100 px-3 rounded-lg flex-1 min-w-[200px]">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            id="eksternal-search"
            placeholder="Cari judul, skema, fakultas, nama peneliti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-2 bg-transparent outline-none text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === opt.value
                  ? "bg-red-600 text-white border-red-600"
                  : "text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2rem_3fr_2fr_1.5fr_1.5fr_1fr_auto] gap-3 text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 border-b bg-gray-50">
          <p>#</p>
          <p>Judul Proposal</p>
          <p>Peneliti</p>
          <p>Skema / Fakultas</p>
          <p>Ditugaskan</p>
          <p>Status</p>
          <p className="text-center">Aksi</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-14 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat data...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={fetchData} className="text-xs text-gray-500 underline">Coba lagi</button>
          </div>
        )}

        {!isLoading && !error && proposals.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <FileText size={28} className="text-gray-300" />
            <p className="text-sm text-gray-400">Tidak ada proposal yang ditemukan.</p>
          </div>
        )}

        {!isLoading && !error && proposals.map((item, index) => {
          const rowNum = (meta.currentPage - 1) * meta.limit + index + 1;
          return (
            <div
              key={item.id}
              className="grid grid-cols-[2rem_3fr_2fr_1.5fr_1.5fr_1fr_auto] gap-3 px-5 py-4 text-sm items-center border-b last:border-0 hover:bg-gray-50 transition-colors"
            >
              <p className="text-gray-400 text-xs">{rowNum}</p>

              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate" title={item.title}>
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatCurrency(item.funding_request_amount)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-gray-700 truncate" title={isKetuaDiffFromUploader(item) ? `Pengusul akun: ${item.user.name}` : getKetuaNama(item)}>{getKetuaNama(item)}</p>
                <p className="text-xs text-gray-400">{getKetuaNidn(item)}</p>
                {isKetuaDiffFromUploader(item) && (
                  <p className="text-[11px] text-gray-400 truncate" title={item.user.name}>Pengusul: {item.user.name}</p>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs text-gray-700 truncate">{item.skema}</p>
                <p className="text-xs text-gray-400 truncate">{item.faculty}</p>
              </div>

              <p className="text-gray-500 text-xs">{formatDate(item.assigned_at)}</p>

              <StatusBadge status={item.status} />

              <div className="flex items-center gap-2">
                {item.proposal_file_path && (
                  <a
                    href={item.proposal_file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Lihat Proposal"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <FileText size={15} />
                  </a>
                )}
                <button
                  id={`btn-eksternal-review-${item.id}`}
                  onClick={() =>
                    navigate(`/reviewer-eksternal-dashboard/reviews/${item.id}`)
                  }
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <ExternalLink size={12} />
                  Review
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PAGINATION ── */}
      {!isLoading && !error && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <p>
            Halaman {meta.currentPage} dari {meta.totalPages} &bull; {meta.totalData} total
          </p>
          <div className="flex gap-2">
            <button
              id="btn-eksternal-prev"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <button
              id="btn-eksternal-next"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              Berikutnya <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
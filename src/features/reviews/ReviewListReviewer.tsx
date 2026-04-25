import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Clock,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAssignedProposals } from "./review.api";
import type { AssignedProposal, ProposalStatus } from "./review.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  UNDER_REVIEW: {
    label: "Sedang Direview",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  SUBMITTED: {
    label: "Submitted",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  ADMIN_VERIFIED: {
    label: "Terverifikasi",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
  },
  REVISION: { label: "Revision", bg: "bg-orange-100", text: "text-orange-700" },
  ACCEPTED: { label: "Accepted", bg: "bg-green-100", text: "text-green-700" },
  REJECTED: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const FILTER_OPTIONS: { label: string; value: ProposalStatus | "ALL" }[] = [
  { label: "Semua Status", value: "ALL" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Revision", value: "REVISION" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
];

const ALL_ASSIGNED_STATUSES: ProposalStatus[] = [

  "UNDER_REVIEW",
  "REVISION",
  "ACCEPTED",
  "REJECTED",
];

const LOCAL_PAGE_SIZE = 5;

const sortByAssignedAtDesc = (items: AssignedProposal[]) =>
  [...items].sort(
    (a, b) =>
      new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime(),
  );

const fetchAssignedProposalsByStatus = async (
  status: ProposalStatus,
  search?: string,
) => {
  const first = await getAssignedProposals({ page: 1, search, status });
  const all = [...first.data];

  if (first.meta.totalPages > 1) {
    const requests: Promise<ReturnType<typeof getAssignedProposals>>[] = [];

    for (let p = 2; p <= first.meta.totalPages; p++) {
      requests.push(getAssignedProposals({ page: p, search, status }));
    }

    const rest = await Promise.all(requests);
    rest.forEach((res) => all.push(...res.data));
  }

  return all;
};

export default function ReviewListReviewer() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [proposals, setProposals] = useState<AssignedProposal[]>([]);
  const [meta, setMeta] = useState({
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);

  // ── Debounce search ────────────────────────────────────────────────────────
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
      const searchParam = debouncedSearch || undefined;

      if (statusFilter === "ALL") {
        const results = await Promise.all(
          ALL_ASSIGNED_STATUSES.map((status) =>
            fetchAssignedProposalsByStatus(status, searchParam),
          ),
        );

        const merged = sortByAssignedAtDesc(results.flat());
        const totalData = merged.length;
        const totalPages = Math.max(1, Math.ceil(totalData / LOCAL_PAGE_SIZE));
        const safePage = Math.min(page, totalPages);
        const start = (safePage - 1) * LOCAL_PAGE_SIZE;
        const paged = merged.slice(start, start + LOCAL_PAGE_SIZE);

        setProposals(paged);
        setMeta({
          totalData,
          totalPages,
          currentPage: safePage,
          limit: LOCAL_PAGE_SIZE,
        });
      } else {
        const res = await getAssignedProposals({
          page,
          search: searchParam,
          status: statusFilter,
        });
        setProposals(res.data);
        setMeta(res.meta);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memuat data. Silakan coba lagi.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stats from current page ────────────────────────────────────────────────
  const underReview = proposals.filter(
    (p) => p.status === "UNDER_REVIEW",
  ).length;
  const revision = proposals.filter((p) => p.status === "REVISION").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ── HEADER ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tugas Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Daftar proposal yang ditugaskan kepada Anda.
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

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Perlu Direview</p>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "—" : underReview}
            </p>
            <p className="text-xs text-gray-400">Halaman ini</p>
          </div>
          <div className="bg-orange-100 p-2.5 rounded-lg">
            <AlertCircle className="text-orange-500" size={18} />
          </div>
        </div>

        <div className="bg-white border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Perlu Revisi</p>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "—" : revision}
            </p>
            <p className="text-xs text-gray-400">Halaman ini</p>
          </div>
          <div className="bg-yellow-100 p-2.5 rounded-lg">
            <Clock className="text-yellow-500" size={18} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Tugas</p>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "—" : meta.totalData}
            </p>
            <p className="text-xs text-gray-400">Semua halaman</p>
          </div>
          <div className="bg-gray-100 p-2.5 rounded-lg">
            <FileText className="text-gray-500" size={18} />
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTER ── */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center bg-gray-100 px-3 rounded-lg flex-1 min-w-[200px]">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            id="search-proposal"
            placeholder="Cari judul, skema, fakultas, nama peneliti, NIDN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-2 bg-transparent outline-none text-sm"
          />
        </div>

        {/* Status Filter — Dropdown */}
        <div className="relative">
          <select
            id="filter-status-reviewer"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProposalStatus | "ALL");
              setPage(1);
            }}
            className="appearance-none text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat data...</span>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchData}
              className="text-xs text-gray-500 underline hover:text-gray-700"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && proposals.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText size={32} className="text-gray-300" />
            <p className="text-sm text-gray-500">
              Tidak ada proposal yang ditemukan.
            </p>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !error && proposals.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-10">#</TableHead>
                <TableHead>Judul Proposal</TableHead>
                <TableHead>Peneliti</TableHead>
                <TableHead>Skema / Fakultas</TableHead>
                <TableHead>Ditugaskan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((item, index) => {
                const rowNum = (meta.currentPage - 1) * meta.limit + index + 1;
                return (
                  <TableRow key={item.id}>
                    {/* No */}
                    <TableCell className="text-gray-400 text-xs">
                      {rowNum}
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <p
                        className="font-medium text-gray-800 max-w-[220px] truncate"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatCurrency(item.funding_request_amount)}
                      </p>
                    </TableCell>

                    {/* Researcher */}
                    <TableCell>
                      <p className="text-gray-700 max-w-[140px] truncate">
                        {item.user.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.user.nidn_nip}
                      </p>
                    </TableCell>

                    {/* Skema / Fakultas */}
                    <TableCell>
                      <p className="text-xs text-gray-700 max-w-[140px] truncate">
                        {item.skema}
                      </p>
                      <p className="text-xs text-gray-400 max-w-[140px] truncate">
                        {item.faculty}
                      </p>
                    </TableCell>

                    {/* Ditugaskan */}
                    <TableCell className="text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(item.assigned_at)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>

                    {/* Aksi */}
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
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

                        {item.status !== "ACCEPTED" && (
                          <button
                            id={`btn-review-${item.id}`}
                            onClick={() =>
                              navigate(`/reviewer-dashboard/reviews/${item.id}`)
                            }
                            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <ExternalLink size={12} />
                            Review
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {!isLoading && !error && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <p>
            Halaman {meta.currentPage} dari {meta.totalPages} &bull;{" "}
            {meta.totalData} total proposal
          </p>

          <div className="flex gap-2">
            <button
              id="btn-prev-page"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <button
              id="btn-next-page"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              Berikutnya <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── INFO PANEL ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 text-sm text-blue-700">
        <p className="font-medium mb-1">Panduan Review</p>
        <p>
          Setiap proposal dinilai berdasarkan 5 kriteria:{" "}
          <b>Perumusan Masalah</b>, <b>Tinjauan Pustaka</b>,{" "}
          <b>Metode Penelitian</b>, <b>Kelayakan Anggaran</b>, dan{" "}
          <b>Luaran &amp; Kontribusi</b>. Pastikan semua aspek sudah Anda
          evaluasi sebelum mengirimkan penilaian final.
        </p>
      </div>
    </div>
  );
}

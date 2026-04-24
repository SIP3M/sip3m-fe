import { Search, Eye, FileText, Loader2, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getAssignedProposals, getProposalReviews } from "./review.api";
import type { AssignedProposal, ReviewHistoryItem, ProposalStatus } from "./review.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  ACCEPTED:    { label: "Diterima",  bg: "bg-green-100",  text: "text-green-700" },
  REJECTED:    { label: "Ditolak",   bg: "bg-red-100",    text: "text-red-700" },
  REVISION:    { label: "Revisi",    bg: "bg-yellow-100", text: "text-yellow-700" },
  UNDER_REVIEW:{ label: "Under Review", bg: "bg-blue-100",  text: "text-blue-700" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

// ─── Review Detail Modal ───────────────────────────────────────────────────────
function ReviewDetailModal({
  proposal,
  reviews,
  loading,
  onClose,
}: {
  proposal: AssignedProposal;
  reviews: ReviewHistoryItem[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-gray-800">{proposal.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {proposal.user.name} &bull; {proposal.faculty}
              </p>
            </div>
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={22} className="animate-spin text-red-500" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Belum ada riwayat review.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rv) => (
                <div
                  key={rv.id}
                  className="border rounded-xl p-4 space-y-3"
                >
                  {/* Review Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {rv.reviewer.name}
                      </p>
                      <p className="text-xs text-gray-400">{rv.reviewer.email}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={rv.status} />
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(rv.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Scores */}
                  {rv.total_score !== null && (
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3 text-xs">
                      {[
                        ["Perumusan", rv.score_perumusan],
                        ["Tinjauan", rv.score_tinjauan],
                        ["Metode", rv.score_metode],
                        ["Anggaran", rv.score_anggaran],
                        ["Luaran", rv.score_luaran],
                        ["Total", rv.total_score],
                      ].map(([lbl, val]) => (
                        <div key={lbl as string} className="text-center">
                          <p className="text-gray-400">{lbl}</p>
                          <p className={`font-bold text-base ${lbl === "Total" ? "text-red-600" : "text-gray-700"}`}>
                            {val ?? "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text fields */}
                  {rv.kekuatan_proposal && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Kekuatan</p>
                      <p className="text-sm text-gray-700">{rv.kekuatan_proposal}</p>
                    </div>
                  )}
                  {rv.kelemahan_proposal && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Kelemahan</p>
                      <p className="text-sm text-gray-700">{rv.kelemahan_proposal}</p>
                    </div>
                  )}
                  {rv.rekomendasi_akhir && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Rekomendasi</p>
                      <p className="text-sm text-gray-700">{rv.rekomendasi_akhir}</p>
                    </div>
                  )}
                  {rv.notes && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Catatan</p>
                      <p className="text-sm text-gray-500 italic">{rv.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const DONE_STATUSES: ProposalStatus[] = ["ACCEPTED", "REJECTED", "REVISION"];

export default function HistoryReview() {
  const [proposals, setProposals] = useState<AssignedProposal[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 1, currentPage: 1, limit: 5 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "DONE">("DONE");
  const [page, setPage] = useState(1);

  // Modal
  const [selectedProposal, setSelectedProposal] = useState<AssignedProposal | null>(null);
  const [reviews, setReviews] = useState<ReviewHistoryItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch proposals ────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For history, we fetch all done statuses in parallel and merge
      if (statusFilter === "DONE") {
        const results = await Promise.all(
          DONE_STATUSES.map((s) =>
            getAssignedProposals({ page: 1, search: debouncedSearch || undefined, status: s }),
          ),
        );
        const merged = results.flatMap((r) => r.data);
        // Sort by assigned_at desc
        merged.sort(
          (a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime(),
        );
        const totalData = results.reduce((sum, r) => sum + r.meta.totalData, 0);
        setProposals(merged);
        setMeta({ totalData, totalPages: 1, currentPage: 1, limit: merged.length });
      } else {
        const res = await getAssignedProposals({
          page,
          search: debouncedSearch || undefined,
          status: statusFilter as ProposalStatus,
        });
        setProposals(res.data);
        setMeta(res.meta);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Open detail modal ──────────────────────────────────────────────────────
  const openDetail = async (proposal: AssignedProposal) => {
    setSelectedProposal(proposal);
    setReviews([]);
    setReviewsLoading(true);
    try {
      const res = await getProposalReviews(proposal.id);
      setReviews(res.data);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const FILTER_OPTIONS = [
    { label: "Semua Selesai", value: "DONE" },
    { label: "Diterima", value: "ACCEPTED" },
    { label: "Revisi", value: "REVISION" },
    { label: "Ditolak", value: "REJECTED" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Riwayat Review</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Daftar proposal yang telah selesai Anda nilai.
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

      {/* CARD */}
      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* SEARCH + FILTER */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              id="history-search"
              placeholder="Cari judul proposal, peneliti..."
              className="outline-none w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setStatusFilter(opt.value as ProposalStatus | "DONE");
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

        {/* TABLE */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat riwayat...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={fetchData} className="text-xs text-gray-500 underline">
              Coba lagi
            </button>
          </div>
        ) : proposals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText size={28} className="text-gray-300" />
            <p className="text-sm text-gray-400">Belum ada riwayat review.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide">#</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide">Judul Proposal</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide">Peneliti</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide">Skema</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide">Ditugaskan</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((item, i) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {(meta.currentPage - 1) * meta.limit + i + 1}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-700 max-w-xs truncate" title={item.title}>
                        {item.title}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-gray-600">{item.user.name}</p>
                      <p className="text-xs text-gray-400">{item.user.nidn_nip}</p>
                    </td>

                    <td className="px-5 py-4 text-gray-500 text-xs">{item.skema}</td>

                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {formatDate(item.assigned_at)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          id={`btn-view-history-${item.id}`}
                          onClick={() => openDetail(item)}
                          title="Lihat Riwayat Review"
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        {item.proposal_file_path && (
                          <a
                            href={item.proposal_file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat Proposal PDF"
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <FileText size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && !error && meta.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <p>
              Menampilkan halaman {meta.currentPage} dari {meta.totalPages} &bull;{" "}
              {meta.totalData} total
            </p>
            <div className="flex gap-2">
              <button
                id="btn-history-prev"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={14} /> Sebelumnya
              </button>
              <button
                id="btn-history-next"
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

      {/* ── MODAL ── */}
      {selectedProposal && (
        <ReviewDetailModal
          proposal={selectedProposal}
          reviews={reviews}
          loading={reviewsLoading}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </div>
  );
}
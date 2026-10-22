import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getProposalById } from "@/features/proposals/proposal.api";
import { getProposalReviews } from "@/features/reviews/review.api";
import type { Proposal } from "@/features/proposals/proposal.types";
import type { ReviewHistoryItem } from "@/features/reviews/review.types";
import CatatanReviewerView from "@/features/reviews/components/CatatanReviewerView";

export default function ReviewNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const proposalId = id ? Number(id) : NaN;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [latestReview, setLatestReview] = useState<ReviewHistoryItem | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      setError("ID proposal tidak valid.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [propRes, reviewRes] = await Promise.all([
          getProposalById(proposalId),
          getProposalReviews(proposalId).catch(() => ({ data: [] })),
        ]);
        setProposal(propRes.data);

        const reviews = reviewRes.data || [];
        const sorted = [...reviews].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setLatestReview(sorted[0] || null);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat catatan reviewer.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [proposalId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f3f4f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-28 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f3f4f6]">
        <div className="text-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm max-w-md">
          <p className="text-sm font-semibold text-red-600">
            {error || "Data catatan reviewer tidak ditemukan."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 space-y-6">
      {/* ── Header navigasi ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={16} /> Kembali ke Detail Proposal
        </button>
      </div>

      <CatatanReviewerView
        proposal={proposal}
        latestReview={latestReview}
        activeTab="review"
        onTabChange={(tabKey) => {
          if (tabKey === "review") return;
          navigate(`/dosen-dashboard/proposals/${proposal.id}?tab=${tabKey}`);
        }}
        showTabs={true}
      />
    </div>
  );
}

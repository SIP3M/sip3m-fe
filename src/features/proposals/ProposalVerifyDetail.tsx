import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { assignProposalReviewersAuto, getProposalById } from "./proposal.api";
import { Proposal } from "./proposal.types";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

const statusBadgeMap: Record<string, string> = {
  REVIEW: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-orange-100 text-orange-600",
  APPROVED: "bg-green-100 text-green-600",
  ACCEPTED: "bg-green-100 text-green-600",
  DRAFT: "bg-gray-100 text-gray-500",
  REVISION: "bg-red-100 text-red-600",
  REJECTED: "bg-red-100 text-red-700",
};

const getStatusKey = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getStatusLabel = (status: string) => {
  const key = getStatusKey(status);

  const map: Record<string, string> = {
    REVIEW: "Review",
    UNDER_REVIEW: "Under Review",
    SUBMITTED: "Submitted",
    APPROVED: "Approved",
    ACCEPTED: "Accepted",
    DRAFT: "Draft",
    REVISION: "Revision",
    REJECTED: "Rejected",
  };

  return map[key] || status;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
};

export default function ProposalVerifyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const proposalId = Number(id);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const loadProposal = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await getProposalById(proposalId);
      setProposal(res.data);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal memuat detail proposal."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      setFeedback({ type: "error", message: "ID proposal tidak valid." });
      setIsLoading(false);
      return;
    }

    void loadProposal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  const statusKey = useMemo(
    () => getStatusKey(proposal?.status || ""),
    [proposal?.status],
  );
  const isSubmitted = statusKey === "SUBMITTED";

  const handleAutoAssign = async () => {
    if (!proposal) return;

    if (!isSubmitted) {
      setFeedback({
        type: "error",
        message:
          "Plotting reviewer otomatis hanya tersedia untuk proposal berstatus SUBMITTED.",
      });
      return;
    }

    setIsAssigning(true);
    setFeedback(null);

    try {
      const res = await assignProposalReviewersAuto(proposal.id);
      setProposal(res.data);
      setFeedback({ type: "success", message: res.message });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          err,
          "Gagal melakukan plotting reviewer otomatis.",
        ),
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Memuat detail proposal...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="space-y-4 p-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {feedback?.message || "Proposal tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-gray-600"
      >
        <ArrowLeft size={18} />
        Kembali
      </button>

      {feedback && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Plotting Reviewer Otomatis
        </h1>
        <p className="text-sm text-gray-500">
          Sistem akan memilih reviewer otomatis berdasarkan kecocokan fakultas,
          konflik kepentingan, dan beban kerja.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="mb-2 text-xs text-gray-400">JUDUL PROPOSAL</p>

            <h2 className="mb-6 font-semibold text-gray-800">
              {proposal.title}
            </h2>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-400">Nama Peneliti</p>
                <p className="font-medium">
                  {proposal.user?.name ||
                    `ID Peneliti: ${proposal.lead_researcher_id}`}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Tahun Anggaran</p>
                <p className="font-medium">
                  {proposal.submitted_at
                    ? new Date(proposal.submitted_at).getFullYear()
                    : new Date(proposal.created_at).getFullYear()}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Skema</p>
                <p className="font-medium">{proposal.skema}</p>
              </div>

              <div>
                <p className="text-gray-400">Status Saat Ini</p>
                <span
                  className={`rounded px-2 py-1 text-xs ${statusBadgeMap[statusKey] || "bg-gray-100 text-gray-700"}`}
                >
                  {getStatusLabel(proposal.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium">Aksi Plotting</p>
            <p className="text-xs text-gray-500">
              Klik tombol di bawah untuk menjalankan penugasan reviewer secara
              otomatis oleh sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleAutoAssign()}
            disabled={isAssigning || !isSubmitted}
            className={`w-full rounded-lg py-2 text-white ${
              isAssigning || !isSubmitted
                ? "cursor-not-allowed bg-red-300"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isAssigning ? "Memproses..." : "Plotting Reviewer (Otomatis)"}
          </button>

          {!isSubmitted && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
              Proposal hanya bisa diproses jika statusnya SUBMITTED.
            </p>
          )}

          <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 text-xs">
            <p className="font-medium text-gray-700">Dokumen Proposal</p>

            {proposal.proposal_file_path ? (
              <a
                href={proposal.proposal_file_path}
                target="_blank"
                rel="noreferrer"
                className="break-all text-blue-600 hover:underline"
              >
                Buka file proposal
              </a>
            ) : (
              <p className="text-gray-400">File proposal tidak tersedia.</p>
            )}

            {proposal.rab_file_path ? (
              <a
                href={proposal.rab_file_path}
                target="_blank"
                rel="noreferrer"
                className="break-all text-blue-600 hover:underline"
              >
                Buka file RAB
              </a>
            ) : (
              <p className="text-gray-400">File RAB tidak tersedia.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

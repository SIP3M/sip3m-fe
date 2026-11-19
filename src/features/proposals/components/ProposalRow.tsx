import { CheckCircle2, Eye, FileText, XCircle } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { Proposal } from "../proposal.types";
import { updateProposalStatus } from "../proposal.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const statusStyle: Record<string, string> = {
  REVIEW: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-orange-100 text-orange-600",
  APPROVED: "bg-green-100 text-green-600",
  ACCEPTED: "bg-green-100 text-green-600",
  DRAFT: "bg-gray-100 text-gray-500",
  REVISION: "bg-red-100 text-red-600",
  REVISI: "bg-red-100 text-red-600",
  REJECTED: "bg-red-100 text-red-700",
  ADMIN_VERIFIED: "bg-blue-100 text-blue-700",
  REVIEW_DONE: "bg-indigo-100 text-indigo-700",
};

const decisionLabel: Record<string, string> = {
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  REVISION_MINOR: "Revisi Minor",
  REVISION_MAJOR: "Revisi Mayor",
};

const getStatusKey = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getStatusLabel = (status: string) => {
  const key = getStatusKey(status);

  const statusLabel: Record<string, string> = {
    REVIEW: "Review",
    UNDER_REVIEW: "Under Review",
    SUBMITTED: "Submitted",
    APPROVED: "Approved",
    ACCEPTED: "Approved",
    ADMIN_VERIFIED: "Admin Verified",
    DRAFT: "Draft",
    REVISION: "Revision",
    REVISI: "Revisi",
    REJECTED: "Rejected",
    REVIEW_DONE: "Menunggu Keputusan",
  };

  return statusLabel[key] || status;
};

const formatSkemaLabel = (value?: string | null) => {
  if (!value) return "-";
  return value
    .toLowerCase()
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatScore = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
    <dd className="text-sm text-gray-700">{value?.trim() ? value : "-"}</dd>
  </div>
);

interface Props {
  proposal: Proposal;
  rowNumber: number;
  /** Dipanggil setelah keputusan Terima/Tolak berhasil — untuk refresh daftar */
  onUpdated?: () => void;
}

export default function ProposalRow({ proposal, rowNumber, onUpdated }: Props) {
  const [openDetail, setOpenDetail] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<
    "ACCEPTED" | "REJECTED" | null
  >(null);
  const [isDeciding, setIsDeciding] = useState(false);

  const normalizedStatus = getStatusKey(proposal.status);
  const submittedYear = proposal.submitted_at
    ? new Date(proposal.submitted_at).getFullYear()
    : "-";
  const researcherName =
    proposal.user?.name || `ID Peneliti: ${proposal.lead_researcher_id}`;
  const researcherNidn = proposal.user?.nidn_nip || "-";

  const review = proposal.reviews?.[0] ?? null;
  const hasReview = Boolean(review);
  const reviewerName = review?.reviewer?.name || "-";
  const score = review?.total_score ?? null;
  const decisionText = review?.decision
    ? decisionLabel[review.decision] || review.decision
    : review?.rekomendasi_akhir || "-";

  const canDecide = normalizedStatus === "REVIEW_DONE";

  const handleDecision = async () => {
    if (!pendingDecision) return;
    setIsDeciding(true);
    try {
      await updateProposalStatus(proposal.id, { status: pendingDecision });
      setPendingDecision(null);
      onUpdated?.();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan keputusan."
        : err instanceof Error
          ? err.message
          : "Gagal menyimpan keputusan.";
      alert(message);
    } finally {
      setIsDeciding(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="px-4 py-4 text-center text-gray-500 font-medium">{rowNumber}</td>

      <td className="px-4 py-4 font-medium text-gray-800 leading-snug">{proposal.title}</td>

      <td className="px-4 py-4">
        <p className="font-medium text-gray-800">{researcherName}</p>
        <p className="text-xs text-gray-400">NIDN/NIP: {researcherNidn}</p>
      </td>

      <td className="px-4 py-4 whitespace-nowrap text-gray-600">{formatSkemaLabel(proposal.skema)}</td>

      <td className="px-4 py-4 text-center whitespace-nowrap text-gray-600">{submittedYear}</td>

      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-700">
        Rp {proposal.funding_request_amount.toLocaleString("id-ID")}
      </td>

      {/* NILAI — tooltip hover menampilkan ringkasan review */}
      <td className="px-4 py-4 text-center whitespace-nowrap">
        {hasReview ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="inline-flex cursor-help items-center justify-center min-w-[38px] rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 outline-none ring-1 ring-indigo-200/60 hover:bg-indigo-100 hover:ring-indigo-300 transition"
              >
                {formatScore(score)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs space-y-1.5 p-3 shadow-lg">
              <p className="font-semibold text-gray-800">Ringkasan Review</p>
              <p className="text-gray-600">
                Dinilai oleh <span className="font-medium">{reviewerName}</span>
              </p>
              <p className="text-gray-600">
                Nilai: <span className="font-medium">{formatScore(score)}</span>
              </p>
              <p className="text-gray-600">
                Rekomendasi: <span className="font-medium">{decisionText}</span>
              </p>
              {review?.kekuatan_proposal && (
                <p className="text-gray-500 text-xs">
                  Kekuatan: {review.kekuatan_proposal}
                </p>
              )}
              {review?.kelemahan_proposal && (
                <p className="text-gray-500 text-xs">
                  Kelemahan: {review.kelemahan_proposal}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-gray-300 font-medium">-</span>
        )}
      </td>

      <td className="px-4 py-4 text-center whitespace-nowrap">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyle[normalizedStatus] || "bg-gray-100 text-gray-600"}`}
        >
          {getStatusLabel(proposal.status)}
        </span>
      </td>

      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {proposal.proposal_file_path ? (
              <a
                href={proposal.proposal_file_path}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                aria-label="Lihat file proposal"
                title="Lihat file proposal"
              >
                <FileText size={18} />
              </a>
            ) : (
              <span className="p-1 text-gray-300 cursor-not-allowed" title="File proposal tidak tersedia">
                <FileText size={18} />
              </span>
            )}

            <button
              type="button"
              onClick={() => setOpenDetail(true)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
              aria-label="Lihat detail proposal"
              title="Lihat detail"
            >
              <Eye size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 w-full min-w-[85px]">
            <button
              type="button"
              onClick={() => setPendingDecision("ACCEPTED")}
              disabled={isDeciding || !canDecide}
              title={
                canDecide
                  ? "Approve proposal"
                  : "Hanya tersedia saat status Menunggu Keputusan"
              }
              className="inline-flex items-center justify-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 size={12} />
              Approve
            </button>
            <button
              type="button"
              onClick={() => setPendingDecision("REJECTED")}
              disabled={isDeciding || !canDecide}
              title={
                canDecide
                  ? "Reject proposal"
                  : "Hanya tersedia saat status Menunggu Keputusan"
              }
              className="inline-flex items-center justify-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <XCircle size={12} />
              Reject
            </button>
          </div>
        </div>
      </td>

      {/* POPUP RINGKASAN — pengganti halaman detail */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pr-6 text-left leading-snug">
              {proposal.title}
            </DialogTitle>
            <DialogDescription>
              Ringkasan proposal beserta hasil review reviewer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow label="Peneliti" value={researcherName} />
              <InfoRow label="NIDN/NIP" value={researcherNidn} />
              <InfoRow label="Skema" value={formatSkemaLabel(proposal.skema)} />
              <InfoRow label="Tahun" value={String(submittedYear)} />
              <InfoRow
                label="Anggaran"
                value={`Rp ${proposal.funding_request_amount.toLocaleString("id-ID")}`}
              />
              <InfoRow label="Status" value={getStatusLabel(proposal.status)} />
              {proposal.instansi && (
                <InfoRow label="Instansi" value={proposal.instansi} />
              )}
              {proposal.nama_ketua && (
                <InfoRow label="Ketua Peneliti" value={proposal.nama_ketua} />
              )}
            </dl>

            {proposal.abstrak && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Abstrak
                </h4>
                <p className="text-sm leading-relaxed text-gray-700">
                  {proposal.abstrak}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Tujuan Penelitian
                </h4>
                <p className="text-sm text-gray-700">
                  {proposal.tujuan_penelitian?.trim()
                    ? proposal.tujuan_penelitian
                    : "-"}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Metode Penelitian
                </h4>
                <p className="text-sm text-gray-700">
                  {proposal.metode_penelitian?.trim()
                    ? proposal.metode_penelitian
                    : "-"}
                </p>
              </div>
            </div>

            {/* RINGKASAN REVIEW */}
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Hasil Review Reviewer
              </h4>
              {review ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span>
                      Nilai:{" "}
                      <span className="font-semibold">{formatScore(score)}</span>
                    </span>
                    <span>
                      Reviewer:{" "}
                      <span className="font-medium">{reviewerName}</span>
                    </span>
                    <span>
                      Rekomendasi:{" "}
                      <span className="font-medium">{decisionText}</span>
                    </span>
                  </div>
                  {review.kekuatan_proposal && (
                    <p>
                      <span className="text-gray-500">Kekuatan:</span>{" "}
                      {review.kekuatan_proposal}
                    </p>
                  )}
                  {review.kelemahan_proposal && (
                    <p>
                      <span className="text-gray-500">Kelemahan:</span>{" "}
                      {review.kelemahan_proposal}
                    </p>
                  )}
                  {review.rekomendasi_akhir && (
                    <p>
                      <span className="text-gray-500">Catatan akhir:</span>{" "}
                      {review.rekomendasi_akhir}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Belum ada review untuk proposal ini.
                </p>
              )}
            </div>

            {/* FILE */}
            <div className="flex flex-wrap gap-3">
              {proposal.proposal_file_path && (
                <a
                  href={proposal.proposal_file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600"
                >
                  <FileText size={16} /> File Proposal
                </a>
              )}
              {proposal.rab_file_path && (
                <a
                  href={proposal.rab_file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600"
                >
                  <FileText size={16} /> File RAB
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* KONFIRMASI KEPUTUSAN — Terima / Tolak dari kolom Aksi */}
      <ConfirmDialog
        open={pendingDecision !== null}
        onOpenChange={(open) => {
          if (!open && !isDeciding) setPendingDecision(null);
        }}
        title={
          pendingDecision === "REJECTED"
            ? "Tolak proposal ini?"
            : "Setujui proposal ini?"
        }
        description={
          pendingDecision === "REJECTED"
            ? `Tolak proposal "${proposal.title}" secara FINAL (Ditolak)? Proposal tidak dapat direview ulang.`
            : `Terima proposal "${proposal.title}" secara FINAL (Diterima)? Keputusan ini bersifat final.`
        }
        confirmLabel={
          pendingDecision === "REJECTED" ? "Ya, Tolak" : "Ya, Terima"
        }
        cancelLabel="Batal"
        variant={pendingDecision === "REJECTED" ? "danger" : "success"}
        isLoading={isDeciding}
        onConfirm={handleDecision}
      />
    </tr>
  );
}

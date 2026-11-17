import { Eye, FileText } from "lucide-react";
import { useState } from "react";
import { Proposal } from "../proposal.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
}

export default function ProposalRow({ proposal, rowNumber }: Props) {
  const [openDetail, setOpenDetail] = useState(false);

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

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4">{rowNumber}</td>

      {/* NILAI — tooltip hover menampilkan ringkasan review */}
      <td className="px-6 py-4">
        {hasReview ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="inline-flex cursor-help items-center rounded-md bg-indigo-50 px-2.5 py-1 text-sm font-semibold text-indigo-700 outline-none ring-indigo-200 hover:ring-1"
              >
                {formatScore(score)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs space-y-1.5">
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
                <p className="text-gray-500">
                  Kekuatan: {review.kekuatan_proposal}
                </p>
              )}
              {review?.kelemahan_proposal && (
                <p className="text-gray-500">
                  Kelemahan: {review.kelemahan_proposal}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>

      <td className="px-6 py-4 font-medium text-gray-800">{proposal.title}</td>

      <td className="px-6 py-4">
        <p>{researcherName}</p>
        <p className="text-xs text-gray-400">NIDN/NIP: {researcherNidn}</p>
      </td>

      <td className="px-6 py-4">{formatSkemaLabel(proposal.skema)}</td>

      <td className="px-6 py-4">{submittedYear}</td>

      <td className="px-6 py-4">
        Rp {proposal.funding_request_amount.toLocaleString("id-ID")}
      </td>

      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[normalizedStatus] || "bg-gray-100 text-gray-600"}`}
        >
          {getStatusLabel(proposal.status)}
        </span>
      </td>

      <td className="px-6 py-4 flex gap-4">
        {proposal.proposal_file_path ? (
          <a
            href={proposal.proposal_file_path}
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 hover:text-blue-600"
            aria-label="Lihat file proposal"
          >
            <FileText size={18} />
          </a>
        ) : (
          <FileText size={18} className="text-gray-300" />
        )}

        <button
          type="button"
          onClick={() => setOpenDetail(true)}
          className="text-red-500 hover:text-red-700"
          aria-label="Lihat ringkasan proposal"
        >
          <Eye size={18} />
        </button>
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
    </tr>
  );
}

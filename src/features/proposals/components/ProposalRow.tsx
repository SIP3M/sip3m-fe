import { Eye, FileText } from "lucide-react";
import { Proposal } from "../proposal.types";

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
  };

  return statusLabel[key] || status;
};

interface Props {
  proposal: Proposal;
  rowNumber: number;
}

export default function ProposalRow({ proposal, rowNumber }: Props) {
  const normalizedStatus = getStatusKey(proposal.status);
  const submittedYear = proposal.submitted_at
    ? new Date(proposal.submitted_at).getFullYear()
    : "-";
  const researcherName =
    proposal.user?.name || `ID Peneliti: ${proposal.lead_researcher_id}`;
  const researcherNidn = proposal.user?.nidn_nip || "-";
  const previewLink = proposal.proposal_file_path || proposal.rab_file_path;

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4">{rowNumber}</td>

      <td className="px-6 py-4 font-medium text-gray-800">{proposal.title}</td>

      <td className="px-6 py-4">
        <p>{researcherName}</p>
        <p className="text-xs text-gray-400">NIDN/NIP: {researcherNidn}</p>
      </td>

      <td className="px-6 py-4">{proposal.skema}</td>

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

        {previewLink ? (
          <a
            href={previewLink}
            target="_blank"
            rel="noreferrer"
            className="text-red-500 hover:text-red-700"
            aria-label="Lihat detail file"
          >
            <Eye size={18} />
          </a>
        ) : (
          <Eye size={18} className="text-gray-300" />
        )}
      </td>
    </tr>
  );
}

import { ReviewProposal } from "../review.types";

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

interface Props {
  proposal: ReviewProposal;
  onSelect: (proposal: ReviewProposal) => void;
}

export default function ProposalReviewerRow({ proposal, onSelect }: Props) {
  const normalizedStatus = getStatusKey(proposal.status || "");
  const canAssign = normalizedStatus === "SUBMITTED";

  return (
    <tr className="hover:bg-gray-50 transition">
      {/* TITLE */}
      <td className="px-6 py-4 text-sm font-medium text-gray-800">
        {proposal.title}
      </td>

      {/* CATEGORY */}
      <td className="px-6 py-4 text-sm text-gray-600">{proposal.category}</td>

      {/* REVIEWER */}
      <td className="px-6 py-4 text-sm">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[normalizedStatus] || "bg-gray-100 text-gray-600"}`}
        >
          {proposal.status}
        </span>
      </td>

      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => onSelect(proposal)}
          disabled={!canAssign}
          className={`px-3 py-1 text-sm rounded-lg ${
            canAssign
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Pilih
        </button>
      </td>
    </tr>
  );
}

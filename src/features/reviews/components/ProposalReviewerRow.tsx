import { Proposal } from "@/features/proposals/proposal.types";

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
  proposal: Proposal;
  checked: boolean;
  disabled?: boolean;
  onToggle: (proposal: Proposal) => void;
}

export default function ProposalReviewerRow({
  proposal,
  checked,
  disabled = false,
  onToggle,
}: Props) {
  const normalizedStatus = getStatusKey(proposal.status || "");
  const canSelect = normalizedStatus === "SUBMITTED";

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 align-middle">
        <input
          type="checkbox"
          checked={checked}
          disabled={!canSelect || disabled}
          onChange={() => onToggle(proposal)}
          aria-label={`Pilih proposal ${proposal.title}`}
        />
      </td>

      <td className="px-6 py-4 text-sm font-medium text-gray-800">
        <div className="max-w-[320px] line-clamp-2">{proposal.title}</div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-600">
        {proposal.faculty || "-"}
      </td>

      <td className="px-6 py-4 text-sm">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[normalizedStatus] || "bg-gray-100 text-gray-600"}`}
        >
          {proposal.status}
        </span>
      </td>
    </tr>
  );
}

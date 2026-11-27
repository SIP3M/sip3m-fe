import { Proposal } from "@/features/proposals/proposal.types";
import { Eye, Pencil } from "lucide-react";
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
  onShowDetail: () => void;
  /** Buka modal pilih reviewer (plotting manual) untuk proposal ini. */
  onPickReviewer: () => void;
  /** Buka modal edit penugasan reviewer untuk proposal yang sudah terplot. */
  onEditReviewer: () => void;
}

/** Status yang masih boleh menerima plotting reviewer manual. */
const isPlottableStatus = (status: string) =>
  ["SUBMITTED", "UNDER_REVIEW"].includes(getStatusKey(status || ""));

export default function ProposalReviewerRow({
  proposal,
  checked,
  disabled = false,
  onToggle,
  onShowDetail,
  onPickReviewer,
  onEditReviewer,
}: Props) {
  const normalizedStatus = getStatusKey(proposal.status || "");
  const canSelect = normalizedStatus === "ADMIN_VERIFIED";

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
        <div className="max-w-[320px]">{proposal.title}</div>
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

      <td className="px-6 py-4 text-sm">
        {proposal.assigned_reviewer ? (
          <span
            className="text-gray-700"
            title={`Terplot: ${proposal.assigned_reviewer.name}`}
          >
            Terplot:{" "}
            <span className="font-medium">
              {proposal.assigned_reviewer.name}
            </span>
          </span>
        ) : isPlottableStatus(proposal.status) ? (
          <button
            type="button"
            onClick={onPickReviewer}
            disabled={disabled}
            aria-label={`Pilih reviewer untuk proposal ${proposal.title}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Pilih Reviewer
          </button>
        ) : (
          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
            Belum terplot
          </span>
        )}
      </td>

      <td className="px-4 py-4 text-center">
        <div className="inline-flex items-center gap-1">
          {proposal.assigned_reviewer && (
            <button
              type="button"
              onClick={onEditReviewer}
              aria-label={`Edit penugasan reviewer proposal ${proposal.title}`}
              title="Edit penugasan reviewer"
              className="inline-flex rounded-lg p-2 text-gray-500 transition hover:bg-amber-50 hover:text-amber-600"
            >
              <Pencil size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onShowDetail}
            aria-label={`Lihat detail proposal ${proposal.title}`}
            title="Lihat detail proposal"
            className="inline-flex rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Eye size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

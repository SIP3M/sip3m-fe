import { ReviewProposal } from "../review.types"

interface Props {
  proposal: ReviewProposal
  onSelect: (proposal: ReviewProposal) => void
}

export default function ProposalReviewerRow({ proposal, onSelect }: Props) {
  return (
    <tr className="hover:bg-gray-50 transition">

      {/* TITLE */}
      <td className="px-6 py-4 text-sm font-medium text-gray-800">
        {proposal.title}
      </td>

      {/* CATEGORY */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {proposal.category}
      </td>

      {/* REVIEWER */}
      <td className="px-6 py-4 text-sm">

        {proposal.reviewer ? (
          <span className="text-green-600 font-medium">
            Assigned
          </span>
        ) : (
          <span className="text-gray-400 italic">
            Belum ada
          </span>
        )}

      </td>

      {/* ACTION */}
      <td className="px-6 py-4">
        <button
          onClick={() => onSelect(proposal)}
          className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Pilih
        </button>
      </td>

    </tr>
  )
}
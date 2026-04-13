import { CheckCircle } from "lucide-react"
import { ReviewProposal } from "../review.types"

type Props = {
  proposal: ReviewProposal
  onSelect: (proposal: ReviewProposal) => void
  active?: boolean
}

export default function ProposalReviewerRow({
  proposal,
  onSelect,
  active
}: Props) {

  return (
    <tr className={`border-t ${active ? "bg-red-50" : ""}`}>

      <td className="px-6 py-4 w-[40%]">
        {proposal.title}
      </td>

      <td className="px-6 py-4 text-gray-600">
        {proposal.category}
      </td>

      <td className="px-6 py-4">

        {proposal.reviewer ? (

          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16}/>
            Assigned
          </div>

        ) : (

          <span className="text-gray-400 italic">
            Belum ada
          </span>

        )}

      </td>

      <td className="px-6 py-4">

        <button
          onClick={() => onSelect(proposal)}
          className={`px-3 py-1 text-xs rounded-md
            ${
              active
                ? "bg-red-600 text-white"
                : "border border-gray-300 text-gray-600"
            }
          `}
        >
          Pilih
        </button>

      </td>

    </tr>
  )
}
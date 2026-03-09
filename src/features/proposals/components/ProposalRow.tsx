import { Eye, FileText } from "lucide-react"
import { Proposal } from "../proposal.types"

const statusStyle: Record<string, string> = {
  REVIEW: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-orange-100 text-orange-600",
  APPROVED: "bg-green-100 text-green-600",
  DRAFT: "bg-gray-100 text-gray-500",
  REVISION: "bg-red-100 text-red-600",
}

export default function ProposalRow({ proposal }: { proposal: Proposal }) {
  return (
    <tr className="hover:bg-gray-50 transition">

      <td className="px-6 py-4">{proposal.id}</td>

      <td className="px-6 py-4 font-medium text-gray-800">
        {proposal.title}
      </td>

      <td className="px-6 py-4">
        <p>{proposal.researcher}</p>
        <p className="text-xs text-gray-400">
          NIDN: {proposal.nidn}
        </p>
      </td>

      <td className="px-6 py-4">{proposal.schema}</td>

      <td className="px-6 py-4">{proposal.year}</td>

      <td className="px-6 py-4">
        Rp {proposal.budget.toLocaleString()}
      </td>

      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[proposal.status]}`}
        >
          {proposal.status}
        </span>
      </td>

      <td className="px-6 py-4 flex gap-4">

        <FileText
          size={18}
          className="text-gray-500 hover:text-blue-600 cursor-pointer"
        />

        <Eye
          size={18}
          className="text-red-500 hover:text-red-700 cursor-pointer"
        />

      </td>

    </tr>
  )
}
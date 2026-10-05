import { Check, X } from "lucide-react"
import { Finance } from "../finance.types"

const statusStyle = {
  APPROVED: "bg-blue-100 text-blue-600",
  PENDING: "bg-yellow-100 text-yellow-700",
  DISBURSED: "bg-green-100 text-green-600"
}

const statusText = {
  APPROVED: "Disetujui",
  PENDING: "Menunggu Persetujuan",
  DISBURSED: "Tercairkan"
}

export default function FinanceRow({ data, onDetail }: { data: Finance; onDetail?: () => void }) {

  return (
    <tr className="hover:bg-gray-50">

      {/* PROJECT */}
      <td className="px-6 py-4">

        <p className="font-medium text-gray-800">
          {data.project}
        </p>

        <p className="text-xs text-gray-500">
          {data.leader}
        </p>

      </td>

      {/* RAB */}
      <td className="px-6 py-4 text-gray-600">
        Rp {data.rab.toLocaleString()}
      </td>

      {/* REALISASI */}
      <td className="px-6 py-4 text-gray-600">
        Rp {data.realization.toLocaleString()}
      </td>

      {/* STATUS */}
      <td className="px-6 py-4">

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[data.status]}`}
        >
          {statusText[data.status]}
        </span>

      </td>

      {/* DATE */}
      <td className="px-6 py-4 text-gray-500">
        {data.date}
      </td>

      {/* ACTION */}
      <td className="px-6 py-4 flex items-center gap-2">

        {data.status === "PENDING" && (
          <>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-red-100 text-red-600">
              <X size={16} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded bg-green-100 text-green-600">
              <Check size={16} />
            </button>
          </>
        )}

        <button
          className="text-sm text-gray-600 hover:text-blue-600"
          onClick={onDetail}
        >
          Detail
        </button>

      </td>

    </tr>
  )
}
import { Log } from "../log.types"

const roleStyle = {
  ADMIN: "bg-gray-200 text-gray-700",
  STAFF: "bg-gray-100 text-gray-600",
  DOSEN: "bg-blue-100 text-blue-600",
  REVIEWER: "bg-purple-100 text-purple-600"
}

const actionStyle = {
  LOGIN: "text-green-600",
  UPDATE_STATUS: "text-blue-600",
  UPLOAD_FILE: "text-indigo-600",
  SUBMIT_REVIEW: "text-blue-600"
}

export default function LogRow({ log }: { log: Log }) {

  return (
    <tr className="hover:bg-gray-50">

      <td className="px-6 py-4 text-gray-500 text-sm">
        {log.timestamp}
      </td>

      <td className="px-6 py-4 font-medium text-gray-800">
        {log.user}
      </td>

      <td className="px-6 py-4">

        <span className={`px-2 py-1 text-xs rounded ${roleStyle[log.role]}`}>
          {log.role}
        </span>

      </td>

      <td className="px-6 py-4 text-gray-500 text-sm">
        {log.module}
      </td>

      <td className={`px-6 py-4 text-sm font-medium ${actionStyle[log.action as keyof typeof actionStyle] || "text-gray-600"}`}>
        {log.action}
      </td>

      <td className="px-6 py-4 text-gray-500 text-sm">
        {log.details}
      </td>

    </tr>
  )
}
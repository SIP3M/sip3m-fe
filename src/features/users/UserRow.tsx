import { Pencil, Trash2 } from "lucide-react"
import { User } from "./users.types"

const roleStyle: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-600",
  STAFF: "bg-blue-100 text-blue-600",
  DOSEN: "bg-green-100 text-green-600",
  REVIEWER: "bg-yellow-100 text-yellow-700",
  EXTERNAL: "bg-gray-100 text-gray-600",
}

export default function UserRow({ user }: { user: User }) {
  return (
    <tr className="bg-white shadow-sm hover:shadow-md transition duration-200">

      {/* NAME */}
      <td className="px-6 py-4 flex items-center gap-3">

        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
          {user.name.charAt(0)}
        </div>

        <div>
          <p className="font-medium text-gray-800">
            {user.name}
          </p>

          {user.nidn && (
            <p className="text-xs text-gray-400">
              NIDN: {user.nidn}
            </p>
          )}
        </div>

      </td>

      {/* EMAIL */}
      <td className="px-6 py-4 text-gray-600">
        {user.email}
      </td>

      {/* ROLE */}
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${roleStyle[user.role]}`}
        >
          {user.role}
        </span>
      </td>

      {/* STATUS */}
      <td className="px-6 py-4">
        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
          {user.status}
        </span>
      </td>

      {/* ACTION */}
      <td className="px-6 py-4 flex gap-4">

        <Pencil
          size={18}
          className="text-gray-500 hover:text-blue-600 cursor-pointer"
        />

        <Trash2
          size={18}
          className="text-red-500 hover:text-red-700 cursor-pointer"
        />

      </td>

    </tr>
  )
}
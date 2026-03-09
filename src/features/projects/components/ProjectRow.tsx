import { Eye } from "lucide-react"
import { Project } from "../project.types"

const statusStyle = {
  ON_TRACK: "bg-green-100 text-green-600",
  DELAYED: "bg-red-100 text-red-600"
}

export default function ProjectRow({ project }: { project: Project }) {

  return (
    <tr className="hover:bg-gray-50 transition">

      {/* PROJECT NAME */}
      <td className="px-6 py-4 font-medium text-gray-800">
        {project.name}
      </td>

      {/* LEADER */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {project.leader}
      </td>

      {/* PROGRESS */}
      <td className="px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="w-full bg-gray-200 rounded-full h-2">

            <div
              className={`h-2 rounded-full ${
                project.progress > 50
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${project.progress}%` }}
            />

          </div>

          <span className="text-sm text-gray-600">
            {project.progress}%
          </span>

        </div>

      </td>

      {/* MILESTONE */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {project.milestone}
      </td>

      {/* STATUS */}
      <td className="px-6 py-4">

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[project.status]}`}
        >
          {project.status === "ON_TRACK" ? "ON TRACK" : "DELAYED"}
        </span>

      </td>

      {/* ACTION */}
      <td className="px-6 py-4">

        <Eye
          size={18}
          className="text-gray-500 hover:text-blue-600 cursor-pointer"
        />

      </td>

    </tr>
  )
}
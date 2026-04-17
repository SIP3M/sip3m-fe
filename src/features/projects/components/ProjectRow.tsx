import { Eye } from "lucide-react";
import { MonitoringProjectListItem } from "../project.types";

const statusStyle: Record<string, string> = {
  ON_TRACK: "bg-green-100 text-green-600",
  DELAYED: "bg-red-100 text-red-600",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const getStatusKey = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

interface Props {
  project: MonitoringProjectListItem;
  onView: (id: number) => void;
}

export default function ProjectRow({ project, onView }: Props) {
  const statusKey = getStatusKey(project.calculated_status);
  const progress = Math.max(0, Math.min(100, project.progress_percentage || 0));

  const progressClassName =
    statusKey === "COMPLETED"
      ? "bg-blue-500"
      : progress >= 50
        ? "bg-green-500"
        : "bg-red-500";

  return (
    <tr className="hover:bg-gray-50 transition">
      {/* PROJECT NAME */}
      <td className="px-6 py-4 font-medium text-gray-800">
        <div>
          <p>{project.title}</p>
          <p className="text-xs font-normal text-gray-400">
            {project.project_code}
          </p>
        </div>
      </td>
      {/* LEADER */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {project.user?.name || "-"}
      </td>
      {/* PROGRESS */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${progressClassName}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-9 text-sm text-gray-600">{progress}%</span>
        </div>
      </td>
      {/* MILESTONE */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {project.milestone_berikutnya || "-"}
      </td>
      {/* STATUS */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyle[statusKey] || "bg-gray-100 text-gray-600"}`}
        >
          {project.calculated_status}
        </span>
      </td>
      {/* ACTION */}
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => onView(project.id)}
          className="text-gray-500 hover:text-blue-600"
          aria-label={`Lihat detail proyek ${project.title}`}
        >
          <Eye size={18} className="cursor-pointer" />
        </button>
      </td>
    </tr>
  );
}

import { useNavigate } from "react-router-dom";
import { BookOpen, Eye } from "lucide-react";

type StatusMonitoring = "Aktif" | "Perlu Monitoring" | "Tidak Aktif";

interface MonitoringRow {
  id: number;
  kelompok: string;
  desa: string;
  logbook: number;
  progress: number;
  barColor: "green" | "red" | "yellow";
  status: StatusMonitoring;
}

const MONITORING_DATA: MonitoringRow[] = [
  {
    id: 1,
    kelompok: "Kelompok 01",
    desa: "Astanajapura",
    logbook: 15,
    progress: 80,
    barColor: "green",
    status: "Aktif",
  },
  {
    id: 2,
    kelompok: "Kelompok 02",
    desa: "Palimanan",
    logbook: 8,
    progress: 50,
    barColor: "red",
    status: "Perlu Monitoring",
  },
  {
    id: 3,
    kelompok: "Kelompok 03",
    desa: "Gempol",
    logbook: 3,
    progress: 25,
    barColor: "yellow",
    status: "Tidak Aktif",
  },
  {
    id: 4,
    kelompok: "Kelompok 04",
    desa: "Ciwaringin",
    logbook: 20,
    progress: 95,
    barColor: "green",
    status: "Aktif",
  },
];

export default function MonitoringKKMDosen() {
  const navigate = useNavigate();

  const getBarColorClass = (color: "green" | "red" | "yellow") => {
    switch (color) {
      case "green":
        return "bg-emerald-500";
      case "red":
        return "bg-red-600";
      case "yellow":
        return "bg-amber-500";
      default:
        return "bg-emerald-500";
    }
  };

  const renderStatusBadge = (status: StatusMonitoring) => {
    switch (status) {
      case "Aktif":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Aktif
          </span>
        );
      case "Perlu Monitoring":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100/80 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Perlu Monitoring
          </span>
        );
      case "Tidak Aktif":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            Tidak Aktif
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoring KKM</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau aktivitas dan perkembangan kelompok bimbingan
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/40 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">KELOMPOK</th>
                <th className="py-4 px-6 font-semibold">DESA</th>
                <th className="py-4 px-6 font-semibold">LOGBOOK</th>
                <th className="py-4 px-6 font-semibold">PROGRESS</th>
                <th className="py-4 px-6 font-semibold">STATUS</th>
                <th className="py-4 px-6 font-semibold text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {MONITORING_DATA.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  {/* Kelompok */}
                  <td className="py-5 px-6 font-bold text-gray-900 whitespace-nowrap">
                    {row.kelompok}
                  </td>

                  {/* Desa */}
                  <td className="py-5 px-6 text-gray-600 whitespace-nowrap">
                    {row.desa}
                  </td>

                  {/* Logbook */}
                  <td className="py-5 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-700">
                      <BookOpen size={15} className="text-gray-400 shrink-0" />
                      <span className="font-medium">{row.logbook}</span>
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="py-5 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3 w-48">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getBarColorClass(
                            row.barColor
                          )}`}
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 shrink-0 w-8 text-right">
                        {row.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-5 px-6 whitespace-nowrap">
                    {renderStatusBadge(row.status)}
                  </td>

                  {/* Aksi */}
                  <td className="py-5 px-6 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dosen-dashboard/kkm/monitoring/${row.id}`)
                      }
                      className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer inline-flex items-center justify-center"
                      title="Lihat Detail Monitoring"
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

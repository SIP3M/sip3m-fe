import { useNavigate } from "react-router-dom";
import {
  FileText,
  Activity,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DosenDashboard() {
  const navigate = useNavigate();

  const lineData = [
    { name: "Jan", value: 10 },
    { name: "Feb", value: 35 },
    { name: "Mar", value: 50 },
    { name: "Apr", value: 75 },
    { name: "Mei", value: 82 },
    { name: "Jun", value: 95 },
  ];

  const pieData = [
    { name: "Disetujui", value: 60, color: "#22c55e" },
    { name: "Review", value: 25, color: "#facc15" },
    { name: "Revisi", value: 15, color: "#f97316" },
  ];

  return (
    <div className="p-4 sm:p-6 min-h-screen overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Selamat Datang, Budi Peneliti
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola penelitian dan pengabdian Anda di sini.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileText className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Proposal</p>
            <p className="text-xl font-bold">3</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <Activity className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Proyek Aktif</p>
            <p className="text-xl font-bold">2</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <AlertCircle className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Perlu Revisi</p>
            <p className="text-xl font-bold">1</p>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Line Chart */}
        <div className="bg-white p-4 rounded-xl">
          <h2 className="font-semibold text-gray-700 mb-1">
            Progress Penelitian
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Tren kemajuan proyek aktif Anda
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ef4444"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-4 rounded-xl flex flex-col items-center">
          <h2 className="font-semibold text-gray-700 mb-1 w-full">
            Status Proposal
          </h2>
          <p className="text-sm text-gray-400 mb-4 w-full">
            Distribusi status proposal yang diajukan
          </p>

          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="flex gap-4 mt-2 text-sm flex-wrap justify-center">
            <span className="text-green-600">■ Disetujui</span>
            <span className="text-yellow-500">■ Review</span>
            <span className="text-orange-500">■ Revisi</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Proposal Saya */}
        <div className="bg-white p-4 rounded-xl">
          <div className="flex justify-between mb-3">
            <h2 className="font-semibold text-gray-700">Proposal Saya</h2>
            <span className="text-sm text-gray-400 cursor-pointer">
              Lihat Semua
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <p className="line-clamp-2">Pengembangan Algoritma AI untuk Deteksi Hama</p>
              <span className="bg-yellow-100 text-yellow-600 px-2 rounded shrink-0 h-fit">
                REVIEW
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <p className="line-clamp-2">Pemberdayaan UMKM Batik</p>
              <span className="bg-orange-100 text-orange-600 px-2 rounded shrink-0 h-fit">
                SUBMITTED
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <p className="line-clamp-2">Analisis Dampak Lingkungan Limbah Pabrik Gula</p>
              <span className="bg-green-100 text-green-600 px-2 rounded shrink-0 h-fit">
                APPROVED
              </span>
            </div>
          </div>
        </div>

        {/* Proyek Berjalan */}
        <div className="bg-white p-4 rounded-xl">
          <div className="flex justify-between mb-3">
            <h2 className="font-semibold text-gray-700">Proyek Berjalan</h2>
            <span className="text-sm text-gray-400 cursor-pointer">
              Lihat Semua
            </span>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between gap-4">
                <p>Analisis Dampak Lingkungan</p>
                <span className="bg-green-100 text-green-600 px-2 rounded shrink-0">
                  ON TRACK
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div className="bg-red-500 h-2 rounded" style={{ width: "75%" }} />
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Next: Laporan Kemajuan 2
              </p>
            </div>

            <div>
              <div className="flex justify-between gap-4">
                <p>Implementasi Smart Village</p>
                <span className="bg-red-100 text-red-600 px-2 rounded shrink-0">
                  DELAYED
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div className="bg-red-500 h-2 rounded" style={{ width: "30%" }} />
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Next: Survey Lapangan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

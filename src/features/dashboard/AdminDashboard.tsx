import StatCard from "@/components/dashboard/StatCard";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  GraduationCap,
  UsersRound,
  BookOpen,
  UserCog,
  Plus,
  Zap,
  Bell,
  Download,
  Activity,
  ChevronRight,
} from "lucide-react";
import { getAdminDashboard } from "./dashboard.api";
import {
  AdminDashboardData,
  AdminStatusChartItem,
  ProposalStatusKey,
} from "./dashboard.types";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";

const EMPTY_DASHBOARD_DATA: AdminDashboardData = {
  summaryCards: {
    totalProposal: 0,
    dosenAktif: 0,
    proposalDisetujui: 0,
    menungguReview: 0,
  },
  statusChart: [],
  kategoriChart: [],
  trendBulanan: [],
};

const statusLabelMap: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ADMIN_VERIFIED: "Admin Verified",
  UNDER_REVIEW: "Under Review",
  REVISION: "Revision",
  ACCEPTED: "Disetujui",
  REJECTED: "Ditolak",
};

const statusColorMap: Record<string, string> = {
  DRAFT: "#94a3b8",
  SUBMITTED: "#3b82f6",
  ADMIN_VERIFIED: "#3b82f6",
  UNDER_REVIEW: "#f59e0b",
  REVISION: "#fb923c",
  ACCEPTED: "#22c55e",
  REJECTED: "#ef4444",
};

const getStatusKey = (status: ProposalStatusKey) =>
  String(status)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const mapStatusChartData = (items: AdminStatusChartItem[]) => {
  return items.map((item) => {
    const key = getStatusKey(item.status);

    return {
      name: statusLabelMap[key] || key,
      value: item.jumlah,
      fill: statusColorMap[key] || "#94a3b8",
    };
  });
};

const formatUpdatedAt = (date: Date) =>
  date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// =====================================================================
// DATA PLACEHOLDER (UI ONLY) — belum ada endpoint/relasi datanya.
// Ganti dengan data dari API begitu backend & tipe datanya tersedia.
// Tidak memengaruhi fungsi/data lain yang sudah terhubung ke server.
// =====================================================================
const PLACEHOLDER_KKM_STATS = {
  pesertaAktif: 248,
  totalKelompok: 24,
  desaPenempatan: 8,
  laporanPending: 18,
  dplAktif: 16,
  totalFakultasDpl: 6,
};

const PLACEHOLDER_FAKULTAS_DATA = [
  { name: "Teknik", value: 18, fill: "#ef4444" },
  { name: "Ekonomi", value: 14, fill: "#3b82f6" },
  { name: "FKIP", value: 10, fill: "#f59e0b" },
  { name: "Hukum", value: 6, fill: "#8b5cf6" },
  { name: "Kesehatan", value: 9, fill: "#22c55e" },
  { name: "Lainnya", value: 5, fill: "#94a3b8" },
];

const PLACEHOLDER_KKM_PROGRESS = [
  { name: "K-01", value: 95, status: "good" },
  { name: "K-02", value: 68, status: "warning" },
  { name: "K-03", value: 32, status: "danger" },
  { name: "K-04", value: 98, status: "good" },
  { name: "K-05", value: 72, status: "warning" },
  { name: "K-06", value: 45, status: "danger" },
];

const progressColorMap: Record<string, string> = {
  good: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const PLACEHOLDER_ACTIVITIES = [
  {
    id: 1,
    text: "3 mahasiswa baru diverifikasi oleh Staff LPPM",
    time: "10 menit lalu",
    color: "bg-green-500",
  },
  {
    id: 2,
    text: "Kelompok KKM Batch 2 berhasil digenerate (8 kelompok)",
    time: "45 menit lalu",
    color: "bg-green-500",
  },
  {
    id: 3,
    text: "Proposal PROP-012 disetujui oleh reviewer",
    time: "1 jam lalu",
    color: "bg-green-500",
  },
  {
    id: 4,
    text: "Laporan KKM Kelompok 03 dikirimkan untuk review",
    time: "2 jam lalu",
    color: "bg-blue-500",
  },
  {
    id: 5,
    text: "DPL Dr. Budi Santoso ditetapkan untuk 2 kelompok",
    time: "3 jam lalu",
    color: "bg-blue-500",
  },
  {
    id: 6,
    text: "Pengumuman Periode KKM 2026 dipublikasikan",
    time: "Kemarin",
    color: "bg-blue-500",
  },
];
// =====================================================================

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] =
    useState<AdminDashboardData>(EMPTY_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminDashboard();
        setDashboardData(response.data);
        setUpdatedAt(new Date());
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ||
            err.message ||
            "Gagal memuat data dashboard admin."
          : err instanceof Error
            ? err.message
            : "Gagal memuat data dashboard admin.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const statusData = useMemo(
    () => mapStatusChartData(dashboardData.statusChart),
    [dashboardData.statusChart],
  );

  const kategoriData = useMemo(
    () =>
      dashboardData.kategoriChart.map((item) => ({
        name: item.skema || "Tanpa Skema",
        value: item.jumlah,
      })),
    [dashboardData.kategoriChart],
  );

  const lineData = useMemo(
    () =>
      dashboardData.trendBulanan.map((item) => ({
        name: item.bulan,
        value: item.jumlah,
      })),
    [dashboardData.trendBulanan],
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Admin LPPM
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ringkasan aktivitas Penelitian & KKM — UMC
          </p>
        </div>

        {updatedAt && (
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">
            Diperbarui: {formatUpdatedAt(updatedAt)}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 items-stretch">
        <StatCard
          title="Total Proposal"
          value={isLoading ? "..." : dashboardData.summaryCards.totalProposal}
          desc="Total proposal terdaftar"
          icon={<FileText size={18} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Menunggu Review"
          value={isLoading ? "..." : dashboardData.summaryCards.menungguReview}
          desc="Perlu tindakan segera"
          icon={<Clock size={18} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />

        <StatCard
          title="Peserta KKM Aktif"
          value={PLACEHOLDER_KKM_STATS.pesertaAktif}
          desc="KKM Reguler 2026"
          icon={<GraduationCap size={18} />}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />

        <StatCard
          title="Total Kelompok KKM"
          value={PLACEHOLDER_KKM_STATS.totalKelompok}
          desc={`${PLACEHOLDER_KKM_STATS.desaPenempatan} desa penempatan`}
          icon={<UsersRound size={18} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="DPL Aktif"
          value={PLACEHOLDER_KKM_STATS.dplAktif}
          desc={`Dari ${PLACEHOLDER_KKM_STATS.totalFakultasDpl} fakultas`}
          icon={<UserCog size={18} />}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
        />

        <StatCard
          title="Laporan Pending"
          value={PLACEHOLDER_KKM_STATS.laporanPending}
          desc="Menunggu validasi"
          icon={<BookOpen size={18} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* AKSI CEPAT — UI only, tombol belum terhubung ke aksi apa pun */}
      <div className="bg-linear-to-r from-red-600 to-red-500 rounded-2xl p-6 shadow-sm">
        <p className="text-white/80 text-xs font-semibold tracking-wide mb-3">
          AKSI CEPAT
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Tambah Periode KKM
          </button>
          <button
            type="button"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Zap size={16} />
            Generate Kelompok
          </button>
          <button
            type="button"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Bell size={16} />
            Tambah Pengumuman
          </button>
          <button
            type="button"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* CHART: Status Proposal & Proposal per Fakultas */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">Status Proposal</h2>
          <p className="text-xs text-gray-400 mb-4">
            Distribusi proposal berdasarkan status saat ini
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut "Proposal per Fakultas" — UI placeholder, belum ada API */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">Proposal per Fakultas</h2>
          <p className="text-xs text-gray-400 mb-4">
            Distribusi proposal berdasarkan asal fakultas
          </p>

          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={PLACEHOLDER_FAKULTAS_DATA}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {PLACEHOLDER_FAKULTAS_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-2.5">
              {PLACEHOLDER_FAKULTAS_DATA.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-600">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHART: Tren Proposal Masuk & Progress KKM per Kelompok */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">Tren Proposal Masuk</h2>
          <p className="text-xs text-gray-400 mb-4">
            Jumlah proposal per bulan
          </p>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Progress KKM per Kelompok — UI placeholder, belum ada API */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">
            Progress KKM per Kelompok
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Capaian kegiatan setiap kelompok KKM aktif
          </p>

          <div className="space-y-4 mt-2">
            {PLACEHOLDER_KKM_PROGRESS.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 w-10">
                  {item.name}
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: progressColorMap[item.status],
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500 w-9 text-right">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AKTIVITAS TERBARU — UI placeholder, belum ada API log aktivitas */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={18} className="text-red-500" />
            Aktivitas Terbaru
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
          >
            Lihat semua
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {PLACEHOLDER_ACTIVITIES.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <span
                className={`w-2 h-2 rounded-full mt-1.5 ${activity.color}`}
              />
              <div>
                <p className="text-sm text-gray-700">{activity.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

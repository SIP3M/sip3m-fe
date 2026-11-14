import StatCard from "@/components/dashboard/StatCard";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  ListChecks,
  UserCheck,
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
  fakultasChart: [],
  recentProposals: [],
  tahunTersedia: [],
};

const statusLabelMap: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ADMIN_VERIFIED: "Admin Verified",
  UNDER_REVIEW: "Under Review",
  REVISION: "Revision",
  REVIEW_DONE: "Menunggu Keputusan",
  ACCEPTED: "Disetujui",
  REJECTED: "Ditolak",
};

const statusColorMap: Record<string, string> = {
  DRAFT: "#94a3b8",
  SUBMITTED: "#3b82f6",
  ADMIN_VERIFIED: "#3b82f6",
  UNDER_REVIEW: "#f59e0b",
  REVISION: "#fb923c",
  REVIEW_DONE: "#6366f1",
  ACCEPTED: "#22c55e",
  REJECTED: "#ef4444",
};

const statusBadgeClass: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  ADMIN_VERIFIED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  REVISION: "bg-orange-100 text-orange-700",
  REVIEW_DONE: "bg-indigo-100 text-indigo-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
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

const formatWaktuLalu = (dateInput: string) => {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const menit = Math.floor(diffMs / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Palet warna donut — dirotasi untuk jumlah kategori tak terbatas
const DONUT_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#22c55e",
  "#64748b",
  "#ec4899",
  "#14b8a6",
];

const toDonutData = (
  items: Array<{ name: string; value: number }>,
) =>
  items.map((item, index) => ({
    ...item,
    fill: DONUT_COLORS[index % DONUT_COLORS.length],
  }));

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] =
    useState<AdminDashboardData>(EMPTY_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  // Filter tahun: null = Semua Tahun
  const [tahun, setTahun] = useState<number | null>(null);
  // Snapshot tahun dari respons pertama (untuk dropdown sebelum filter aktif)
  const [tahunTersedia, setTahunTersedia] = useState<number[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminDashboard(tahun ?? undefined);
        setDashboardData(response.data);
        setTahunTersedia(response.data.tahunTersedia);
        setUpdatedAt(new Date());
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ||
            err.message ||
            "Gagal memuat data dashboard penelitian."
          : err instanceof Error
            ? err.message
            : "Gagal memuat data dashboard penelitian.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [tahun]);

  const statusData = useMemo(
    () => mapStatusChartData(dashboardData.statusChart),
    [dashboardData.statusChart],
  );

  const kategoriData = useMemo(
    () =>
      toDonutData(
        dashboardData.kategoriChart.map((item) => ({
          name: item.skema || "Tanpa Skema",
          value: item.jumlah,
        })),
      ),
    [dashboardData.kategoriChart],
  );

  const fakultasData = useMemo(
    () =>
      toDonutData(
        dashboardData.fakultasChart.map((item) => ({
          name: item.fakultas,
          value: item.jumlah,
        })),
      ),
    [dashboardData.fakultasChart],
  );

  const lineData = useMemo(
    () =>
      dashboardData.trendBulanan.map((item) => ({
        name: item.bulan,
        value: item.jumlah,
      })),
    [dashboardData.trendBulanan],
  );

  const aksiCepat = [
    {
      label: "Daftar Proposal",
      icon: FileText,
      path: "/proposals",
    },
    {
      label: "Plotting Reviewer",
      icon: UserCheck,
      path: "/plotting-reviewer",
    },
    {
      label: "Monitoring Proyek",
      icon: Activity,
      path: "/monitoring-project",
    },
  ];

  const donutLegend = (items: Array<{ name: string; value: number; fill: string }>) => (
    <div className="flex-1 w-full space-y-2.5">
      {items.length === 0 && (
        <p className="text-sm text-gray-400">Belum ada data.</p>
      )}
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between text-sm"
        >
          <span className="flex items-center gap-2 text-gray-600 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <span className="truncate">{item.name}</span>
          </span>
          <span className="font-medium text-gray-900 ml-2">{item.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Penelitian
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ringkasan aktivitas Penelitian — UMC
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter tahun */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Tahun</span>
            <select
              value={tahun === null ? "" : String(tahun)}
              onChange={(e) => {
                const raw = e.target.value;
                setTahun(raw === "" ? null : Number(raw));
              }}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 cursor-pointer"
            >
              <option value="">Semua Tahun</option>
              {tahunTersedia.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          {updatedAt && (
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">
              Diperbarui: {formatUpdatedAt(updatedAt)}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STAT CARDS — semua dari API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <StatCard
          title="Total Proposal"
          value={isLoading ? "..." : dashboardData.summaryCards.totalProposal}
          desc={tahun === null ? "Total proposal terdaftar" : `Tahun ${tahun}`}
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
          title="Proposal Disetujui"
          value={isLoading ? "..." : dashboardData.summaryCards.proposalDisetujui}
          desc="Status ACCEPTED"
          icon={<CheckCircle size={18} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <StatCard
          title="Dosen Aktif"
          value={isLoading ? "..." : dashboardData.summaryCards.dosenAktif}
          desc="Terdaftar aktif"
          icon={<Users size={18} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* AKSI CEPAT — terhubung ke halaman manajemen penelitian */}
      <div className="bg-linear-to-r from-red-600 to-red-500 rounded-2xl p-6 shadow-sm">
        <p className="text-white/80 text-xs font-semibold tracking-wide mb-3">
          AKSI CEPAT
        </p>
        <div className="flex flex-wrap gap-3">
          {aksiCepat.map((aksi) => (
            <button
              key={aksi.path}
              type="button"
              onClick={() => navigate(aksi.path)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <aksi.icon size={16} />
              {aksi.label}
            </button>
          ))}
        </div>
      </div>

      {/* CHART: Status Proposal & Proposal per Fakultas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Donut "Proposal per Fakultas" — dari API */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">Proposal per Fakultas</h2>
          <p className="text-xs text-gray-400 mb-4">
            Distribusi proposal berdasarkan asal fakultas
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fakultasData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {fakultasData.map((entry) => (
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
            </div>

            {donutLegend(fakultasData)}
          </div>
        </div>
      </div>

      {/* CHART: Tren Proposal Masuk & Proposal per Skema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">Tren Proposal Masuk</h2>
          <p className="text-xs text-gray-400 mb-4">
            {tahun === null
              ? "Jumlah proposal per bulan (6 bulan terakhir)"
              : `Jumlah proposal per bulan — tahun ${tahun}`}
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
                cursor={false}
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

        {/* Donut "Proposal per Skema" — kategoriChart dari API */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">Proposal per Skema</h2>
          <p className="text-xs text-gray-400 mb-4">
            Distribusi proposal berdasarkan skema pendanaan
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kategoriData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {kategoriData.map((entry) => (
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
            </div>

            {donutLegend(kategoriData)}
          </div>
        </div>
      </div>

      {/* PROPOSAL TERBARU — dari API (menggantikan aktivitas hardcode) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ListChecks size={18} className="text-red-500" />
            Proposal Terbaru
          </h2>
          <button
            type="button"
            onClick={() => navigate("/proposals")}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
          >
            Lihat semua
            <ChevronRight size={16} />
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400">Memuat proposal terbaru...</p>
        ) : dashboardData.recentProposals.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada proposal.</p>
        ) : (
          <div className="space-y-4">
            {dashboardData.recentProposals.map((proposal) => {
              const key = getStatusKey(proposal.status);
              return (
                <button
                  key={proposal.id}
                  type="button"
                  onClick={() => navigate(`/proposals/${proposal.id}`)}
                  className="w-full flex items-start gap-3 text-left hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full mt-1.5 bg-red-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">
                      {proposal.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      PROP-{String(proposal.id).padStart(3, "0")} ·{" "}
                      {formatWaktuLalu(proposal.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      statusBadgeClass[key] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabelMap[key] || key}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

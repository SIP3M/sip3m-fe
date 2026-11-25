import StatCard from "@/components/dashboard/StatCard";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Clock,
  CheckCircle,
  Users,
  UserCheck,
  Activity,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  ListChecks,
} from "lucide-react";
import { getStaffDashboard } from "./dashboard.api";
import {
  StaffDashboardData,
  StaffPrioritasKey,
} from "./dashboard.types";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const EMPTY_DASHBOARD_DATA: StaffDashboardData = {
  summaryCards: {
    totalProposal: 0,
    perluVerifikasi: 0,
    proposalDisetujui: 0,
    dosenAktif: 0,
  },
  verifikasiChart: [],
  aktivitasMingguan: [],
  proposalPerluVerifikasi: [],
  prioritas: [],
  recentProposals: [],
};

const statusLabelMap: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ADMIN_VERIFIED: "Terverifikasi",
  ADMIN_REVISION: "Revisi Administrasi",
  UNDER_REVIEW: "Under Review",
  REVISION: "Revisi",
  REVISION_PENDING: "Menunggu Revisi",
  REVIEW_DONE: "Menunggu Keputusan",
  ACCEPTED: "Disetujui",
  REJECTED: "Ditolak",
};

const statusBadgeClass: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  ADMIN_VERIFIED: "bg-blue-100 text-blue-700",
  ADMIN_REVISION: "bg-amber-100 text-amber-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  REVISION: "bg-orange-100 text-orange-700",
  REVISION_PENDING: "bg-orange-100 text-orange-700",
  REVIEW_DONE: "bg-indigo-100 text-indigo-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

// Warna donut pipeline verifikasi (urutan label = urutan dari BE)
const VERIFIKASI_COLORS: Record<string, string> = {
  Draft: "#94a3b8",
  "Perlu Verifikasi": "#f59e0b",
  Terverifikasi: "#3b82f6",
  "Dalam Review": "#8b5cf6",
  Disetujui: "#22c55e",
  Ditolak: "#ef4444",
};

// Prioritas: key dari BE → label, ikon, dan rute halaman staff
const PRIORITAS_META: Record<
  StaffPrioritasKey,
  { label: string; path: string; Icon: typeof AlertTriangle }
> = {
  verifikasi: {
    label: "Menunggu verifikasi",
    path: "/staff-lppm/verifikasi-proposal",
    Icon: Clock,
  },
  plotting: {
    label: "Menunggu plotting reviewer",
    path: "/staff-lppm/plotting-reviewer",
    Icon: UserCheck,
  },
  review: {
    label: "Review proposal berjalan",
    path: "/staff-lppm/plotting-reviewer",
    Icon: Activity,
  },
};

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

const formatDate = (dateInput: string) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] =
    useState<StaffDashboardData>(EMPTY_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getStaffDashboard();
        setDashboardData(response.data);
        setUpdatedAt(new Date());
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ||
            err.message ||
            "Gagal memuat data dashboard staff."
          : err instanceof Error
            ? err.message
            : "Gagal memuat data dashboard staff.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  // Donut: warna per label + data hanya slice yang > 0
  const verifikasiData = useMemo(
    () =>
      dashboardData.verifikasiChart
        .filter((item) => item.jumlah > 0)
        .map((item) => ({
          name: item.label,
          value: item.jumlah,
          fill: VERIFIKASI_COLORS[item.label] ?? "#64748b",
        })),
    [dashboardData.verifikasiChart],
  );

  // Bar aktivitas 7 hari: 2 series (Masuk & Diproses)
  const aktivitasData = useMemo(
    () =>
      dashboardData.aktivitasMingguan.map((item) => ({
        name: item.hari,
        tanggal: item.tanggal,
        masuk: item.masuk,
        diproses: item.diproses,
      })),
    [dashboardData.aktivitasMingguan],
  );

  const aksesCepat = [
    { label: "Plotting Reviewer", icon: UserCheck, path: "/staff-lppm/plotting-reviewer" },
    { label: "Monitoring Proyek", icon: Activity, path: "/staff-lppm/monitoring-project" },
  ];

  const donutLegend = (
    items: Array<{ name: string; value: number; fill: string }>,
  ) => (
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
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Staff LPPM
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan verifikasi proposal penelitian — LPPM
          </p>
        </div>

        {updatedAt && (
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">
            Diperbarui:{" "}
            {updatedAt.toLocaleString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STAT CARDS — dari API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <StatCard
          title="Total Proposal"
          value={isLoading ? "..." : dashboardData.summaryCards.totalProposal}
          desc="Semua status"
          icon={<FileText size={18} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Perlu Verifikasi"
          value={isLoading ? "..." : dashboardData.summaryCards.perluVerifikasi}
          desc="Butuh tindakan"
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

      {/* AKSI CEPAT */}
      <div className="bg-linear-to-r from-red-600 to-red-500 rounded-2xl p-6 shadow-sm">
        <p className="text-white/80 text-xs font-semibold tracking-wide mb-3">
          AKSES CEPAT
        </p>
        <div className="flex flex-wrap gap-3">
          {aksesCepat.map((aksi) => (
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

      {/* CHART ROW: Donut verifikasi & Aktivitas mingguan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Verifikasi Proposal (donut) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">
            Status Verifikasi Proposal
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Distribusi seluruh proposal berdasarkan tahap verifikasi
          </p>

          {isLoading ? (
            <p className="text-sm text-gray-400">Memuat data...</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-1/2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verifikasiData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {verifikasiData.map((entry) => (
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

              {donutLegend(verifikasiData)}

              <p className="text-xs text-gray-400 w-full sm:w-auto text-center sm:text-left border-t border-gray-100 pt-2">
                Total{" "}
                <span className="font-semibold text-gray-700">
                  {dashboardData.summaryCards.totalProposal}
                </span>{" "}
                proposal
              </p>
            </div>
          )}
        </div>

        {/* Aktivitas Mingguan (bar chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900">Aktivitas Mingguan</h2>
          <p className="text-xs text-gray-400 mb-4">
            Proposal masuk & diproses per hari (7 hari terakhir)
          </p>

          {isLoading ? (
            <p className="text-sm text-gray-400">Memuat data...</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={aktivitasData}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={false}
                    formatter={(value, name) => [
                      value,
                      name === "masuk" ? "Masuk" : "Diproses",
                    ]}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload as
                        | { tanggal?: string }
                        | undefined;
                      if (!item?.tanggal) return label;
                      return `${String(label)} (${formatDate(item.tanggal)})`;
                    }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar
                    dataKey="masuk"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="diproses"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Masuk (baru dibuat)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Diproses (diperbarui)
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BOTTOM: Tabel perlu verifikasi + prioritas + terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Proposal Perlu Verifikasi */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ListChecks size={18} className="text-red-500" />
              Proposal Perlu Verifikasi
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {dashboardData.summaryCards.perluVerifikasi}
              </span>
            </h2>
            <button
              type="button"
              onClick={() => navigate("/staff-lppm/verifikasi-proposal")}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              Lihat semua
              <ChevronRight size={16} />
            </button>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-400">Memuat proposal...</p>
          ) : dashboardData.proposalPerluVerifikasi.length === 0 ? (
            <p className="text-sm text-gray-400">
              Tidak ada proposal yang menunggu verifikasi.
            </p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-gray-400 text-xs border-b border-gray-100">
                  <tr>
                    <th className="text-left pb-2 font-medium">
                      Judul Proposal
                    </th>
                    <th className="text-left pb-2 font-medium">Fakultas</th>
                    <th className="text-left pb-2 font-medium">Tgl Masuk</th>
                    <th className="text-left pb-2 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.proposalPerluVerifikasi.map((proposal) => (
                    <tr key={proposal.id} className="border-t border-gray-100">
                      <td className="py-3 font-medium text-gray-800 max-w-[260px] truncate">
                        {proposal.title}
                      </td>
                      <td className="text-gray-600 max-w-[160px] truncate">
                        {proposal.faculty?.trim() || "-"}
                      </td>
                      <td className="text-gray-600 whitespace-nowrap">
                        {formatDate(proposal.created_at)}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/staff-lppm/verifikasi-proposal/${proposal.id}`,
                            )
                          }
                          className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Verifikasi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="space-y-4">
          {/* Prioritas — derive dari data */}
          <div className="rounded-2xl shadow-sm bg-red-50 border border-red-100 p-5">
            <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle size={16} />
              Prioritas Hari Ini
            </h2>

            <div className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-gray-500">Memuat data...</p>
              ) : (
                dashboardData.prioritas.map((item) => {
                  const meta = PRIORITAS_META[item.key];
                  if (!meta) return null;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => navigate(meta.path)}
                      className="w-full flex items-center justify-between gap-2 bg-white/70 hover:bg-white rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <meta.Icon
                          size={15}
                          className="text-red-500 shrink-0"
                        />
                        <span className="truncate">{meta.label}</span>
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="font-semibold text-gray-900">
                          {item.jumlah}
                        </span>
                        <ChevronRight size={14} className="text-gray-400" />
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Proposal Terbaru */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Activity size={16} className="text-red-500" />
              Proposal Terbaru
            </h2>

            {isLoading ? (
              <p className="text-sm text-gray-400">Memuat data...</p>
            ) : dashboardData.recentProposals.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada proposal.</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentProposals.map((proposal) => {
                  const key = String(proposal.status)
                    .trim()
                    .toUpperCase()
                    .replace(/[^A-Z0-9]+/g, "_")
                    .replace(/^_+|_+$/g, "");

                  return (
                    <div key={proposal.id} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full mt-1.5 bg-red-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 truncate">
                          {proposal.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Akses cepat versi tombol (konsisten dengan menu sidebar) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 tracking-wide mb-3">
              MENU LAINNYA
            </h2>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate("/staff-lppm/verifikasi-proposal")}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Verifikasi Proposal
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/staff-lppm/repository-publik")}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Repository Publik
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

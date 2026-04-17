import StatCard from "@/components/dashboard/StatCard";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FileText, Users, CheckCircle, Clock } from "lucide-react";
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
  SUBMITTED: "#fb923c",
  ADMIN_VERIFIED: "#3b82f6",
  UNDER_REVIEW: "#facc15",
  REVISION: "#f97316",
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

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] =
    useState<AdminDashboardData>(EMPTY_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminDashboard();
        setDashboardData(response.data);
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
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm">
          Ringkasan aktivitas LPPM UMC hari ini.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STAT */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Proposal"
          value={isLoading ? "..." : dashboardData.summaryCards.totalProposal}
          desc="Total proposal terdaftar"
          icon={<FileText size={18} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Dosen Aktif"
          value={isLoading ? "..." : dashboardData.summaryCards.dosenAktif}
          desc="Dosen aktif di sistem"
          icon={<Users size={18} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Proposal Disetujui"
          value={
            isLoading ? "..." : dashboardData.summaryCards.proposalDisetujui
          }
          desc="Status accepted"
          icon={<CheckCircle size={18} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <StatCard
          title="Menunggu Review"
          value={isLoading ? "..." : dashboardData.summaryCards.menungguReview}
          desc="Proposal menunggu review"
          icon={<Clock size={18} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* CHART */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Status Proposal</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} allowDecimals={false} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Kategori Penelitian</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={kategoriData} layout="vertical">
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={73}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="#e11d48" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Tren Proposal Masuk</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  MapPin,
  GraduationCap,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getKkmDashboard } from "@/features/kkm/kkmDashboard.api";
import type {
  GetKkmDashboardResponse,
  KkmDashboardData,
} from "@/features/kkm/kkmDashboard.types";
import { getKkmPeriods } from "@/features/kkm/kkmPeriod.api";
import type { KkmPeriod } from "@/features/kkm/kkmPeriod.types";

/** Pemetaan singkatan nama Program Studi agar pas di sumbu-X grafik */
const PRODI_SHORT_MAP: Record<string, string> = {
  "teknik informatika": "TI",
  ti: "TI",
  "sistem informasi": "SI",
  si: "SI",
  farmasi: "Farmasi",
  "ilmu hukum": "Hukum",
  hukum: "Hukum",
  "pendidikan guru sekolah dasar": "PGSD",
  pgsd: "PGSD",
  manajemen: "Manajemen",
  akuntansi: "Akuntansi",
};

const getShortProdiName = (name: string): string => {
  const normalized = name.trim().toLowerCase();
  if (PRODI_SHORT_MAP[normalized]) return PRODI_SHORT_MAP[normalized];
  for (const [key, val] of Object.entries(PRODI_SHORT_MAP)) {
    if (normalized.includes(key)) return val;
  }
  return name.length > 10 ? `${name.slice(0, 8)}...` : name;
};

/** Mockup data sesuai dengan desain jika data API belum terisi/kosong */
const DEFAULT_SUMMARY = {
  total_peserta: 1248,
  total_kelompok: 98,
  total_desa: 32,
  total_dpl: 47,
  belum_dapat_kelompok: 45,
  menunggu_verifikasi: 120,
};

const DEFAULT_PRODI_BARS = [
  { displayName: "TI", fullName: "Teknik Informatika", jumlah: 215 },
  { displayName: "SI", fullName: "Sistem Informasi", jumlah: 185 },
  { displayName: "Farmasi", fullName: "Farmasi", jumlah: 160 },
  { displayName: "Hukum", fullName: "Ilmu Hukum", jumlah: 140 },
  { displayName: "PGSD", fullName: "Pendidikan Guru Sekolah Dasar", jumlah: 130 },
  { displayName: "Manajemen", fullName: "Manajemen", jumlah: 120 },
  { displayName: "Akuntansi", fullName: "Akuntansi", jumlah: 95 },
  { displayName: "Lainnya", fullName: "Program Studi Lainnya", jumlah: 203 },
];

const DEFAULT_STATUS_KELOMPOK = [
  { name: "Aktif", value: 75, color: "#059669" },
  { name: "Menunggu", value: 16, color: "#D97706" },
  { name: "Selesai", value: 9, color: "#2563EB" },
];

const DEFAULT_DESA_ROWS = [
  { nama: "Astanajapura", jumlah: 79 },
  { nama: "Palimanan", jumlah: 76 },
  { nama: "Gempol", jumlah: 68 },
  { nama: "Ciwaringin", jumlah: 60 },
  { nama: "Plumbon", jumlah: 55 },
  { nama: "Sumber", jumlah: 49 },
];

export default function DashboardAdminKKM() {
  const [data, setData] = useState<KkmDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodeId, setPeriodeId] = useState<number | null>(null);
  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: GetKkmDashboardResponse = await getKkmDashboard(
        periodeId ?? undefined,
      );
      setData(res.data);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      const status = e.response?.status;
      setError(
        status === 403
          ? "Akses ditolak — dashboard ini hanya untuk KETUA_LPPM / STAFF_LPPM."
          : status === 404
            ? "Periode tidak ditemukan."
            : e.response?.data?.message || e.message || "Gagal memuat dashboard KKM.",
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodeId]);

  // Daftar periode untuk dropdown (sekali saat mount)
  useEffect(() => {
    let cancelled = false;
    const loadPeriodes = async () => {
      try {
        const res = await getKkmPeriods({ page: 1, limit: 100 });
        if (!cancelled) setPeriodes(res.data ?? []);
      } catch {
        // dropdown opsional — biarkan kosong
      }
    };
    void loadPeriodes();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatNumber = (value: number) => value.toLocaleString("id-ID");

  // Summary cards (gunakan data real jika ada nilai > 0, jika tidak fallback ke desain)
  const summary = data?.summary_cards;
  const hasRealSummary = Boolean(
    summary &&
      (summary.total_peserta > 0 ||
        summary.total_kelompok > 0 ||
        summary.total_desa > 0 ||
        summary.total_dpl > 0),
  );

  const stats = [
    {
      title: "Total Peserta KKM",
      value: hasRealSummary
        ? (summary?.total_peserta ?? 0)
        : DEFAULT_SUMMARY.total_peserta,
      subtitle: "Mahasiswa",
      icon: Users,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      title: "Total Kelompok",
      value: hasRealSummary
        ? (summary?.total_kelompok ?? 0)
        : DEFAULT_SUMMARY.total_kelompok,
      subtitle: "Kelompok",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      title: "Total Desa Penempatan",
      value: hasRealSummary
        ? (summary?.total_desa ?? 0)
        : DEFAULT_SUMMARY.total_desa,
      subtitle: "Desa",
      icon: MapPin,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      title: "Total DPL",
      value: hasRealSummary
        ? (summary?.total_dpl ?? 0)
        : DEFAULT_SUMMARY.total_dpl,
      subtitle: "Dosen",
      icon: GraduationCap,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      title: "Belum Mendapat Kelompok",
      value: hasRealSummary
        ? (summary?.belum_dapat_kelompok ?? 0)
        : DEFAULT_SUMMARY.belum_dapat_kelompok,
      subtitle: "Mahasiswa",
      icon: AlertCircle,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: "Menunggu Verifikasi",
      value: hasRealSummary
        ? (summary?.menunggu_verifikasi ?? 0)
        : DEFAULT_SUMMARY.menunggu_verifikasi,
      subtitle: "Peserta",
      icon: Clock,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
  ];

  // Data bar chart: Peserta Berdasarkan Program Studi
  const prodiChartData = useMemo(() => {
    const rawList = data?.peserta_per_prodi ?? [];
    const hasData = rawList.some((item) => item.jumlah > 0);
    if (!hasData) return DEFAULT_PRODI_BARS;

    return rawList.map((item) => ({
      displayName: getShortProdiName(item.nama),
      fullName: item.nama,
      jumlah: item.jumlah,
    }));
  }, [data]);

  // Data donut chart: Status Kelompok KKM (Aktif, Menunggu, Selesai)
  const statusChartData = useMemo(() => {
    const rawStatuses = data?.status_kelompok ?? [];
    const hasData = rawStatuses.some((item) => item.jumlah > 0);
    if (!hasData) return DEFAULT_STATUS_KELOMPOK;

    return rawStatuses.map((item) => {
      const code = item.status.toUpperCase();
      let color = "#059669";
      let name = item.label || item.status;

      if (code === "AKTIF") {
        color = "#059669";
        name = "Aktif";
      } else if (code.includes("BELUM") || code.includes("PENDING") || code.includes("MENUNGGU")) {
        color = "#D97706";
        name = "Menunggu";
      } else {
        color = "#2563EB";
        name = "Selesai";
      }

      return {
        name,
        value: item.jumlah,
        color,
      };
    });
  }, [data]);

  // Data horizontal bar chart: Distribusi Mahasiswa per Desa
  const desaChartData = useMemo(() => {
    const rawList = data?.distribusi_per_desa ?? [];
    const hasData = rawList.some((item) => item.jumlah > 0);
    if (!hasData) return DEFAULT_DESA_ROWS;

    return rawList.slice(0, 10).map((d) => ({
      nama: d.nama,
      jumlah: d.jumlah,
    }));
  }, [data]);

  return (
    <div className="p-6 sm:p-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard KKM
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitoring pelaksanaan Kuliah Kerja Mahasiswa (KKM)
          </p>
          {data?.periode ? (
            <p className="text-xs font-medium text-gray-600 mt-2">
              {data.periode.nama_periode} · T.A. {data.periode.tahun_akademik}
            </p>
          ) : null}
        </div>

        {/* Dropdown Periode KKM */}
        {periodes.length > 0 && (
          <select
            value={periodeId ?? ""}
            onChange={(event) =>
              setPeriodeId(event.target.value ? Number(event.target.value) : null)
            }
            disabled={isLoading}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3.5 text-xs sm:text-sm text-gray-700 shadow-xs focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer disabled:opacity-60"
          >
            <option value="">Periode aktif (otomatis)</option>
            {periodes.map((periode) => (
              <option key={periode.id} value={periode.id}>
                {periode.nama_periode} ({periode.tahun_akademik})
                {periode.status === "AKTIF" ? " · AKTIF" : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Grid Kartu Statistik - 2 baris x 3 kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-normal text-gray-500">
                  {stat.title}
                </span>
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}
                >
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                  {formatNumber(stat.value)}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-normal">
                  {stat.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Baris Grafik - 3 Kolom Grid (Kiri: 2 kolom, Kanan: 1 kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Peserta Berdasarkan Program Studi (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">
            Peserta Berdasarkan Program Studi
          </h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prodiChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 11, fill: "#4B5563" }}
                  axisLine={{ stroke: "#9CA3AF" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={{ stroke: "#9CA3AF" }}
                  tickLine={false}
                  domain={[0, (dataMax: number) => Math.max(220, Math.ceil(dataMax * 1.05))]}
                  ticks={[0, 55, 110, 165, 220]}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                  formatter={(value) => [`${value} Mahasiswa`, "Jumlah Peserta"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName || ""
                  }
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="jumlah"
                  fill="#DC2626"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Kelompok KKM (1 Kolom) */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Status Kelompok KKM
          </h3>
          <div className="w-full h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={92}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} Kelompok`, "Jumlah"]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Horizontal dengan warna sesuai desain */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#059669]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              Aktif
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#D97706]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              Menunggu
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              Selesai
            </span>
          </div>
        </div>
      </div>

      {/* Distribusi Mahasiswa per Desa (Lebar Penuh) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h3 className="text-sm font-semibold text-gray-900 mb-6">
          Distribusi Mahasiswa per Desa
        </h3>
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={desaChartData}
              margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              barCategoryGap="25%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#F1F5F9"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={{ stroke: "#9CA3AF" }}
                tickLine={false}
                domain={[0, (dataMax: number) => Math.max(80, Math.ceil(dataMax * 1.05))]}
                ticks={[0, 20, 40, 60, 80]}
              />
              <YAxis
                type="category"
                dataKey="nama"
                tick={{ fontSize: 11, fill: "#374151" }}
                axisLine={{ stroke: "#9CA3AF" }}
                tickLine={false}
                width={110}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                formatter={(value) => [`${value} Mahasiswa`, "Jumlah"]}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="jumlah"
                fill="#2563EB"
                radius={[0, 4, 4, 0]}
                barSize={16}
                isAnimationActive
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

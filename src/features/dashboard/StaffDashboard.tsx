import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import {
  FileText,
  Clock,
  GraduationCap,
  UsersRound,
  Users,
  AlertTriangle,
  Activity,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
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

// =====================================================================
// DATA PLACEHOLDER (UI ONLY) — belum ada endpoint/relasi datanya.
// Sama seperti versi sebelumnya (array [12,18,14,22,16] & tabel hardcode),
// hanya di sini datanya distruktur ulang supaya bisa dipakai chart recharts.
// Ganti dengan data dari API begitu backend staff-dashboard tersedia.
// =====================================================================
const STAT_CARDS = [
  {
    title: "Proposal Aktif",
    value: 50,
    desc: "Semua status",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Perlu Verifikasi",
    value: 5,
    desc: "Butuh tindakan",
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Peserta KKM",
    value: 248,
    desc: "Aktif periode ini",
    icon: GraduationCap,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Kelompok KKM",
    value: 24,
    desc: "Sudah terbentuk",
    icon: UsersRound,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Dosen Aktif",
    value: 142,
    desc: "Di 6 fakultas",
    icon: Users,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
];

const VERIFIKASI_DATA = [
  { name: "Perlu Verifikasi", value: 5, fill: "#f59e0b" },
  { name: "Terverifikasi", value: 18, fill: "#22c55e" },
  { name: "Ditolak", value: 3, fill: "#ef4444" },
];
const TOTAL_PROPOSAL_MASUK = VERIFIKASI_DATA.reduce(
  (sum, item) => sum + item.value,
  0,
);

const AKTIVITAS_MINGGUAN = [
  { name: "Sen", verifikasi: 5, plotting: 3 },
  { name: "Sel", verifikasi: 8, plotting: 5 },
  { name: "Rab", verifikasi: 6, plotting: 4 },
  { name: "Kam", verifikasi: 9, plotting: 7 },
  { name: "Jum", verifikasi: 7, plotting: 5 },
];

const PROPOSAL_PERLU_VERIFIKASI = [
  {
    id: 1,
    judul: "Pemberdayaan UMKM Batik",
    peneliti: "Sari Ekonomi, M.M.",
    tanggal: "2023-10-20",
  },
];

const PRIORITAS_HARI_INI = [
  "Verifikasi 5 proposal baru masuk",
  "Plotting reviewer untuk Batch 2",
  "Cek laporan kemajuan Teknik",
  "Approve peserta KKM batch baru",
];

const AKTIVITAS_TERBARU = [
  {
    id: 1,
    text: "Proposal PROP-008 berhasil diverifikasi",
    time: "15 menit lalu",
    color: "bg-green-500",
  },
  {
    id: 2,
    text: "Reviewer ditetapkan untuk PROP-009",
    time: "1 jam lalu",
    color: "bg-green-500",
  },
  {
    id: 3,
    text: "Peserta KKM batch baru masuk verifikasi",
    time: "2 jam lalu",
    color: "bg-amber-500",
  },
  {
    id: 4,
    text: "Laporan kemajuan Teknik diterima",
    time: "3 jam lalu",
    color: "bg-green-500",
  },
];

const AKSES_CEPAT = [
  { label: "Plotting Reviewer" },
  { label: "Monitoring Proyek" },
  { label: "Keuangan & Hibah" },
];
// =====================================================================

export default function StaffDashboard() {
  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Staff LPPM
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola administrasi, verifikasi proposal, dan monitoring KKM.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 items-stretch">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full min-h-[110px]"
            >
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full ${card.iconBg} ${card.iconColor} mb-4`}
              >
                <Icon size={16} />
              </div>
              <p className="text-xs text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">
                {card.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Verifikasi Proposal (donut) */}
        <Card className="rounded-2xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Status Verifikasi Proposal
            </CardTitle>
            <p className="text-xs text-gray-400">
              Rasio proposal yang telah diverifikasi
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-1/2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={VERIFIKASI_DATA}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {VERIFIKASI_DATA.map((entry) => (
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

              <div className="flex-1 w-full space-y-2.5">
                {VERIFIKASI_DATA.map((item) => (
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
                    <span className="font-semibold text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100 mt-2">
                  Total <span className="font-semibold text-gray-700">{TOTAL_PROPOSAL_MASUK}</span> proposal masuk
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aktivitas Mingguan (bar chart) */}
        <Card className="rounded-2xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Aktivitas Mingguan
            </CardTitle>
            <p className="text-xs text-gray-400">
              Verifikasi & plotting reviewer per hari
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={AKTIVITAS_MINGGUAN}>
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
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar
                  dataKey="verifikasi"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                />
                <Bar
                  dataKey="plotting"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Verifikasi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Plotting
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              Proposal Perlu Verifikasi
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-semibold">
                {PROPOSAL_PERLU_VERIFIKASI.length}
              </span>
            </CardTitle>
            <button className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer">
              Lihat semua
              <ChevronRight size={14} />
            </button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[500px] text-sm">
                <thead className="text-gray-400 text-xs border-b border-gray-100">
                  <tr>
                    <th className="text-left pb-2 font-medium">Judul Proposal</th>
                    <th className="text-left pb-2 font-medium">Peneliti</th>
                    <th className="text-left pb-2 font-medium">Tgl Masuk</th>
                    <th className="text-left pb-2 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPOSAL_PERLU_VERIFIKASI.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="py-3 font-medium text-gray-800">
                        {item.judul}
                      </td>
                      <td className="text-gray-600">{item.peneliti}</td>
                      <td className="text-gray-600">{item.tanggal}</td>
                      <td>
                        <Button
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                        >
                          Verifikasi
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Side */}
        <div className="space-y-4">
          {/* Prioritas */}
          <Card className="rounded-2xl shadow-sm bg-red-50 border border-red-100">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle size={16} />
                Prioritas Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              {PRIORITAS_HARI_INI.map((item, i) => (
                <p key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {item}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Aktivitas Terbaru */}
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={16} className="text-red-500" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {AKTIVITAS_TERBARU.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 ${activity.color}`}
                  />
                  <div>
                    <p className="text-sm text-gray-700">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Akses Cepat */}
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-xs font-semibold text-gray-500 tracking-wide">
                AKSES CEPAT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {AKSES_CEPAT.map((link) => (
                <Button
                  key={link.label}
                  className="w-full justify-between bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {link.label}
                  <ArrowRight size={14} />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
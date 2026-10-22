import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Upload,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatusAksesKkmView from "@/features/mahasiswa/StatusAksesKkmView";
import { useKkmMahasiswaAccessStore } from "@/features/kkm/kkmMahasiswaAccess.store";

/** Jumlah logbook yang disubmit tiap minggu (total = 19) */
const LOGBOOK_PER_MINGGU = [
  { minggu: "W1", jumlah: 2 },
  { minggu: "W2", jumlah: 3 },
  { minggu: "W3", jumlah: 2 },
  { minggu: "W4", jumlah: 4 },
  { minggu: "W5", jumlah: 3 },
  { minggu: "W6", jumlah: 5 },
];

/** Tahapan KKM pada stepper progress */
const TAHAP_KKM = [
  "Pendaftaran",
  "Verifikasi",
  "Kelompok",
  "Pembekalan",
  "Pelaksanaan",
  "Laporan Akhir",
];

/** Status laporan mingguan / tengah */
const STATUS_LAPORAN = [
  { nama: "Laporan Mingguan", status: "Disetujui" },
  { nama: "Laporan Mingguan", status: "Disetujui" },
  { nama: "Laporan Mingguan", status: "Dalam Review" },
  { nama: "Laporan Tengah", status: "Belum Upload" },
];

const BADGE_STATUS_LAPORAN: Record<string, string> = {
  Disetujui: "bg-green-100 text-green-700",
  "Dalam Review": "bg-amber-100 text-amber-700",
  "Belum Upload": "bg-gray-100 text-gray-500",
};

/** Deadline yang mendekati batas waktu */
const DEADLINE = [
  {
    judul: "Upload Logbook Mingguan",
    waktu: "2 hari lagi",
    waktuIcon: "clock" as const,
    highlight: true,
    icon: BookOpen,
  },
  {
    judul: "Laporan Minggu 1",
    waktu: "5 hari lagi",
    waktuIcon: "clock" as const,
    highlight: false,
    icon: FileText,
  },
  {
    judul: "Laporan Tengah",
    waktu: "15 Feb 2026",
    waktuIcon: "calendar" as const,
    highlight: false,
    icon: FileText,
  },
];

/** Pengumuman dari admin/DPL */
const PENGUMUMAN = [
  {
    judul: "Jadwal monitoring DPL minggu depan",
    tanggal: "15 Feb 2026",
  },
  {
    judul: "Deadline laporan tengah diperpanjang",
    tanggal: "18 Feb 2026",
  },
];

export default function DashboardMahasiswaKKM() {
  const navigate = useNavigate();
  const hasAccess = useKkmMahasiswaAccessStore((state) => state.hasAccess);
  const checkAccess = useKkmMahasiswaAccessStore((state) => state.checkAccess);

  useEffect(() => {
    void checkAccess();
  }, [checkAccess]);

  // Jika mahasiswa belum mendapatkan akses dari admin LPPM -> peserta KKM,
  // tampilkan halaman verifikasi berkas persis sesuai desain Screenshot 2026-10-22 103009.png
  if (!hasAccess) {
    return <StatusAksesKkmView />;
  }

  // Tampilan dashboard ketika mahasiswa SUDAH lolos / mendapatkan akses KKM
  const totalLogbook = LOGBOOK_PER_MINGGU.reduce(
    (sum, item) => sum + item.jumlah,
    0,
  );

  const statistik = [
    {
      label: "Status Pendaftaran",
      value: "Verified",
      desc: "KKM Reguler 2026",
      icon: CircleCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Kelompok Saya",
      value: "Kelompok 07",
      desc: "10 Anggota",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "DPL Pembimbing",
      value: "Dr. Ahmad Fauzi",
      desc: "M.Kom",
      icon: GraduationCap,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      label: "Desa Penempatan",
      value: "Astanajapura",
      desc: "Kec. Astanajapura",
      icon: MapPin,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
  ];

  const langkahCepat = [
    { label: "Kelompok", icon: Users, path: "/mahasiswa-dashboard/kelompok" },
    { label: "Logbook", icon: BookOpen, path: "/mahasiswa-dashboard/logbook" },
    { label: "Laporan", icon: FileText, path: "/mahasiswa-dashboard/laporan" },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard KKM</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau perkembangan kegiatan KKM Anda.
        </p>
      </div>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statistik.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
              >
                <Icon size={18} />
              </div>

              <p className="text-sm text-gray-500 mt-4">{item.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {item.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* KONTEN UTAMA */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* KOLOM KIRI */}
        <div className="xl:col-span-2 space-y-6">
          {/* STEPPER PROGRESS KKM */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Tahapan KKM
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tahap 4 dari 6 — Pelaksanaan KKM
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                Aktif
              </span>
            </div>

            <div className="mt-6 flex items-center">
              {TAHAP_KKM.map((tahap, i) => {
                const selesai = i < 4;
                const aktif = i === 4;

                return (
                  <Fragment key={tahap}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          selesai
                            ? "bg-red-600 text-white"
                            : aktif
                            ? "bg-red-600 text-white ring-4 ring-red-100"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {selesai ? <Check size={14} /> : i + 1}
                      </div>

                      <span
                        className={`text-[11px] mt-2 text-center leading-tight line-clamp-1 ${
                          aktif
                            ? "font-bold text-red-600"
                            : selesai
                            ? "text-gray-700 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {tahap}
                      </span>
                    </div>

                    {i < TAHAP_KKM.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 -mt-4 transition-all ${
                          i < 4 ? "bg-red-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </section>

          {/* GRAFIK LOGBOOK */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Aktivitas Logbook
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Total {totalLogbook} kegiatan tercatat
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/mahasiswa-dashboard/logbook")}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                Lihat Logbook
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={LOGBOOK_PER_MINGGU}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorLogbook"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="minggu"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      border: "1px solid #f3f4f6",
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                    formatter={(v) => [`${v} kegiatan`, "Jumlah"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="jumlah"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLogbook)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* STATUS LAPORAN */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Status Laporan
              </h2>
              <button
                type="button"
                onClick={() => navigate("/mahasiswa-dashboard/laporan")}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                Kelola Laporan
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {STATUS_LAPORAN.map((lap, i) => (
                <div
                  key={`${lap.nama}-${i}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {lap.nama} #{i + 1}
                      </p>
                      <p className="text-xs text-gray-400">Minggu ke-{i + 1}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      BADGE_STATUS_LAPORAN[lap.status] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {lap.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          {/* LANGKAH CEPAT */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {langkahCepat.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 group-hover:text-red-600 shadow-xs">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-red-600">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* DEADLINE MENDATANG */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <Clock size={18} className="text-red-500" />
              Tenggat Waktu
            </h2>

            <div className="mt-4 space-y-3">
              {DEADLINE.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.judul}
                    className={`flex items-start gap-3 rounded-xl border p-3 ${
                      item.highlight
                        ? "border-red-200 bg-red-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        item.highlight ? "text-red-500" : "text-gray-400"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.judul}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-red-500">
                        {item.waktuIcon === "calendar" ? (
                          <CalendarDays size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {item.waktu}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PENGUMUMAN */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <Bell size={18} className="text-red-500" />
              Pengumuman
            </h2>

            <div className="mt-4 space-y-4">
              {PENGUMUMAN.map((item) => (
                <div key={item.judul} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.judul}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.tanggal}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate("/mahasiswa-dashboard/pengumuman")}
              className="mt-5 flex items-center gap-1 text-sm font-semibold text-red-600 transition-colors hover:text-red-700 cursor-pointer"
            >
              Lihat semua
              <ChevronRight size={14} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

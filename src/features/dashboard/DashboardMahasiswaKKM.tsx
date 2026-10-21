import { Fragment, useMemo, useState } from "react";
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

// =====================================================================
// DATA STATIS — dashboard mahasiswa belum terhubung ke API.
// Ganti sumber data di bawah ini ketika endpoint dashboard mahasiswa
// tersedia ( lihat features/kkm/kkmDashboard.api.ts untuk pola ).
// =====================================================================

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

// ---------------------------------------------------------------------
// Demo state — mensimulasikan tahap pendaftaran mahasiswa
// ---------------------------------------------------------------------
const DEMO_STATES = ["BELUM_DAFTAR", "MENUNGGU", "LOLOS"] as const;
type DemoState = (typeof DEMO_STATES)[number];

interface DemoStateConfig {
  label: string;
  status: string;
  statusDesc: string;
  /** Index tahap yang sedang berjalan */
  activeIndex: number;
  /** Jumlah tahap yang sudah selesai */
  doneCount: number;
  tahapAktif: string;
}

const DEMO_STATE_CONFIG: Record<DemoState, DemoStateConfig> = {
  BELUM_DAFTAR: {
    label: "Belum Daftar",
    status: "Belum Daftar",
    statusDesc: "Belum mendaftar periode ini",
    activeIndex: 0,
    doneCount: 0,
    tahapAktif: "Pendaftaran KKM",
  },
  MENUNGGU: {
    label: "Menunggu Verifikasi",
    status: "Menunggu",
    statusDesc: "Menunggu verifikasi admin",
    activeIndex: 1,
    doneCount: 1,
    tahapAktif: "Verifikasi KKM",
  },
  LOLOS: {
    label: "Sudah Lolos",
    status: "Verified",
    statusDesc: "KKM Reguler 2026",
    activeIndex: 4,
    doneCount: 4,
    tahapAktif: "Pelaksanaan KKM",
  },
};

export default function DashboardMahasiswaKKM() {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState<DemoState>("LOLOS");
  const config = DEMO_STATE_CONFIG[demoState];

  const totalLogbook = useMemo(
    () => LOGBOOK_PER_MINGGU.reduce((sum, item) => sum + item.jumlah, 0),
    [],
  );

  const statistik = [
    {
      label: "Status Pendaftaran",
      value: config.status,
      desc: config.statusDesc,
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* DEMO STATE */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <span className="text-sm font-semibold text-blue-600">Demo State:</span>

        {DEMO_STATES.map((state) => {
          const active = state === demoState;
          return (
            <button
              key={state}
              type="button"
              onClick={() => setDemoState(state)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              {DEMO_STATE_CONFIG[state].label}
            </button>
          );
        })}
      </div>

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
          {/* PROGRESS KKM SAYA */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900">
              Progress KKM Saya
            </h2>

            {/* STEPPER */}
            <div className="flex items-start mt-5">
              {TAHAP_KKM.map((tahap, index) => {
                const state =
                  index < config.doneCount
                    ? "done"
                    : index === config.activeIndex
                      ? "active"
                      : "todo";

                const isLast = index === TAHAP_KKM.length - 1;

                return (
                  <Fragment key={tahap}>
                    <div className="flex w-16 shrink-0 flex-col items-center">
                      {/* NODE */}
                      {state === "done" ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500">
                          <Check size={15} className="text-white" />
                        </span>
                      ) : state === "active" ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600">
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        </span>
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-white" />
                      )}

                      {/* LABEL */}
                      <span
                        className={`mt-2 text-center text-[11px] leading-tight ${
                          state === "done"
                            ? "text-green-600"
                            : state === "active"
                              ? "font-bold text-red-600"
                              : "text-gray-400"
                        }`}
                      >
                        {tahap}
                      </span>
                    </div>

                    {/* GARIS PENGHUBUNG */}
                    {!isLast && (
                      <div
                        className={`mt-[13px] h-0.5 flex-1 ${
                          state === "done" ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>

            {/* TAHAP AKTIF */}
            <p className="text-sm text-gray-500 mt-6">
              Tahap aktif:{" "}
              <span className="font-bold text-red-600">{config.tahapAktif}</span>
            </p>

            {/* LANGKAH CEPAT */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {langkahCepat.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer"
                  >
                    <Icon size={16} className="text-gray-500" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* AKTIVITAS LOGBOOK */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Aktivitas Logbook
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Jumlah logbook yang disubmit per minggu
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {totalLogbook} Total
              </span>
            </div>

            <div className="mt-4">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={LOGBOOK_PER_MINGGU}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="logbookFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#ef4444"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="100%"
                        stopColor="#ef4444"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="minggu"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 8]}
                    ticks={[0, 2, 4, 6, 8]}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
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
                    formatter={(value) => [`${value} logbook`, "Jumlah"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="jumlah"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#logbookFill)"
                    dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#ef4444", strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* STATUS LAPORAN + AKSI CEPAT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STATUS LAPORAN */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900">
                Status Laporan
              </h2>

              <div className="mt-4 space-y-3">
                {STATUS_LAPORAN.map((row) => (
                  <div
                    key={`${row.nama}-${row.status}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-gray-600">{row.nama}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        BADGE_STATUS_LAPORAN[row.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* AKSI CEPAT */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900">Aksi Cepat</h2>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate("/mahasiswa-dashboard/logbook")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 cursor-pointer"
                >
                  <BookOpen size={16} />
                  Isi Logbook
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/mahasiswa-dashboard/laporan")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-600 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                >
                  <Upload size={16} />
                  Upload Laporan
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          {/* DEADLINE MENDATANG */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <AlertTriangle size={18} className="text-red-500" />
              Deadline Mendatang
            </h2>

            <div className="mt-4 space-y-3">
              {DEADLINE.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.judul}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                      item.highlight
                        ? "border-red-100 bg-red-50"
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

import {
  Users,
  UsersRound,
  BookOpen,
  FileText,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Clock,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// =====================================================================
// DATA STATIS — halaman ini belum terhubung ke API (modul KKM belum
// punya endpoint). Ganti dengan data dari API begitu tersedia.
// Angka di kartu statistik dihitung otomatis dari KELOMPOK_BIMBINGAN,
// jadi cukup ganti sumber array ini saja nanti.
// =====================================================================
type StatusKelompok = 'Aktif' | 'Perlu Monitoring' | 'Selesai';

interface KelompokBimbingan {
  id: number;
  nama: string;
  lokasi: string;
  status: StatusKelompok;
  anggota: number;
  logbook: number;
  laporan: number;
  progress: number;
}

const KELOMPOK_BIMBINGAN: KelompokBimbingan[] = [
  { id: 1, nama: 'Kelompok 01', lokasi: 'Astanajapura', status: 'Aktif', anggota: 10, logbook: 5, laporan: 2, progress: 80 },
  { id: 2, nama: 'Kelompok 02', lokasi: 'Palimanan', status: 'Aktif', anggota: 10, logbook: 3, laporan: 1, progress: 55 },
  { id: 3, nama: 'Kelompok 03', lokasi: 'Gempol', status: 'Perlu Monitoring', anggota: 10, logbook: 8, laporan: 3, progress: 30 },
  { id: 4, nama: 'Kelompok 04', lokasi: 'Ciwaringin', status: 'Selesai', anggota: 10, logbook: 2, laporan: 1, progress: 95 },
];

const RADAR_SERIES = [
  { key: 'K-01', color: '#dc2626' },
  { key: 'K-02', color: '#3b82f6' },
  { key: 'K-03', color: '#f59e0b' },
  { key: 'K-04', color: '#22c55e' },
];

const RADAR_DATA = [
  { aspek: 'Logbook', 'K-01': 80, 'K-02': 55, 'K-03': 30, 'K-04': 95 },
  { aspek: 'Laporan', 'K-01': 75, 'K-02': 50, 'K-03': 35, 'K-04': 90 },
  { aspek: 'Absensi', 'K-01': 85, 'K-02': 65, 'K-03': 55, 'K-04': 95 },
  { aspek: 'Aktivitas', 'K-01': 80, 'K-02': 60, 'K-03': 40, 'K-04': 90 },
  { aspek: 'Program', 'K-01': 85, 'K-02': 55, 'K-03': 35, 'K-04': 95 },
];

const LOGBOOK_PER_MINGGU = [
  { minggu: 'W1', masuk: 8, tervalidasi: 7 },
  { minggu: 'W2', masuk: 10, tervalidasi: 9 },
  { minggu: 'W3', masuk: 7, tervalidasi: 5 },
  { minggu: 'W4', masuk: 9, tervalidasi: 6 },
];

const TUGAS_MENDATANG = [
  {
    id: 1,
    text: '5 logbook menunggu validasi',
    icon: BookOpen,
    wrapper: 'bg-amber-50',
    iconColor: 'text-amber-500',
    badge: '5',
    badgeColor: 'text-amber-600',
  },
  {
    id: 2,
    text: '2 laporan perlu review (K-02, K-03)',
    icon: FileText,
    wrapper: 'bg-red-50',
    iconColor: 'text-red-500',
    badge: '2',
    badgeColor: 'text-red-600',
  },
  {
    id: 3,
    text: 'Kelompok 03 progress rendah',
    icon: AlertTriangle,
    wrapper: 'bg-orange-50',
    iconColor: 'text-orange-500',
    badge: '!',
    badgeColor: 'text-red-600',
  },
  {
    id: 4,
    text: 'Monitoring lapangan minggu ini',
    icon: Clock,
    wrapper: 'bg-blue-50',
    iconColor: 'text-blue-500',
    badge: null,
    badgeColor: '',
  },
];

const AKSES_CEPAT = [
  { label: 'Validasi Logbook', icon: BookOpen },
  { label: 'Review Laporan', icon: FileText },
  { label: 'Input Penilaian', icon: TrendingUp },
];
// =====================================================================

const STATUS_BADGE: Record<StatusKelompok, string> = {
  Aktif: 'bg-green-50 text-green-700',
  'Perlu Monitoring': 'bg-amber-100 text-amber-700',
  Selesai: 'bg-blue-50 text-blue-700',
};

const getProgressColor = (progress: number) => {
  if (progress >= 75) return 'bg-green-500';
  if (progress >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

export default function DashboardDPL() {
  const totalKelompok = KELOMPOK_BIMBINGAN.length;
  const totalMahasiswa = KELOMPOK_BIMBINGAN.reduce((sum, k) => sum + k.anggota, 0);
  const totalLogbook = KELOMPOK_BIMBINGAN.reduce((sum, k) => sum + k.logbook, 0);
  const totalLaporan = KELOMPOK_BIMBINGAN.reduce((sum, k) => sum + k.laporan, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard DPL — Supervision Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitoring &amp; bimbingan kelompok KKM yang Anda pimpin.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Kelompok Bimbingan"
          value={totalKelompok}
          desc="Kelompok aktif"
          icon={UsersRound}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <StatCard
          label="Jumlah Mahasiswa"
          value={totalMahasiswa}
          desc="Mahasiswa dibimbing"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Logbook Menunggu"
          value={totalLogbook}
          desc="Perlu validasi"
          icon={BookOpen}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
        <StatCard
          label="Laporan Pending"
          value={totalLaporan}
          desc="Perlu review"
          icon={FileText}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
      </div>

      {/* CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Perbandingan Kelompok (radar) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900">Perbandingan Kelompok</h2>
          <p className="text-xs text-gray-400 mb-2">
            Evaluasi multidimensi semua kelompok bimbingan
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={RADAR_DATA} outerRadius="75%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="aspek" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                axisLine={false}
              />
              {RADAR_SERIES.map((series) => (
                <Radar
                  key={series.key}
                  name={series.key}
                  dataKey={series.key}
                  stroke={series.color}
                  fill={series.color}
                  fillOpacity={0.08}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-5 mt-1">
            {RADAR_SERIES.map((series) => (
              <span key={series.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                {series.key}
              </span>
            ))}
          </div>
        </div>

        {/* Logbook per Minggu (bar) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900">Logbook per Minggu</h2>
          <p className="text-xs text-gray-400 mb-4">
            Perbandingan logbook masuk vs tervalidasi
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={LOGBOOK_PER_MINGGU} barGap={6}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis
                dataKey="minggu"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 12]}
                ticks={[0, 3, 6, 9, 12]}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="masuk" name="Masuk" fill="#94a3b8" radius={[3, 3, 0, 0]} maxBarSize={24} />
              <Bar dataKey="tervalidasi" name="Tervalidasi" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KELOMPOK + TUGAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kelompok Bimbingan Saya */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 mb-4">Kelompok Bimbingan Saya</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {KELOMPOK_BIMBINGAN.map((kelompok) => (
              <KelompokCard key={kelompok.id} kelompok={kelompok} />
            ))}
          </div>
        </div>

        {/* Tugas Mendatang + Akses Cepat */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Tugas Mendatang</h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 mb-5">
            {TUGAS_MENDATANG.map((tugas) => {
              const Icon = tugas.icon;
              return (
                <div
                  key={tugas.id}
                  className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${tugas.wrapper}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={`${tugas.iconColor} shrink-0`} />
                    <p className="text-sm text-gray-700">{tugas.text}</p>
                  </div>

                  {tugas.badge ? (
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full bg-white text-xs font-bold shrink-0 ${tugas.badgeColor}`}
                    >
                      {tugas.badge}
                    </span>
                  ) : (
                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-gray-400 shrink-0">
                      <CalendarDays size={14} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 tracking-wide mb-3">AKSES CEPAT</p>

            <div className="space-y-2">
              {AKSES_CEPAT.map((item) => {
                const Icon = item.icon;
                return (
                  // TODO: sambungkan ke halaman terkait begitu route-nya tersedia
                  <button
                    key={item.label}
                    type="button"
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 shrink-0">
                        <Icon size={15} />
                      </span>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  desc,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  desc: string;
  icon: typeof Users;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
      <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${iconBg} ${iconColor} shrink-0`}>
        <Icon size={18} />
      </div>
    </div>
  );
}

function KelompokCard({ kelompok }: { kelompok: KelompokBimbingan }) {
  const perluPerhatian = kelompok.status === 'Perlu Monitoring';

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 ${
        perluPerhatian ? 'border-orange-200' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">{kelompok.nama}</h3>
          <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <MapPin size={12} />
            {kelompok.lokasi}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[kelompok.status]}`}
        >
          {kelompok.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
        <span className="flex items-center gap-1.5">
          <Users size={12} />
          {kelompok.anggota}
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen size={12} />
          {kelompok.logbook} logbook
        </span>
        <span className="flex items-center gap-1.5">
          <FileText size={12} />
          {kelompok.laporan} laporan
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-400">Progress</span>
          <span className="font-bold text-gray-800">{kelompok.progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getProgressColor(kelompok.progress)}`}
            style={{ width: `${kelompok.progress}%` }}
          />
        </div>
      </div>

      {perluPerhatian && (
        <div className="flex items-center gap-2 bg-orange-50 text-orange-600 text-xs rounded-lg px-3 py-2 mt-3">
          <AlertTriangle size={13} className="shrink-0" />
          Perlu perhatian segera
        </div>
      )}

      {/* TODO: sambungkan ke halaman detail kelompok begitu route-nya tersedia */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2.5 rounded-xl mt-4 transition-colors cursor-pointer"
      >
        Lihat Detail
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
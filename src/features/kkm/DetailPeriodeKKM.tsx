import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Users,
  UsersRound,
  MapPin,
  GraduationCap,
  AlertCircle,
  FileText,
  Check,
  ChevronRight,
  Shuffle,
} from 'lucide-react';
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
} from 'recharts';

// =====================================================================
// DATA STATIS — halaman ini belum terhubung ke API (mengikuti pola
// PeriodeKKM.tsx & PesertaKKM.tsx yang juga masih mock data lokal).
// Ganti dengan data dari endpoint detail periode KKM begitu tersedia.
// =====================================================================
const PERIODE_DETAIL = {
  nama: 'KKM Reguler 2026',
  status: 'Aktif',
  totalPeserta: 1248,
  jumlahKelompok: 98,
  jumlahDesa: 32,
  jumlahDpl: 47,
  belumDitempatkan: 35,
  laporanMasukPersen: 76,

  jenisKkm: 'Reguler',
  tahunAkademik: '2025/2026',
  bukaPendaftaran: '2026-01-01',
  tutupPendaftaran: '2026-01-20',
  pembekalan: '2026-01-25',
  pelaksanaan: '2026-02-01',
  penarikan: '2026-02-28',
  deadlineLaporan: '2026-03-15',
  deskripsi: 'KKM Reguler semester genap 2025/2026 untuk seluruh mahasiswa UMC yang telah memenuhi syarat.',
};

const TAHAPAN_KKM = [
  { key: 'pendaftaran', label: 'Pendaftaran Peserta', status: 'done' },
  { key: 'verifikasi', label: 'Verifikasi Berkas', status: 'done' },
  { key: 'pembagian', label: 'Pembagian Kelompok', status: 'active' },
  { key: 'pembekalan', label: 'Pembekalan', status: 'pending' },
  { key: 'pelaksanaan', label: 'Pelaksanaan KKM', status: 'pending' },
  { key: 'penarikan', label: 'Penarikan', status: 'pending' },
  { key: 'laporan', label: 'Laporan Akhir', status: 'pending' },
];

const MAHASISWA_PER_FAKULTAS = [
  { name: 'FT', value: 380 },
  { name: 'FEB', value: 230 },
  { name: 'FKIP', value: 210 },
  { name: 'FF', value: 180 },
  { name: 'FH', value: 150 },
  { name: 'FK', value: 130 },
];

const PEREMPUAN = 700;
const LAKI_LAKI = PERIODE_DETAIL.totalPeserta - PEREMPUAN;
const DISTRIBUSI_GENDER = [
  { name: 'Laki-laki', value: LAKI_LAKI, fill: '#3b82f6' },
  { name: 'Perempuan', value: PEREMPUAN, fill: '#ef4444' },
];

const AKSES_CEPAT = [
  { label: 'Kelola Peserta', icon: Users, path: '/kkm/peserta' },
  { label: 'Kelola Kelompok', icon: UsersRound, path: '/kkm/kelompok' },
  { label: 'Kelola Lokasi Desa', icon: MapPin, path: '/kkm/lokasi-desa' },
  { label: 'Kelola DPL', icon: GraduationCap, path: '/kkm/dpl' },
  { label: 'Generate Kelompok', icon: Shuffle, path: '/kkm/generate-kelompok' },
];

const TIMELINE_AKTIVITAS = [
  {
    id: 1,
    tanggal: '12 Januari 2026',
    text: '120 mahasiswa berhasil diverifikasi oleh Staff LPPM',
  },
  {
    id: 2,
    tanggal: '15 Januari 2026',
    text: 'Generate kelompok dilakukan — 98 kelompok terbentuk',
  },
  {
    id: 3,
    tanggal: '20 Januari 2026',
    text: 'Pembekalan dimulai di Aula Kampus 1 UMC',
  },
  {
    id: 4,
    tanggal: '25 Januari 2026',
    text: 'Penugasan 47 DPL selesai dikonfirmasi',
  },
  {
    id: 5,
    tanggal: '01 Februari 2026',
    text: 'Pelaksanaan KKM resmi dimulai di 32 desa',
  },
];
// =====================================================================

export default function DetailPeriodeKkm() {
  const navigate = useNavigate();

  const tahapanAktif = TAHAPAN_KKM.find((t) => t.status === 'active');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 mt-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900">{PERIODE_DETAIL.nama}</h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {PERIODE_DETAIL.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Monitoring keseluruhan pelaksanaan periode KKM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* TODO: sambungkan ke halaman edit periode / API update begitu tersedia */}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Pencil size={15} />
            Edit Periode
          </button>
          {/* TODO: sambungkan ke aksi tutup periode / API update status begitu tersedia */}
          <button className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
            Tutup Periode
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard
          label="Total Peserta"
          value={PERIODE_DETAIL.totalPeserta.toLocaleString('id-ID')}
          desc="Mahasiswa"
          icon={Users}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <StatCard
          label="Jumlah Kelompok"
          value={PERIODE_DETAIL.jumlahKelompok}
          desc="Kelompok"
          icon={UsersRound}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Jumlah Desa"
          value={PERIODE_DETAIL.jumlahDesa}
          desc="Desa"
          icon={MapPin}
          iconBg="bg-green-50"
          iconColor="text-green-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Jumlah DPL"
          value={PERIODE_DETAIL.jumlahDpl}
          desc="Dosen"
          icon={GraduationCap}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
        <StatCard
          label="Belum Ditempatkan"
          value={PERIODE_DETAIL.belumDitempatkan}
          desc="Mahasiswa"
          icon={AlertCircle}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
        <StatCard
          label="Laporan Masuk"
          value={`${PERIODE_DETAIL.laporanMasukPersen}%`}
          desc="dari total laporan"
          icon={FileText}
          iconBg="bg-teal-50"
          iconColor="text-teal-500"
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* INFORMASI PERIODE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Informasi Periode</h2>

            <div className="divide-y divide-gray-100">
              <InfoRow label="Jenis KKM" value={PERIODE_DETAIL.jenisKkm} />
              <InfoRow label="Tahun Akademik" value={PERIODE_DETAIL.tahunAkademik} />
              <InfoRow label="Buka Pendaftaran" value={PERIODE_DETAIL.bukaPendaftaran} />
              <InfoRow label="Tutup Pendaftaran" value={PERIODE_DETAIL.tutupPendaftaran} />
              <InfoRow label="Pembekalan" value={PERIODE_DETAIL.pembekalan} />
              <InfoRow label="Pelaksanaan" value={PERIODE_DETAIL.pelaksanaan} />
              <InfoRow label="Penarikan" value={PERIODE_DETAIL.penarikan} />
              <InfoRow label="Deadline Laporan" value={PERIODE_DETAIL.deadlineLaporan} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1.5">Deskripsi</p>
              <p className="text-sm text-gray-700 leading-relaxed">{PERIODE_DETAIL.deskripsi}</p>
            </div>
          </div>

          {/* AKSES CEPAT */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Akses Cepat</h2>

            <div className="space-y-2">
              {AKSES_CEPAT.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
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

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* PROGRESS PELAKSANAAN KKM */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <h2 className="text-sm font-bold text-gray-900">Progress Pelaksanaan KKM</h2>
              {tahapanAktif && (
                <p className="text-xs text-gray-500">
                  Tahapan Saat Ini: <span className="font-bold text-red-600">{tahapanAktif.label}</span>
                </p>
              )}
            </div>

            <div className="flex items-start">
              {TAHAPAN_KKM.map((tahap, index) => (
                <div key={tahap.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center text-center w-24">
                    {tahap.status === 'done' && (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                    {tahap.status === 'active' && (
                      <div className="w-8 h-8 rounded-full bg-white border-[3px] border-red-600 flex items-center justify-center shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                      </div>
                    )}
                    {tahap.status === 'pending' && (
                      <div className="w-7 h-7 rounded-full bg-white border-2 border-gray-200 shrink-0" />
                    )}

                    <p
                      className={`text-xs font-semibold mt-2 leading-tight ${
                        tahap.status === 'active'
                          ? 'text-red-600'
                          : tahap.status === 'done'
                            ? 'text-gray-700'
                            : 'text-gray-400'
                      }`}
                    >
                      {tahap.label}
                    </p>
                  </div>

                  {index < TAHAPAN_KKM.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 -mt-6 ${
                        tahap.status === 'done' ? 'bg-green-400' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Progress berdasarkan tahapan administrasi KKM.
            </p>
          </div>

          {/* CHART ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Mahasiswa per Fakultas</h2>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MAHASISWA_PER_FAKULTAS}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
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
                  <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Distribusi Gender</h2>

              <div className="relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={DISTRIBUSI_GENDER}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {DISTRIBUSI_GENDER.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute bg-white border border-gray-100 shadow-sm rounded-lg px-3 py-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">
                    Perempuan : {PEREMPUAN}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Laki-laki
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Perempuan
                </span>
              </div>
            </div>
          </div>

          {/* TIMELINE AKTIVITAS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-5">Timeline Aktivitas</h2>

            <div className="space-y-5">
              {TIMELINE_AKTIVITAS.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{item.tanggal}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
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
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
      <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${iconBg} ${iconColor} shrink-0`}>
        <Icon size={17} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
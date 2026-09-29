import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  BookOpen,
} from 'lucide-react';

// ==================== TYPES ====================

type IndikatorType = 'normal' | 'dpl-belum' | 'tidak-aktif' | 'logbook-kurang';
type StatusType = 'aktif' | 'perhatian' | 'bermasalah' | 'selesai';
type SegmentColor = 'green' | 'yellow' | 'red' | 'gray';

interface Kelompok {
  id: number;
  nama: string;
  anggota: number;
  desa: string;
  dpl: string;
  updatedAt: string;
  logbook: number;
  logbookDelta?: number;
  tahapan: string;
  progress: number;
  segments: SegmentColor[];
  indikator: IndikatorType;
  status: StatusType;
}

// ==================== DATA ====================

const data: Kelompok[] = [
  {
    id: 1,
    nama: 'Kelompok 01',
    anggota: 10,
    desa: 'Astanajapura',
    dpl: 'Dr. Ahmad Fauzi',
    updatedAt: '3 hari lalu',
    logbook: 15,
    tahapan: 'Monitoring DPL',
    progress: 80,
    segments: ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'red'],
    indikator: 'normal',
    status: 'aktif',
  },
  {
    id: 2,
    nama: 'Kelompok 02',
    anggota: 10,
    desa: 'Palimanan',
    dpl: 'Dr. Siti Aminah',
    updatedAt: '12 hari lalu',
    logbook: 8,
    logbookDelta: -2,
    tahapan: 'Program Kerja',
    progress: 40,
    segments: ['yellow', 'green', 'green', 'red', 'gray', 'gray', 'gray', 'gray'],
    indikator: 'dpl-belum',
    status: 'perhatian',
  },
  {
    id: 3,
    nama: 'Kelompok 03',
    anggota: 9,
    desa: 'Gempol',
    dpl: 'Dr. Budi Hartono',
    updatedAt: '20 hari lalu',
    logbook: 2,
    logbookDelta: -3,
    tahapan: 'Logbook Aktif',
    progress: 20,
    segments: ['yellow', 'gray', 'red', 'gray', 'gray', 'gray', 'gray', 'gray'],
    indikator: 'tidak-aktif',
    status: 'bermasalah',
  },
  {
    id: 4,
    nama: 'Kelompok 04',
    anggota: 10,
    desa: 'Ciwaringin',
    dpl: 'Dr. Rina Susanti',
    updatedAt: '1 hari lalu',
    logbook: 20,
    tahapan: 'Laporan Akhir',
    progress: 100,
    segments: ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'],
    indikator: 'normal',
    status: 'aktif',
  },
  {
    id: 5,
    nama: 'Kelompok 05',
    anggota: 8,
    desa: 'Plumbon',
    dpl: 'Dr. Yusuf Hidayat',
    updatedAt: '7 hari lalu',
    logbook: 5,
    logbookDelta: -1,
    tahapan: 'Program Kerja',
    progress: 40,
    segments: ['yellow', 'green', 'green', 'red', 'gray', 'gray', 'gray', 'gray'],
    indikator: 'logbook-kurang',
    status: 'perhatian',
  },
  {
    id: 6,
    nama: 'Kelompok 06',
    anggota: 10,
    desa: 'Sumber',
    dpl: 'Dr. Maya Putri',
    updatedAt: '15 hari lalu',
    logbook: 18,
    tahapan: 'Selesai',
    progress: 100,
    segments: ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'],
    indikator: 'normal',
    status: 'selesai',
  },
];

// ==================== CONFIG ====================

const indikatorConfig: Record<
  IndikatorType,
  { label: string; bg: string; text: string; Icon: typeof CheckCircle2 }
> = {
  normal: { label: 'Normal', bg: 'bg-green-50', text: 'text-green-600', Icon: CheckCircle2 },
  'dpl-belum': { label: 'DPL Blm. Monitoring', bg: 'bg-orange-50', text: 'text-orange-600', Icon: AlertTriangle },
  'tidak-aktif': { label: 'Tidak Ada Aktivitas', bg: 'bg-red-50', text: 'text-red-600', Icon: XCircle },
  'logbook-kurang': { label: 'Logbook Kurang', bg: 'bg-yellow-50', text: 'text-yellow-700', Icon: AlertTriangle },
};

const statusConfig: Record<StatusType, { label: string; bg: string; text: string; dot: string }> = {
  aktif: { label: 'Aktif', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  perhatian: { label: 'Perlu Perhatian', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  bermasalah: { label: 'Bermasalah', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  selesai: { label: 'Selesai', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

const segmentColorMap: Record<SegmentColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
  gray: 'bg-gray-200',
};

const progressBarColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-400';
  return 'bg-red-500';
};

// ==================== SUB COMPONENTS ====================

function StatCard({
  label,
  value,
  Icon,
  bg,
  border,
  iconColor,
  valueColor,
}: {
  label: string;
  value: string | number;
  Icon: typeof CheckCircle2;
  bg: string;
  border: string;
  iconColor: string;
  valueColor: string;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <Icon size={14} className={iconColor} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

function IndikatorBadge({ type }: { type: IndikatorType }) {
  const c = indikatorConfig[type];
  const Icon = c.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon size={13} />
      {c.label}
    </span>
  );
}

function StatusBadge({ type }: { type: StatusType }) {
  const c = statusConfig[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function ProgressCell({ progress, segments }: { progress: number; segments: SegmentColor[] }) {
  return (
    <div className="min-w-[130px]">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progressBarColor(progress)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700 w-9 text-right">{progress}%</span>
      </div>
      <div className="flex items-center gap-1 mt-1.5">
        {segments.map((seg, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${segmentColorMap[seg]}`} />
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function MonitoringKKM() {
  const [activeTab, setActiveTab] = useState<'semua' | StatusType>('semua');

  const counts = {
    semua: data.length,
    aktif: data.filter((d) => d.status === 'aktif').length,
    perhatian: data.filter((d) => d.status === 'perhatian').length,
    bermasalah: data.filter((d) => d.status === 'bermasalah').length,
    selesai: data.filter((d) => d.status === 'selesai').length,
  };

  const rataRataProgress = Math.round(data.reduce((sum, d) => sum + d.progress, 0) / data.length);

  const filteredData = activeTab === 'semua' ? data : data.filter((d) => d.status === activeTab);

  const tabs: { key: 'semua' | StatusType; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'aktif', label: 'Aktif' },
    { key: 'perhatian', label: 'Perlu Perhatian' },
    { key: 'bermasalah', label: 'Bermasalah' },
    { key: 'selesai', label: 'Selesai' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Monitoring KKM</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pantau perkembangan dan progres setiap kelompok KKM secara real-time
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Kelompok Aktif"
          value={counts.aktif}
          Icon={CheckCircle2}
          bg="bg-green-50"
          border="border-green-100"
          iconColor="text-green-600"
          valueColor="text-green-600"
        />
        <StatCard
          label="Perlu Perhatian"
          value={counts.perhatian}
          Icon={AlertTriangle}
          bg="bg-yellow-50"
          border="border-yellow-100"
          iconColor="text-yellow-600"
          valueColor="text-orange-600"
        />
        <StatCard
          label="Bermasalah"
          value={counts.bermasalah}
          Icon={XCircle}
          bg="bg-red-50"
          border="border-red-100"
          iconColor="text-red-600"
          valueColor="text-red-600"
        />
        <StatCard
          label="Selesai"
          value={counts.selesai}
          Icon={CheckCircle2}
          bg="bg-blue-50"
          border="border-blue-100"
          iconColor="text-blue-600"
          valueColor="text-blue-600"
        />
        <StatCard
          label="Rata-rata Progress"
          value={`${rataRataProgress}%`}
          Icon={Activity}
          bg="bg-purple-50"
          border="border-purple-100"
          iconColor="text-purple-600"
          valueColor="text-purple-600"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelompok, desa, DPL, atau mahasiswa..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="relative">
            <select className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>KKM Regular 2026</option>
              <option>KKM Tematik 2026</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>Semua Desa</option>
              <option>Astanajapura</option>
              <option>Palimanan</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>Semua DPL</option>
              <option>Dr. Ahmad Fauzi</option>
              <option>Dr. Siti Aminah</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTab === tab.key
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Kelompok</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Desa</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">DPL</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Logbook</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Tahapan</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Progress</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Indikator</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">{row.nama}</p>
                    <p className="text-xs text-gray-400">{row.anggota} anggota</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{row.desa}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700">{row.dpl}</p>
                    <p className="text-xs text-gray-400">{row.updatedAt}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <BookOpen size={14} className="text-gray-400" />
                      {row.logbook}
                      {typeof row.logbookDelta === 'number' && (
                        <span className="text-red-500 text-xs font-medium">({row.logbookDelta})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{row.tahapan}</td>
                  <td className="px-4 py-4">
                    <ProgressCell progress={row.progress} segments={row.segments} />
                  </td>
                  <td className="px-4 py-4">
                    <IndikatorBadge type={row.indikator} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge type={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold text-gray-700">{filteredData.length}</span> dari{' '}
            <span className="font-semibold text-gray-700">{data.length}</span> kelompok
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              Sebelumnya
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-white bg-red-600 rounded-lg">
              1
            </button>
            <button className="px-3.5 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
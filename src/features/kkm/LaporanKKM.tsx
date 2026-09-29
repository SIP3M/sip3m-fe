import React, { useState } from 'react';
import {
  Download,
  ChevronDown,
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Search,
  Eye,
  Check,
} from 'lucide-react';

// ==================== TYPES ====================

type StatusKey = 'belum-upload' | 'menunggu-review' | 'disetujui' | 'revisi' | 'terlambat';

interface Laporan {
  id: number;
  kelompok: string;
  periode: string;
  desa: string;
  dpl: string;
  jenis: string;
  uploadDate: string | null;
  deadline: string;
  deadlineNote?: { text: string; type: 'warning' | 'danger' };
  status: StatusKey;
}

// ==================== DATA ====================

const data: Laporan[] = [
  {
    id: 1,
    kelompok: 'Kelompok 01',
    periode: 'KKM Reguler 2026',
    desa: 'Astanajapura',
    dpl: 'Dr. Ahmad Fauzi',
    jenis: 'Laporan Awal',
    uploadDate: '05 Feb 2026',
    deadline: '10 Feb 2026',
    status: 'disetujui',
  },
  {
    id: 2,
    kelompok: 'Kelompok 01',
    periode: 'KKM Reguler 2026',
    desa: 'Astanajapura',
    dpl: 'Dr. Ahmad Fauzi',
    jenis: 'Laporan Mingguan',
    uploadDate: '12 Feb 2026',
    deadline: '14 Feb 2026',
    deadlineNote: { text: 'Deadline 2 hari lagi', type: 'warning' },
    status: 'menunggu-review',
  },
  {
    id: 3,
    kelompok: 'Kelompok 02',
    periode: 'KKM Reguler 2026',
    desa: 'Palimanan',
    dpl: 'Dr. Siti Aminah',
    jenis: 'Laporan Awal',
    uploadDate: '06 Feb 2026',
    deadline: '10 Feb 2026',
    status: 'revisi',
  },
  {
    id: 4,
    kelompok: 'Kelompok 02',
    periode: 'KKM Reguler 2026',
    desa: 'Palimanan',
    dpl: 'Dr. Siti Aminah',
    jenis: 'Laporan Mingguan',
    uploadDate: null,
    deadline: '14 Feb 2026',
    deadlineNote: { text: 'Melewati Deadline', type: 'danger' },
    status: 'belum-upload',
  },
  {
    id: 5,
    kelompok: 'Kelompok 03',
    periode: 'KKM Reguler 2026',
    desa: 'Gempol',
    dpl: 'Dr. Budi Hartono',
    jenis: 'Laporan Awal',
    uploadDate: '04 Feb 2026',
    deadline: '10 Feb 2026',
    status: 'disetujui',
  },
  {
    id: 6,
    kelompok: 'Kelompok 03',
    periode: 'KKM Reguler 2026',
    desa: 'Gempol',
    dpl: 'Dr. Budi Hartono',
    jenis: 'Laporan Akhir',
    uploadDate: null,
    deadline: '28 Feb 2026',
    deadlineNote: { text: 'Melewati Deadline', type: 'danger' },
    status: 'terlambat',
  },
  {
    id: 7,
    kelompok: 'Kelompok 04',
    periode: 'KKM Reguler 2026',
    desa: 'Ciwaringin',
    dpl: 'Dr. Rina Susanti',
    jenis: 'Laporan Awal',
    uploadDate: '04 Feb 2026',
    deadline: '10 Feb 2026',
    status: 'disetujui',
  },
  {
    id: 8,
    kelompok: 'Kelompok 04',
    periode: 'KKM Reguler 2026',
    desa: 'Ciwaringin',
    dpl: 'Dr. Rina Susanti',
    jenis: 'Laporan Akhir',
    uploadDate: '28 Feb 2026',
    deadline: '28 Feb 2026',
    status: 'disetujui',
  },
];

// ==================== CONFIG ====================

const statusConfig: Record<StatusKey, { label: string; bg: string; text: string; Icon: typeof Clock }> = {
  'belum-upload': { label: 'Belum Upload', bg: 'bg-gray-100', text: 'text-gray-600', Icon: Clock },
  'menunggu-review': { label: 'Menunggu Review', bg: 'bg-yellow-50', text: 'text-yellow-700', Icon: Clock },
  disetujui: { label: 'Disetujui', bg: 'bg-green-50', text: 'text-green-700', Icon: CheckCircle2 },
  revisi: { label: 'Revisi', bg: 'bg-red-50', text: 'text-red-600', Icon: RotateCcw },
  terlambat: { label: 'Terlambat', bg: 'bg-orange-50', text: 'text-orange-600', Icon: AlertTriangle },
};

const donutSegments: { key: StatusKey; label: string; color: string }[] = [
  { key: 'disetujui', label: 'Disetujui', color: '#22c55e' },
  { key: 'menunggu-review', label: 'Menunggu Review', color: '#f59e0b' },
  { key: 'revisi', label: 'Revisi', color: '#ef4444' },
  { key: 'belum-upload', label: 'Belum Upload', color: '#9ca3af' },
  { key: 'terlambat', label: 'Terlambat', color: '#ea580c' },
];

const desaProgress = [
  { desa: 'Palimanan', value: 1.8 },
  { desa: 'Ciwaringin', value: 2 },
];

// ==================== SUB COMPONENTS ====================

function StatCard({
  label,
  value,
  Icon,
  iconColor,
}: {
  label: string;
  value: number;
  Icon: typeof Clock;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon size={16} className={iconColor} />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusKey }) {
  const c = statusConfig[status];
  const Icon = c.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon size={12} />
      {c.label}
    </span>
  );
}

function DonutChart({ data: counts }: { data: Record<StatusKey, number> }) {
  const total = donutSegments.reduce((sum, s) => sum + counts[s.key], 0);
  let cumulative = 0;
  const gradientParts = donutSegments.map((s) => {
    const start = (cumulative / total) * 100;
    cumulative += counts[s.key];
    const end = (cumulative / total) * 100;
    return `${s.color} ${start}% ${end}%`;
  });

  return (
    <div
      className="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}
    >
      <div className="w-16 h-16 bg-white rounded-full" />
    </div>
  );
}

function BarChart({ items }: { items: { desa: string; value: number }[] }) {
  const max = 2;
  const ticks = [0, 0.5, 1, 1.5, 2];

  return (
    <div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.desa} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-20 flex-shrink-0 text-right">{item.desa}</span>
            <div className="flex-1 h-5 bg-gray-50 rounded relative">
              <div
                className="h-full bg-red-600 rounded"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="w-20 flex-shrink-0" />
        <div className="flex-1 flex justify-between text-xs text-gray-400">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function LaporanKKM() {
  const [activeTab, setActiveTab] = useState<'semua' | StatusKey>('semua');
  const [selectedIds, setSelectedIds] = useState<number[]>([data[1].id, data[3].id]);

  const counts: Record<StatusKey, number> = {
    'belum-upload': data.filter((d) => d.status === 'belum-upload').length,
    'menunggu-review': data.filter((d) => d.status === 'menunggu-review').length,
    disetujui: data.filter((d) => d.status === 'disetujui').length,
    revisi: data.filter((d) => d.status === 'revisi').length,
    terlambat: data.filter((d) => d.status === 'terlambat').length,
  };

  const filteredData = activeTab === 'semua' ? data : data.filter((d) => d.status === activeTab);

  const tabs: { key: 'semua' | StatusKey; label: string; count: number }[] = [
    { key: 'semua', label: 'Semua', count: data.length },
    { key: 'belum-upload', label: 'Belum Upload', count: counts['belum-upload'] },
    { key: 'menunggu-review', label: 'Menunggu Review', count: counts['menunggu-review'] },
    { key: 'disetujui', label: 'Disetujui', count: counts.disetujui },
    { key: 'revisi', label: 'Revisi', count: counts.revisi },
    { key: 'terlambat', label: 'Terlambat', count: counts.terlambat },
  ];

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan KKM</h1>
          <p className="text-gray-500 text-sm mt-1">Validasi dan manajemen laporan kelompok KKM</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={16} />
          Export
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Belum Upload" value={counts['belum-upload']} Icon={Clock} iconColor="text-gray-400" />
        <StatCard label="Menunggu Review" value={counts['menunggu-review']} Icon={Clock} iconColor="text-yellow-500" />
        <StatCard label="Disetujui" value={counts.disetujui} Icon={CheckCircle2} iconColor="text-green-500" />
        <StatCard label="Revisi" value={counts.revisi} Icon={RotateCcw} iconColor="text-red-500" />
        <StatCard label="Terlambat Upload" value={counts.terlambat} Icon={AlertTriangle} iconColor="text-orange-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Distribusi Status Laporan</h3>
          <div className="flex items-center gap-8">
            <DonutChart data={counts} />
            <div className="space-y-2">
              {donutSegments.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600 w-32">{s.label}</span>
                  <span className="font-semibold text-gray-800">{counts[s.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Progress Upload per Desa</h3>
          <BarChart items={desaProgress} />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelompok, desa, DPL, atau jenis laporan..."
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
              <option>Semua Jenis</option>
              <option>Laporan Awal</option>
              <option>Laporan Mingguan</option>
              <option>Laporan Akhir</option>
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

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative w-full lg:w-52">
            <select className="w-full appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>Semua Desa</option>
              <option>Astanajapura</option>
              <option>Palimanan</option>
              <option>Gempol</option>
              <option>Ciwaringin</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
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
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-700">{selectedIds.length} laporan dipilih</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
              <Check size={13} />
              Setujui Massal
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
              <Download size={13} />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors">
              <Download size={13} />
              Download ZIP
            </button>
          </div>
          <button onClick={() => setSelectedIds([])} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Batal pilih
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-10 px-6 py-3" />
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-3">Kelompok</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Desa / DPL</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Jenis Laporan</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Upload Date</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Deadline</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-2 py-4">
                    <p className="text-sm font-semibold text-gray-800">{row.kelompok}</p>
                    <p className="text-xs text-gray-400">{row.periode}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700">{row.desa}</p>
                    <p className="text-xs text-gray-400">{row.dpl}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                      {row.jenis}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{row.uploadDate ?? '-'}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{row.deadline}</p>
                    {row.deadlineNote && (
                      <p
                        className={`flex items-center gap-1 text-xs mt-0.5 ${
                          row.deadlineNote.type === 'danger' ? 'text-red-500' : 'text-orange-500'
                        }`}
                      >
                        <AlertTriangle size={11} />
                        {row.deadlineNote.text}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye size={15} />
                      </button>
                      {row.status === 'menunggu-review' && (
                        <>
                          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Check size={15} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <RotateCcw size={15} />
                          </button>
                        </>
                      )}
                    </div>
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
            <span className="font-semibold text-gray-700">{data.length}</span> laporan
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
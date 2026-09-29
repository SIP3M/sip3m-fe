import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Bell,
  Pin,
  Trash2,
  Calendar,
  Users,
  Eye,
  ArrowRight,
  AlertCircle,
  Clock,
} from 'lucide-react';

// ==================== TYPES ====================

type Prioritas = 'penting' | 'sedang';
type KategoriKey = 'pembekalan' | 'lokasi' | 'deadline' | 'monitoring';

interface Pengumuman {
  id: number;
  judul: string;
  prioritas: Prioritas;
  kategori: KategoriKey;
  deskripsi: string;
  tanggal: string;
  audiens: string;
  dibaca: number;
  totalPenerima: number;
  dipinned: boolean;
}

// ==================== CONFIG ====================

const kategoriConfig: Record<KategoriKey, { label: string; bg: string; text: string }> = {
  pembekalan: { label: 'Pembekalan', bg: 'bg-purple-50', text: 'text-purple-600' },
  lokasi: { label: 'Lokasi KKM', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  deadline: { label: 'Deadline', bg: 'bg-rose-50', text: 'text-rose-600' },
  monitoring: { label: 'Monitoring', bg: 'bg-blue-50', text: 'text-blue-600' },
};

const prioritasConfig: Record<Prioritas, { label: string; bg: string; text: string; Icon: typeof AlertCircle }> = {
  penting: { label: 'Penting', bg: 'bg-red-50', text: 'text-red-600', Icon: AlertCircle },
  sedang: { label: 'Sedang', bg: 'bg-yellow-50', text: 'text-yellow-700', Icon: Clock },
};

// ==================== DATA ====================

const initialData: Pengumuman[] = [
  {
    id: 1,
    judul: 'Pembekalan KKM Reguler 2026',
    prioritas: 'penting',
    kategori: 'pembekalan',
    deskripsi: 'Seluruh peserta diwajibkan mengikuti pembekalan KKM yang akan dilaksanakan di Aula Kampus...',
    tanggal: '20 Jan 2026',
    audiens: 'Semua Peserta KKM',
    dibaca: 1195,
    totalPenerima: 1295,
    dipinned: true,
  },
  {
    id: 2,
    judul: 'Informasi Lokasi Desa KKM Reguler 2026',
    prioritas: 'penting',
    kategori: 'lokasi',
    deskripsi: 'Berikut adalah informasi lengkap mengenai lokasi desa penempatan KKM Reguler 2026...',
    tanggal: '25 Jan 2026',
    audiens: 'Semua Peserta KKM, Semua DPL',
    dibaca: 1020,
    totalPenerima: 1295,
    dipinned: false,
  },
  {
    id: 3,
    judul: 'Deadline Laporan Awal KKM',
    prioritas: 'penting',
    kategori: 'deadline',
    deskripsi: 'Laporan awal KKM wajib dikumpulkan paling lambat tanggal 10 Februari 2026 pukul 23:59 WIB...',
    tanggal: '01 Feb 2026',
    audiens: 'Semua Peserta KKM',
    dibaca: 1147,
    totalPenerima: 1295,
    dipinned: false,
  },
  {
    id: 4,
    judul: 'Jadwal Monitoring DPL Minggu 1',
    prioritas: 'sedang',
    kategori: 'monitoring',
    deskripsi: 'Jadwal monitoring lapangan oleh DPL untuk minggu pertama pelaksanaan KKM...',
    tanggal: '08 Feb 2026',
    audiens: 'Semua DPL',
    dibaca: 38,
    totalPenerima: 47,
    dipinned: false,
  },
  {
    id: 5,
    judul: 'Perpanjangan Deadline Laporan Akhir',
    prioritas: 'sedang',
    kategori: 'deadline',
    deskripsi: 'LPPM memberikan perpanjangan waktu pengumpulan laporan akhir KKM hingga 5 Maret 2026...',
    tanggal: '20 Feb 2026',
    audiens: 'Semua Peserta KKM, Semua DPL',
    dibaca: 802,
    totalPenerima: 1295,
    dipinned: false,
  },
];

// ==================== SUB COMPONENTS ====================

function StatPill({
  label,
  value,
  bg,
  text,
}: {
  label: string;
  value: number;
  bg?: string;
  text?: string;
}) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${bg ?? 'bg-white'} ${bg ? 'border-transparent' : 'border-gray-200'}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${text ?? 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

function PriorityBadge({ prioritas }: { prioritas: Prioritas }) {
  const c = prioritasConfig[prioritas];
  const Icon = c.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon size={12} />
      {c.label}
    </span>
  );
}

function KategoriBadge({ kategori }: { kategori: KategoriKey }) {
  const c = kategoriConfig[kategori];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ==================== MAIN COMPONENT ====================

export default function PengumumanKKM() {
  const [data, setData] = useState<Pengumuman[]>(initialData);

  const togglePin = (id: number) => {
    setData((prev) => prev.map((item) => (item.id === id ? { ...item, dipinned: !item.dipinned } : item)));
  };

  const removeItem = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPengumuman = data.length;
  const totalPenting = data.filter((d) => d.prioritas === 'penting').length;
  const totalSedang = data.filter((d) => d.prioritas === 'sedang').length;
  const totalDipinned = data.filter((d) => d.dipinned).length;

  const sortedData = [...data].sort((a, b) => Number(b.dipinned) - Number(a.dipinned));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengumuman KKM</h1>
          <p className="text-gray-500 text-sm mt-1">
            Communication hub — kelola dan broadcast pengumuman kepada seluruh civitas KKM
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus size={16} />
          Buat Pengumuman
        </button>
      </div>

      {/* Stat Pills */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <StatPill label="Total Pengumuman" value={totalPengumuman} />
        <StatPill label="Penting" value={totalPenting} bg="bg-red-50" text="text-red-600" />
        <StatPill label="Sedang" value={totalSedang} bg="bg-yellow-50" text="text-yellow-700" />
        <StatPill label="Dipinned" value={totalDipinned} bg="bg-blue-50" text="text-blue-600" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="relative">
            <select className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>Semua Kategori</option>
              <option>Pembekalan</option>
              <option>Lokasi KKM</option>
              <option>Deadline</option>
              <option>Monitoring</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>Semua Prioritas</option>
              <option>Penting</option>
              <option>Sedang</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>Semua Audiens</option>
              <option>Semua Peserta KKM</option>
              <option>Semua DPL</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <span className="text-sm text-gray-400 whitespace-nowrap lg:ml-2">{data.length} pengumuman</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {sortedData.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl shadow-sm border p-5 relative ${
              item.dipinned ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            {item.dipinned && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mb-3">
                <Pin size={12} />
                DISEMATKAN
              </div>
            )}

            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Bell size={18} className="text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-base font-bold text-gray-800">{item.judul}</h3>
                    <PriorityBadge prioritas={item.prioritas} />
                    <KategoriBadge kategori={item.kategori} />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{item.deskripsi}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {item.tanggal}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={13} />
                      {item.audiens}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} />
                      {item.dibaca}/{item.totalPenerima} dibaca
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                <button
                  onClick={() => togglePin(item.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    item.dipinned
                      ? 'bg-red-50 text-red-500'
                      : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Pin size={16} />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-3">
              <button className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                Baca Selengkapnya
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
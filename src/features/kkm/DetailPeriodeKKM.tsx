import React from 'react';
import {
  ArrowLeft,
  Users,
  UserCheck,
  MapPin,
  UserPlus,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Download,
  Printer,
  Edit,
  PieChart,
  BarChart3,
} from 'lucide-react';

// Type definitions
interface Periode {
  id: number;
  tahun: string;
  nama: string;
  target: string;
  jenis: string;
  pelaksanaan: string;
  penarikan: string;
  status: 'Aktif' | 'Draft' | 'Selesai';
}

interface DetailPeriodeKKMProps {
  periode: Periode;
  onBack: () => void;
}

interface StatItem {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
}

interface FakultasData {
  name: string;
  count: number;
}

interface ProgressItem {
  label: string;
  value: number;
  color: string;
}

interface TimelineItem {
  date: string;
  event: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
}

export default function DetailPeriodeKKM({ periode, onBack }: DetailPeriodeKKMProps): React.ReactElement {
  // Data statistik untuk detail
  const stats: StatItem[] = [
    {
      title: 'Total Peserta',
      value: '1.248',
      subtitle: 'Mahasiswa',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Jumlah Kelompok',
      value: '98',
      subtitle: 'Kelompok',
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Jumlah Desa',
      value: '32',
      subtitle: 'Desa',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Jumlah DPL',
      value: '47',
      subtitle: 'Dosen',
      icon: UserPlus,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Belum Ditempatkan',
      value: '35',
      subtitle: 'Mahasiswa',
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Laporan Masuk',
      value: '76%',
      subtitle: 'dari total laporan',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
  ];

  // Data fakultas untuk chart
  const fakultasData: FakultasData[] = [
    { name: 'FT', count: 380 },
    { name: 'FEB', count: 320 },
    { name: 'FKIP', count: 250 },
    { name: 'FF', count: 180 },
    { name: 'FH', count: 120 },
    { name: 'FK', count: 80 },
  ];

  const maxFakultas: number = Math.max(...fakultasData.map((f: FakultasData) => f.count));

  // Data timeline
  const timelineData: TimelineItem[] = [
    {
      date: '12 Januari 2026',
      event: '120 mahasiswa berhasil diverifikasi oleh Staff LPPM',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      date: '15 Januari 2026',
      event: 'Generate kelompok dilakukan — 98 kelompok terbentuk',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      date: '20 Januari 2026',
      event: 'Pembekalan dimulai di Aula Kampus 1 UMC',
      icon: Calendar,
      color: 'text-purple-500',
    },
    {
      date: '25 Januari 2026',
      event: 'Penguasaan 47 DPL selesai dikonfirmasi',
      icon: UserCheck,
      color: 'text-orange-500',
    },
    {
      date: '01 Februari 2026',
      event: 'Pelaksanaan KKM resmi dimulai di 32 desa',
      icon: MapPin,
      color: 'text-red-500',
    },
  ];

  // Progress data
  const progressData: ProgressItem[] = [
    { label: 'Pendaftaran Peserta', value: 100, color: 'bg-green-500' },
    { label: 'Verifikasi Berkas', value: 85, color: 'bg-blue-500' },
    { label: 'Pembagian Kelompok', value: 70, color: 'bg-purple-500' },
    { label: 'Pembekalan', value: 60, color: 'bg-yellow-500' },
    { label: 'Pelaksanaan KKM', value: 45, color: 'bg-red-500' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            KKM {periode.jenis} {periode.tahun}
          </h1>
          <p className="text-gray-500 text-sm">
            Monitoring keseluruhan pelaksanaan periode KKM.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
            <Printer size={16} />
            Cetak
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Edit size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* Stats Grid - 2 rows x 3 columns */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.slice(0, 3).map((stat: StatItem, index: number) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400">{stat.subtitle}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-2.5 rounded-lg shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.slice(3, 6).map((stat: StatItem, index: number) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400">{stat.subtitle}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-2.5 rounded-lg shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Columns: Informasi Periode & Progress */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Informasi Periode */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 col-span-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            Informasi Periode
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Jenis KKM</span>
              <span className="font-medium text-gray-800">{periode.jenis}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tahun Akademik</span>
              <span className="font-medium text-gray-800">2025/2026</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Buka Pendaftaran</span>
              <span className="font-medium text-gray-800">2026-01-01</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tutup Pendaftaran</span>
              <span className="font-medium text-gray-800">2026-01-20</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pembekalan</span>
              <span className="font-medium text-gray-800">2026-01-25</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Penarikan</span>
              <span className="font-medium text-gray-800">2026-02-01</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Deadline Laporan</span>
              <span className="font-medium text-gray-800">2026-03-15</span>
            </div>
          </div>
        </div>

        {/* Progress Pelaksanaan */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 col-span-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-gray-400" />
            Progress Pelaksanaan KKM
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {progressData.map((item: ProgressItem, index: number) => (
              <div key={index}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-700`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mahasiswa per Fakultas & Distribusi Gender */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Mahasiswa per Fakultas */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-gray-400" />
            Mahasiswa per Fakultas
          </h3>
          <div className="space-y-2.5">
            {fakultasData.map((fakultas: FakultasData, index: number) => {
              const percentage = (fakultas.count / maxFakultas) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                    <span>{fakultas.name}</span>
                    <span>{fakultas.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] text-gray-400 text-right">
            0 | 100 | 200 | 300 | 400
          </div>
        </div>

        {/* Distribusi Gender & Akses Cepat */}
        <div className="space-y-6">
          {/* Distribusi Gender */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              Distribusi Gender
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Laki-laki</span>
                  <span className="text-sm font-bold text-gray-800 ml-auto">548</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-500 h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: '44%' }}
                  >
                    <span className="text-xs text-white font-medium">44%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-sm text-gray-600">Perempuan</span>
                  <span className="text-sm font-bold text-gray-800 ml-auto">700</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-pink-500 h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: '56%' }}
                  >
                    <span className="text-xs text-white font-medium">56%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Akses Cepat */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Akses Cepat</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Kelola Peserta', 'Kelola Kelompok', 'Kelola Lokasi Desa', 'Kelola DPL', 'Generate Kelompok'].map((item: string, index: number) => (
                <button
                  key={index}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors text-center"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Aktivitas */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          Timeline Aktivitas
        </h3>
        <div className="space-y-4">
          {timelineData.map((item: TimelineItem, index: number) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon size={16} className={item.color} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.date}</p>
                  <p className="text-sm text-gray-600">{item.event}</p>
                </div>
                {index < timelineData.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
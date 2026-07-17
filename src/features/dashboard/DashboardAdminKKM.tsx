import React from 'react';
import {
  Users,
  UserCheck,
  MapPin,
  UserPlus,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function DashboardAdminKKM() {
  // Data statistik
  const stats = [
    {
      title: 'Total Peserta KKM',
      value: '1.248',
      subtitle: 'Mahasiswa',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Kelompok',
      value: '98',
      subtitle: 'Kelompok',
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Total Desa Penempatan',
      value: '32',
      subtitle: 'Desa',
      icon: MapPin,
      color: 'bg-purple-500',
    },
    {
      title: 'Total DPL',
      value: '47',
      subtitle: 'Dosen',
      icon: UserPlus,
      color: 'bg-orange-500',
    },
    {
      title: 'Belum Mendapat Kelompok',
      value: '45',
      subtitle: 'Mahasiswa',
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      title: 'Menunggu Verifikasi',
      value: '120',
      subtitle: 'Peserta',
      icon: Clock,
      color: 'bg-yellow-500',
    },
  ];

  // Data program studi dengan nilai contoh
  const prodiData = [
    { name: 'T1', count: 45, color: 'bg-blue-500' },
    { name: 'S1', count: 32, color: 'bg-green-500' },
    { name: 'Farmasi', count: 28, color: 'bg-purple-500' },
    { name: 'Hukum', count: 15, color: 'bg-orange-500' },
    { name: 'PGSD', count: 12, color: 'bg-pink-500' },
    { name: 'Manajemen Akuntansi', count: 8, color: 'bg-indigo-500' },
    { name: 'Lainnya', count: 5, color: 'bg-gray-500' },
  ];

  // Data status kelompok dengan nilai contoh
  const statusData = [
    { name: 'Aktif', count: 45, color: 'bg-green-500' },
    { name: 'Menunggu', count: 30, color: 'bg-yellow-500' },
    { name: 'Selesai', count: 23, color: 'bg-blue-500' },
  ];

  // Data distribusi desa dengan nilai contoh
  const desaData = [
    { name: 'Astanajapura', count: 75 },
    { name: 'Palimanan', count: 60 },
    { name: 'Ciwaringin', count: 45 },
    { name: 'Plumbon', count: 30 },
    { name: 'Gempol', count: 20 },
    { name: 'Sumber', count: 15 },
  ];

  const maxDesaCount = 80;

  // Hitung total untuk persentase donut chart
  const totalStatus = statusData.reduce((sum, s) => sum + s.count, 0);
  let cumulativeOffset = 0;
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard KKM</h1>
        <p className="text-gray-500 text-sm">
          Monitoring pelaksanaan Kuliah Kerja Mahasiswa (KKM)
        </p>
      </div>

      {/* Stats Grid - 2 rows x 3 columns */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.slice(0, 3).map((stat, index) => {
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
                <div className={`${stat.color} p-2.5 rounded-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.slice(3, 6).map((stat, index) => {
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
                <div className={`${stat.color} p-2.5 rounded-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row - 2 columns (Prodi & Status) */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Peserta Berdasarkan Program Studi */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Peserta Berdasarkan Program Studi
          </h3>
          <div className="space-y-2.5">
            {prodiData.map((prodi, index) => {
              const maxCount = Math.max(...prodiData.map(p => p.count));
              const percentage = (prodi.count / maxCount) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                    <span>{prodi.name}</span>
                    <span>{prodi.count} Mahasiswa</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`${prodi.color} h-1.5 rounded-full transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Kelompok KKM */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Status Kelompok KKM
          </h3>
          <div className="flex items-center gap-6">
            {/* Donut Chart */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-28 h-28">
                {statusData.map((status, index) => {
                  const percentage = (status.count / totalStatus) * 100;
                  const offset = circumference * (1 - percentage / 100);
                  
                  const colors = ['#22C55E', '#EAB308', '#3B82F6'];
                  
                  const element = (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={colors[index]}
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset + cumulativeOffset}
                      className="origin-center -rotate-90 transition-all duration-700"
                    />
                  );
                  
                  cumulativeOffset += circumference * (percentage / 100);
                  return element;
                })}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="12"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-lg font-bold text-gray-800">{totalStatus}</span>
                  <p className="text-[8px] text-gray-400 -mt-0.5">Total</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {statusData.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
                    <span className="text-xs text-gray-600">{status.name}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-800">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribusi Mahasiswa per Desa - Full width at bottom */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Distribusi Mahasiswa per Desa
        </h3>
        <div className="space-y-2.5">
          {desaData.map((desa, index) => {
            const percentage = (desa.count / maxDesaCount) * 100;
            return (
              <div key={index}>
                <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                  <span>{desa.name}</span>
                  <span>{desa.count} Mahasiswa</span>
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
          0 | 20 | 40 | 60 | 80
        </div>
      </div>
    </div>
  );
}
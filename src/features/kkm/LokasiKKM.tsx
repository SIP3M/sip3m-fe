import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Building,
  Users,
  Home,
  CheckCircle,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function LokasiKKM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);

  // Data lokasi desa KKM
  const lokasiData = [
    {
      id: 1,
      desa: 'Astanajapura',
      kecamatan: 'Astanajapura',
      kabupaten: 'Cirebon',
      tema: 'Pemberdayaan UMKM',
      kuota: 80,
      terisi: 80,
      maxKelompok: 8,
      status: 'Penuh',
    },
    {
      id: 2,
      desa: 'Palimanan',
      kecamatan: 'Palimanan',
      kabupaten: 'Cirebon',
      tema: 'Digitalisasi Desa',
      kuota: 75,
      terisi: 70,
      maxKelompok: 7,
      status: 'Tersedia',
    },
    {
      id: 3,
      desa: 'Gempol',
      kecamatan: 'Gempol',
      kabupaten: 'Cirebon',
      tema: 'Kesehatan Masyarakat',
      kuota: 68,
      terisi: 50,
      maxKelompok: 7,
      status: 'Tersedia',
    },
    {
      id: 4,
      desa: 'Ciwaringin',
      kecamatan: 'Ciwaringin',
      kabupaten: 'Cirebon',
      tema: 'Lingkungan Hidup',
      kuota: 60,
      terisi: 60,
      maxKelompok: 6,
      status: 'Penuh',
    },
    {
      id: 5,
      desa: 'Plumbon',
      kecamatan: 'Plumbon',
      kabupaten: 'Cirebon',
      tema: 'Pendidikan Dasar',
      kuota: 55,
      terisi: 40,
      maxKelompok: 5,
      status: 'Tersedia',
    },
    {
      id: 6,
      desa: 'Sumber',
      kecamatan: 'Sumber',
      kabupaten: 'Cirebon',
      tema: 'Pemberdayaan Perempuan',
      kuota: 50,
      terisi: 45,
      maxKelompok: 5,
      status: 'Tersedia',
    },
    {
      id: 7,
      desa: 'Kedawung',
      kecamatan: 'Kedawung',
      kabupaten: 'Cirebon',
      tema: 'Agribisnis',
      kuota: 45,
      terisi: 45,
      maxKelompok: 4,
      status: 'Penuh',
    },
  ];

  // Statistik
  const stats = {
    total: lokasiData.length,
    tersedia: lokasiData.filter(l => l.status === 'Tersedia').length,
    penuh: lokasiData.filter(l => l.status === 'Penuh').length,
    totalKuota: lokasiData.reduce((sum, l) => sum + l.kuota, 0),
    totalTerisi: lokasiData.reduce((sum, l) => sum + l.terisi, 0),
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'Tersedia') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle size={12} />
          Tersedia
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <XCircle size={12} />
        Penuh
      </span>
    );
  };

  // Progress bar untuk kuota
  const KuotaProgress = ({ terisi, kuota }: { terisi: number; kuota: number }) => {
    const percentage = (terisi / kuota) * 100;
    const isFull = terisi === kuota;
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {terisi}/{kuota}
        </span>
      </div>
    );
  };

  // Filter data
  const filteredData = lokasiData.filter((item) => {
    const matchesSearch =
      item.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tema.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'semua' || item.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lokasi / Desa KKM</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manajemen lokasi dan desa penempatan KKM
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus size={18} />
          Tambah Lokasi
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Desa</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Home size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tersedia</p>
              <p className="text-2xl font-bold text-green-600 mt-0.5">{stats.tersedia}</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle size={18} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Penuh</p>
              <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.penuh}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <XCircle size={18} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Kuota</p>
              <p className="text-2xl font-bold text-purple-600 mt-0.5">{stats.totalKuota}</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <Users size={18} className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Terisi</p>
              <p className="text-2xl font-bold text-orange-600 mt-0.5">{stats.totalTerisi}</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <Users size={18} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari desa, kecamatan, kabupaten, atau tema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="semua">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="penuh">Penuh</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  DESA
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  KECAMATAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  KABUPATEN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  TEMA
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  KUOTA
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  TERISI
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  MAKS. KELOMPOK
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((lokasi) => (
                  <tr key={lokasi.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{lokasi.desa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lokasi.kecamatan}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lokasi.kabupaten}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {lokasi.tema}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lokasi.kuota}
                    </td>
                    <td className="px-6 py-4">
                      <KuotaProgress terisi={lokasi.terisi} kuota={lokasi.kuota} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {lokasi.maxKelompok}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lokasi.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Home size={40} className="text-gray-300" />
                      <p className="text-sm font-medium">Tidak ada data lokasi</p>
                      <p className="text-xs text-gray-400">Coba ubah filter atau tambahkan lokasi baru</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} lokasi
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function PesertaKKM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('semua');
  const [selectedKelompok, setSelectedKelompok] = useState('semua');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Data peserta KKM
  const pesertaData = [
    {
      id: 1,
      nim: '210411001',
      nama: 'Andi Pratama',
      prodi: 'Teknik Informatika',
      fakultas: 'FT',
      semester: 7,
      statusVerifikasi: 'Verified',
      statusKelompok: 'Kelompok 07 Astana Japura',
    },
    {
      id: 2,
      nim: '210411002',
      nama: 'Siti Rahayu',
      prodi: 'Sistem Informasi',
      fakultas: 'FT',
      semester: 7,
      statusVerifikasi: 'Pending',
      statusKelompok: 'Belum Diempatkan',
    },
    {
      id: 3,
      nim: '210421003',
      nama: 'Budi Santoso',
      prodi: 'Farmasi',
      fakultas: 'FF',
      semester: 7,
      statusVerifikasi: 'Verified',
      statusKelompok: 'Kelompok 03 Gempol',
    },
    {
      id: 4,
      nim: '210431004',
      nama: 'Dewi Anggraini',
      prodi: 'Hukum',
      fakultas: 'FH',
      semester: 7,
      statusVerifikasi: 'Pending',
      statusKelompok: 'Belum Diempatkan',
    },
    {
      id: 5,
      nim: '210411005',
      nama: 'Rizky Firmansyah',
      prodi: 'Teknik Informatika',
      fakultas: 'FT',
      semester: 5,
      statusVerifikasi: 'Verified',
      statusKelompok: 'Kelompok 12 Ciwaringin',
    },
    {
      id: 6,
      nim: '210412006',
      nama: 'Nurul Hidayah',
      prodi: 'Manajemen',
      fakultas: 'FE',
      semester: 7,
      statusVerifikasi: 'Rejected',
      statusKelompok: 'Belum Diempatkan',
    },
    {
      id: 7,
      nim: '210421007',
      nama: 'Ahmad Fauzi',
      prodi: 'Farmasi',
      fakultas: 'FF',
      semester: 5,
      statusVerifikasi: 'Verified',
      statusKelompok: 'Kelompok 03 Gempol',
    },
    {
      id: 8,
      nim: '210431008',
      nama: 'Lina Marlina',
      prodi: 'Hukum',
      fakultas: 'FH',
      semester: 7,
      statusVerifikasi: 'Pending',
      statusKelompok: 'Belum Diempatkan',
    },
    {
      id: 9,
      nim: '210411009',
      nama: 'Doni Saputra',
      prodi: 'Teknik Informatika',
      fakultas: 'FT',
      semester: 5,
      statusVerifikasi: 'Verified',
      statusKelompok: 'Kelompok 07 Astana Japura',
    },
    {
      id: 10,
      nim: '210412010',
      nama: 'Rina Febrianti',
      prodi: 'Akuntansi',
      fakultas: 'FE',
      semester: 7,
      statusVerifikasi: 'Pending',
      statusKelompok: 'Belum Diempatkan',
    },
  ];

  // Statistik
  const stats = {
    total: pesertaData.length,
    verified: pesertaData.filter(p => p.statusVerifikasi === 'Verified').length,
    pending: pesertaData.filter(p => p.statusVerifikasi === 'Pending').length,
    rejected: pesertaData.filter(p => p.statusVerifikasi === 'Rejected').length,
    belumKelompok: pesertaData.filter(p => p.statusKelompok === 'Belum Diempatkan').length,
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      Verified: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: CheckCircle,
        border: 'border-green-200',
      },
      Pending: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        icon: Clock,
        border: 'border-yellow-200',
      },
      Rejected: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: XCircle,
        border: 'border-red-200',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  // Status kelompok badge
  const KelompokBadge = ({ status }: { status: string }) => {
    if (status === 'Belum Diempatkan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
          <UserX size={12} />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Users size={12} />
        {status}
      </span>
    );
  };

  // Filter data
  const filteredData = pesertaData.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.includes(searchTerm) ||
      item.prodi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester = selectedSemester === 'semua' || item.semester.toString() === selectedSemester;
    const matchesKelompok = selectedKelompok === 'semua' || 
      (selectedKelompok === 'berkelompok' && item.statusKelompok !== 'Belum Diempatkan') ||
      (selectedKelompok === 'belum' && item.statusKelompok === 'Belum Diempatkan');
    const matchesStatus = selectedStatus === 'semua' || item.statusVerifikasi.toLowerCase() === selectedStatus;

    return matchesSearch && matchesSemester && matchesKelompok && matchesStatus;
  });

  // Filter status untuk tab
  const statusTabs = [
    { label: 'Semua', count: stats.total, value: 'semua' },
    { label: 'Pending', count: stats.pending, value: 'pending' },
    { label: 'Verified', count: stats.verified, value: 'verified' },
    { label: 'Rejected', count: stats.rejected, value: 'rejected' },
    { label: 'Belum Kelompok', count: stats.belumKelompok, value: 'belum-kelompok' },
  ];

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map(item => item.id));
    }
  };

  // Toggle select item
  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Peserta KKM</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manajemen dan verifikasi peserta Kuliah Kerja Mahasiswa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <UserPlus size={18} />
            Tambah Peserta
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Peserta</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Verified</p>
              <p className="text-2xl font-bold text-green-600 mt-0.5">{stats.verified}</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle size={18} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-0.5">{stats.pending}</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Clock size={18} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.rejected}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <XCircle size={18} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Belum Kelompok</p>
              <p className="text-2xl font-bold text-orange-600 mt-0.5">{stats.belumKelompok}</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <UserX size={18} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari mahasiswa, NIM, prodi, atau kelompok..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="semua">Semua Semester</option>
              <option value="5">Semester 5</option>
              <option value="7">Semester 7</option>
            </select>
            <select
              value={selectedKelompok}
              onChange={(e) => setSelectedKelompok(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="semua">Semua (Kelompok)</option>
              <option value="berkelompok">Sudah Berkelompok</option>
              <option value="belum">Belum Berkelompok</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === tab.value
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} {tab.count}
          </button>
        ))}
      </div>

      {/* Selected count */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            {selectedItems.length} peserta dipilih
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
              Verifikasi
            </button>
            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors">
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  NIM
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  NAMA
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PRODI / FAK.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SEM.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STATUS VERIFIKASI
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STATUS KELOMPOK
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((peserta) => (
                  <tr key={peserta.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(peserta.id)}
                        onChange={() => toggleSelectItem(peserta.id)}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {peserta.nim}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {peserta.nama}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-800">{peserta.prodi}</p>
                        <p className="text-xs text-gray-400">{peserta.fakultas}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                      {peserta.semester}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={peserta.statusVerifikasi} />
                    </td>
                    <td className="px-4 py-3">
                      <KelompokBadge status={peserta.statusKelompok} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
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
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={40} className="text-gray-300" />
                      <p className="text-sm font-medium">Tidak ada data peserta</p>
                      <p className="text-xs text-gray-400">Coba ubah filter atau tambahkan peserta baru</p>
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
            Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} peserta
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
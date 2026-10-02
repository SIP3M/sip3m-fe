import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Check,
  X,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Download,
} from 'lucide-react';
import ImportMahasiswaModal from './Importmahasiswamodal';

export default function PesertaKKM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('KKM Reguler 2026');
  const [selectedFakultas, setSelectedFakultas] = useState('semua');
  const [selectedProdi, setSelectedProdi] = useState('semua');
  const [selectedSemester, setSelectedSemester] = useState('semua');
  const [selectedKelompok, setSelectedKelompok] = useState('semua');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  // Opsi filter Fakultas & Program Studi diturunkan otomatis dari data yang ada
  const fakultasOptions = Array.from(new Set(pesertaData.map((p) => p.fakultas)));
  const prodiOptions = Array.from(new Set(pesertaData.map((p) => p.prodi)));

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      Verified: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        dot: 'bg-green-500',
      },
      Pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
      },
      Rejected: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        dot: 'bg-red-500',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {status}
      </span>
    );
  };

  // Parse "Kelompok 07 Astana Japura" -> { nomor: "Kelompok 07", lokasi: "Astana Japura" }
  const parseKelompok = (status: string): { nomor: string; lokasi: string } | null => {
    if (status === 'Belum Diempatkan') return null;
    const match = status.match(/^(Kelompok\s+\d+)\s+(.*)$/i);
    if (!match) return { nomor: status, lokasi: '' };
    return { nomor: match[1], lokasi: match[2] };
  };

  // Status kelompok cell
  const KelompokCell = ({ status }: { status: string }) => {
    const parsed = parseKelompok(status);

    if (!parsed) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600">
          <Clock size={12} />
          Belum Ditempatkan
        </span>
      );
    }

    return (
      <div>
        <p className="text-sm font-semibold text-gray-800">{parsed.nomor}</p>
        {parsed.lokasi && <p className="text-xs text-gray-400">{parsed.lokasi}</p>}
      </div>
    );
  };

  // Filter data
  const filteredData = pesertaData.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.includes(searchTerm) ||
      item.prodi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFakultas = selectedFakultas === 'semua' || item.fakultas === selectedFakultas;
    const matchesProdi = selectedProdi === 'semua' || item.prodi === selectedProdi;
    const matchesSemester = selectedSemester === 'semua' || item.semester.toString() === selectedSemester;
    const matchesKelompok = selectedKelompok === 'semua' ||
      (selectedKelompok === 'berkelompok' && item.statusKelompok !== 'Belum Diempatkan') ||
      (selectedKelompok === 'belum' && item.statusKelompok === 'Belum Diempatkan');

    const matchesStatus =
      selectedStatus === 'semua' ||
      (selectedStatus === 'belum-kelompok'
        ? item.statusKelompok === 'Belum Diempatkan'
        : item.statusVerifikasi.toLowerCase() === selectedStatus);

    return matchesSearch && matchesFakultas && matchesProdi && matchesSemester && matchesKelompok && matchesStatus;
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

  // Pagination — 10 per halaman sesuai desain (10 data contoh muat dalam 1 halaman)
  const itemsPerPage = 10;
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
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Upload size={18} />
          Import Mahasiswa
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-red-50 p-2.5 rounded-xl shrink-0">
            <Users size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Peserta</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-green-50 p-2.5 rounded-xl shrink-0">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Verified</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{stats.verified}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-amber-50 p-2.5 rounded-xl shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Pending</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-red-50 p-2.5 rounded-xl shrink-0">
            <XCircle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Rejected</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{stats.rejected}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-xl shrink-0">
            <AlertCircle size={18} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Belum Kelompok</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{stats.belumKelompok}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
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

          {/* Periode masih 1 opsi statis — siap dikembangkan begitu ada multi-periode dari API */}
          <select
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="KKM Reguler 2026">KKM Reguler 2026</option>
          </select>

          <select
            value={selectedFakultas}
            onChange={(e) => setSelectedFakultas(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="semua">Semua Fakultas</option>
            {fakultasOptions.map((fak) => (
              <option key={fak} value={fak}>{fak}</option>
            ))}
          </select>

          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="semua">Semua Program Studi</option>
            {prodiOptions.map((prodi) => (
              <option key={prodi} value={prodi}>{prodi}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-gray-400" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="semua">Semua Semester</option>
            <option value="5">Semester 5</option>
            <option value="7">Semester 7</option>
          </select>
          <select
            value={selectedKelompok}
            onChange={(e) => setSelectedKelompok(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="semua">Semua (Kelompok)</option>
            <option value="berkelompok">Sudah Berkelompok</option>
            <option value="belum">Belum Berkelompok</option>
          </select>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              selectedStatus === tab.value
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label} {tab.count}
          </button>
        ))}
      </div>

      {/* Selected count */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-blue-700 font-semibold">
            {selectedItems.length} peserta dipilih
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {/* TODO: sambungkan tombol-tombol berikut ke API begitu tersedia */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
              <Check size={14} />
              Verifikasi Massal
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
              <X size={14} />
              Reject
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
              <UserCog size={14} />
              Assign Kelompok
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
              <Download size={14} />
              Export Data
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer ml-1"
            >
              Batal pilih
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  NIM
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Prodi / Fak.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sem.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status Verifikasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status Kelompok
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
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
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">
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
                      <KelompokCell status={peserta.statusKelompok} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <Eye size={16} />
                        </button>

                        {/* Aksi cepat verifikasi/tolak hanya muncul untuk peserta berstatus Pending */}
                        {peserta.statusVerifikasi === 'Pending' && (
                          <>
                            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer">
                              <CheckCircle2 size={16} />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
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
            Menampilkan {paginatedData.length} dari {filteredData.length} peserta
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
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
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {isImportModalOpen && (
        <ImportMahasiswaModal
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            // TODO: refresh data peserta dari API begitu endpoint sudah tersedia
            console.log('Import mahasiswa berhasil disimpan');
          }}
        />
      )}
    </div>
  );
}
import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  X,
  UserPlus,
  AlertCircle,
  Info,
  BookOpen,
} from 'lucide-react';

// Komponen Modal Assign DPL
interface AssignDPLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: any) => void;
}

function AssignDPLModal({ isOpen, onClose, onAssign }: AssignDPLModalProps) {
  const [selectedDosen, setSelectedDosen] = useState<string>('');
  const [selectedPeriode, setSelectedPeriode] = useState<string>('KKM Reguler 2026');
  const [selectedKelompok, setSelectedKelompok] = useState<number[]>([]);
  const [maxKelompok, setMaxKelompok] = useState<number>(3);
  const [searchDosen, setSearchDosen] = useState<string>('');

  // Data dosen untuk dipilih
  const dosenList = [
    { id: '0615018901', name: 'Ir. Dewi Lestari, M.T.', prodi: 'Teknik Sipil', fakultas: 'FT' },
    { id: '0309018401', name: 'Dr. Fajar Nugroho, M.Pd', prodi: 'Pendidikan IPA', fakultas: 'FKIP' },
    { id: '0412028801', name: 'Dr. Ahmad Fauzi, M.Kom', prodi: 'Teknik Informatika', fakultas: 'FT' },
    { id: '0205017201', name: 'Dr. Siti Aminah, M.Pd', prodi: 'PGSD', fakultas: 'FKIP' },
  ];

  // Data kelompok KKM
  const kelompokList = [
    { id: 1, name: 'Kelompok 01', desa: 'Astanajapura', jumlah: 10 },
    { id: 2, name: 'Kelompok 02', desa: 'Palimanan', jumlah: 10 },
    { id: 3, name: 'Kelompok 03', desa: 'Gempol', jumlah: 10 },
    { id: 4, name: 'Kelompok 04', desa: 'Ciwaringin', jumlah: 10 },
    { id: 5, name: 'Kelompok 05', desa: 'Plumbon', jumlah: 8 },
    { id: 6, name: 'Kelompok 06', desa: 'Sumber', jumlah: 8 },
  ];

  const filteredDosen = dosenList.filter(d =>
    d.name.toLowerCase().includes(searchDosen.toLowerCase()) ||
    d.id.includes(searchDosen)
  );

  const toggleKelompok = (id: number) => {
    if (selectedKelompok.includes(id)) {
      setSelectedKelompok(selectedKelompok.filter(k => k !== id));
    } else if (selectedKelompok.length < maxKelompok) {
      setSelectedKelompok([...selectedKelompok, id]);
    }
  };

  const handleSubmit = () => {
    if (!selectedDosen || selectedKelompok.length === 0) {
      alert('Silakan pilih dosen dan minimal 1 kelompok');
      return;
    }
    onAssign({
      dosen: selectedDosen,
      periode: selectedPeriode,
      kelompok: selectedKelompok,
      maxKelompok,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Assign DPL KKM</h2>
            <p className="text-sm text-gray-500">Tugaskan dosen sebagai pembimbing lapangan</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pilih Dosen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Dosen <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama dosen..."
                value={searchDosen}
                onChange={(e) => setSearchDosen(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-1">
              {filteredDosen.map((dosen) => (
                <div
                  key={dosen.id}
                  onClick={() => setSelectedDosen(dosen.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedDosen === dosen.id
                      ? 'bg-red-50 border border-red-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{dosen.name}</p>
                    <p className="text-xs text-gray-500">{dosen.id} · {dosen.prodi}</p>
                  </div>
                  {selectedDosen === dosen.id && (
                    <CheckCircle size={16} className="text-red-600 flex-shrink-0" />
                  )}
                </div>
              ))}
              {filteredDosen.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  Tidak ada dosen ditemukan
                </div>
              )}
            </div>
          </div>

          {/* Periode KKM */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Periode KKM <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="KKM Reguler 2026">KKM Reguler 2026</option>
              <option value="KKM Tematik 2026">KKM Tematik 2026</option>
              <option value="KKM Reguler 2025">KKM Reguler 2025</option>
            </select>
          </div>

          {/* Kelompok KKM */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kelompok KKM <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">
                {selectedKelompok.length} dari {maxKelompok} dipilih
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {kelompokList.map((kelompok) => (
                <div
                  key={kelompok.id}
                  onClick={() => toggleKelompok(kelompok.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedKelompok.includes(kelompok.id)
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    selectedKelompok.includes(kelompok.id)
                      ? 'bg-red-600 border-red-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedKelompok.includes(kelompok.id) && (
                      <CheckCircle size={12} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{kelompok.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={12} />
                      <span>{kelompok.desa}</span>
                      <span>·</span>
                      <Users size={12} />
                      <span>{kelompok.jumlah}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maksimal Kelompok */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maksimal Kelompok
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                value={maxKelompok}
                onChange={(e) => setMaxKelompok(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <span className="text-lg font-bold text-red-600 min-w-[24px] text-center">
                {maxKelompok}
              </span>
            </div>
            <div className="mt-2 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Beban Bimbingan</span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedKelompok.length} dari {maxKelompok} kelompok
              </span>
            </div>
          </div>

          {/* Informasi */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Aktifkan akses menu KKM otomatis</p>
                <p className="text-xs text-blue-600">
                  Dosen akan otomatis memperoleh akses fitur KKM pada akun mereka.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Role tetap DOSEN</p>
                <p className="text-xs text-blue-600">
                  Dosen memperoleh akses KKM berdasarkan penugasan aktif oleh LPPM. Akses otomatis dicabut saat penugasan berakhir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Tugaskan Sebagai DPL
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponen Utama
export default function DPLKKM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterFakultas, setFilterFakultas] = useState('semua');
  const [filterPeriode, setFilterPeriode] = useState('KKM Reguler 2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data DPL KKM
  const dplData = [
    {
      id: 1,
      nama: 'Dr. Ahmad Fauzi, M.Kom',
      nidn: '0412028801',
      prodi: 'Teknik Informatika',
      fakultas: 'FT',
      status: 'Aktif DPL',
      kelompok: '4/5',
      desa: 'Astanajapura',
      desaLain: 'Palimanan +2',
      periode: 'KKM Reguler 2026',
    },
    {
      id: 2,
      nama: 'Dr. Siti Aminah, M.Pd',
      nidn: '0205017201',
      prodi: 'PGSD',
      fakultas: 'FKIP',
      status: 'Aktif DPL',
      kelompok: '3/4',
      desa: 'Kedawung',
      desaLain: 'Gegesik +1',
      periode: 'KKM Reguler 2026',
    },
    {
      id: 3,
      nama: 'Dr. Budi Hartono, S.H., M.H.',
      nidn: '0301018501',
      prodi: 'Ilmu Hukum',
      fakultas: 'FH',
      status: 'Aktif DPL',
      kelompok: '2/3',
      desa: 'Sumber',
      desaLain: 'Waled',
      periode: 'KKM Reguler 2026',
    },
    {
      id: 4,
      nama: 'Dr. Rina Susanti, M.Farm',
      nidn: '0712079201',
      prodi: 'Farmasi',
      fakultas: 'FF',
      status: 'Aktif DPL',
      kelompok: '5/5',
      desa: 'Plumbon',
      desaLain: 'Depok +3',
      periode: 'KKM Reguler 2026',
    },
    {
      id: 5,
      nama: 'Dr. Yusuf Hidayat, M.T.',
      nidn: '0910018801',
      prodi: 'Sistem Informasi',
      fakultas: 'FT',
      status: 'Aktif DPL',
      kelompok: '2/4',
      desa: 'Babakan',
      desaLain: 'Mundu',
      periode: 'KKM Reguler 2026',
    },
    {
      id: 6,
      nama: 'Ir. Dewi Lestari, M.T.',
      nidn: '0615018901',
      prodi: 'Teknik Sipil',
      fakultas: 'FT',
      status: 'Belum Ditugaskan',
      kelompok: '—',
      desa: '—',
      desaLain: '',
      periode: '—',
    },
    {
      id: 7,
      nama: 'Dr. Fajar Nugroho, M.Pd',
      nidn: '0309018401',
      prodi: 'Pendidikan IPA',
      fakultas: 'FKIP',
      status: 'Belum Ditugaskan',
      kelompok: '—',
      desa: '—',
      desaLain: '',
      periode: '—',
    },
  ];

  // Statistik
  const stats = {
    totalAktif: dplData.filter(d => d.status === 'Aktif DPL').length,
    belumDitugaskan: dplData.filter(d => d.status === 'Belum Ditugaskan').length,
    totalKelompok: 19,
    rataRata: '3.8',
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'Aktif DPL') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle size={12} />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
        <Clock size={12} />
        {status}
      </span>
    );
  };

  // Filter data
  const filteredData = dplData.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nidn.includes(searchTerm) ||
      item.desa.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'semua' || 
      (filterStatus === 'aktif' && item.status === 'Aktif DPL') ||
      (filterStatus === 'belum' && item.status === 'Belum Ditugaskan');

    const matchesFakultas = filterFakultas === 'semua' || item.fakultas === filterFakultas;
    const matchesPeriode = filterPeriode === 'semua' || item.periode === filterPeriode;

    return matchesSearch && matchesStatus && matchesFakultas && matchesPeriode;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Handle Assign DPL
  const handleAssign = (data: any) => {
    console.log('Assign DPL:', data);
    // Tambahkan logic untuk menyimpan data
    alert(`DPL berhasil ditugaskan!`);
  };

  // Get unique fakultas for filter
  const fakultasList = ['semua', ...new Set(dplData.map(d => d.fakultas))];
  const periodeList = ['semua', ...new Set(dplData.map(d => d.periode).filter(p => p !== '—'))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen DPL KKM</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Kelola penugasan dosen pembimbing lapangan untuk setiap kelompok KKM.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Tambahkan DPL Baru
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total DPL Aktif</p>
              <p className="text-2xl font-bold text-green-600 mt-0.5">{stats.totalAktif}</p>
              <p className="text-xs text-gray-400 mt-0.5">Dosen pembimbing aktif saat ini</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <UserCheck size={18} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Belum Ditugaskan</p>
              <p className="text-2xl font-bold text-orange-600 mt-0.5">{stats.belumDitugaskan}</p>
              <p className="text-xs text-gray-400 mt-0.5">Dosen tersedia untuk DPL</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <UserX size={18} className="text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Kelompok KKM</p>
              <p className="text-2xl font-bold text-blue-600 mt-0.5">{stats.totalKelompok}</p>
              <p className="text-xs text-gray-400 mt-0.5">Kelompok aktif periode berjalan</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Rata-rata Bimbingan</p>
              <p className="text-2xl font-bold text-purple-600 mt-0.5">{stats.rataRata}</p>
              <p className="text-xs text-gray-400 mt-0.5">Per dosen pembimbing</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <BookOpen size={18} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Info size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Sistem Izin Dinamis DPL</p>
            <p className="text-xs text-blue-600">
              <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">DPL_KKM = ACTIVE</span> diberikan sementara. 
              Akses dicabut otomatis saat penugasan berakhir.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari dosen, NIDN, atau desa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white min-w-[140px]"
          >
            {periodeList.map(p => (
              <option key={p} value={p}>{p === 'semua' ? 'Semua Periode' : p}</option>
            ))}
          </select>
          <select
            value={filterFakultas}
            onChange={(e) => setFilterFakultas(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white min-w-[120px]"
          >
            {fakultasList.map(f => (
              <option key={f} value={f}>{f === 'semua' ? 'Semua Fakultas' : f}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white min-w-[100px]"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="belum">Belum Ditugaskan</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('semua');
              setFilterFakultas('semua');
              setFilterPeriode('KKM Reguler 2026');
            }}
            className="px-3 py-2 text-gray-500 hover:text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  NAMA DOSEN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  FAKULTAS / PRODI
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STATUS DPL
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  KELOMPOK
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  DESA BIMBINGAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PERIODE
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((dpl) => (
                  <tr key={dpl.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{dpl.nama}</p>
                        <p className="text-xs text-gray-400">{dpl.nidn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{dpl.prodi}</p>
                      <p className="text-xs text-gray-400">{dpl.fakultas}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={dpl.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {dpl.kelompok}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">{dpl.desa}</p>
                        {dpl.desaLain && (
                          <p className="text-xs text-gray-400">{dpl.desaLain}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {dpl.periode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        {dpl.status === 'Aktif DPL' ? (
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <XCircle size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg transition-colors"
                          >
                            Tugaskan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <User size={40} className="text-gray-300" />
                      <p className="text-sm font-medium">Tidak ada data DPL</p>
                      <p className="text-xs text-gray-400">Coba ubah filter atau tambahkan DPL baru</p>
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
            Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} dosen
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

      {/* Assign DPL Modal */}
      <AssignDPLModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssign={handleAssign}
      />
    </div>
  );
}

// Import missing icons
import { UserCheck, UserX } from 'lucide-react';
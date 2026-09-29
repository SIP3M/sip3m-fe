import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Users,
  Filter,
  ChevronDown,
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

interface StatusBadgeProps {
  status: 'Aktif' | 'Draft' | 'Selesai';
}

interface StatusConfig {
  bg: string;
  text: string;
  icon: React.ComponentType<{ size: number }>;
  border: string;
}

export default function PeriodeKKM(): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [showTambah, setShowTambah] = useState<boolean>(false);
  const [selectedPeriode, setSelectedPeriode] = useState<Periode | null>(null);

  // Data periode KKM
  const periodeData: Periode[] = [
    {
      id: 1,
      tahun: '2026',
      nama: 'KKM Reguler 2026',
      target: '1,248 mhs',
      jenis: 'Reguler',
      pelaksanaan: '2026-02-01',
      penarikan: '2026-02-28',
      status: 'Aktif',
    },
    {
      id: 2,
      tahun: '2026',
      nama: 'KKM Tematik 2026',
      target: '400 mhs',
      jenis: 'Tematik',
      pelaksanaan: '2026-04-01',
      penarikan: '2026-04-30',
      status: 'Draft',
    },
    {
      id: 3,
      tahun: '2025',
      nama: 'KKM Reguler 2025',
      target: '1,100 mhs',
      jenis: 'Reguler',
      pelaksanaan: '2025-02-01',
      penarikan: '2025-02-28',
      status: 'Selesai',
    },
    {
      id: 4,
      tahun: '2025',
      nama: 'KKM Tematik 2025',
      target: '350 mhs',
      jenis: 'Tematik',
      pelaksanaan: '2025-04-01',
      penarikan: '2025-04-30',
      status: 'Selesai',
    },
    {
      id: 5,
      tahun: '2024',
      nama: 'KKM Reguler 2024',
      target: '980 mhs',
      jenis: 'Reguler',
      pelaksanaan: '2024-02-01',
      penarikan: '2024-02-28',
      status: 'Selesai',
    },
  ];

  // Status badge component
  const StatusBadge = ({ status }: StatusBadgeProps): React.ReactElement => {
    const statusConfig: Record<string, StatusConfig> = {
      Aktif: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: CheckCircle,
        border: 'border-green-200',
      },
      Draft: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        icon: Clock,
        border: 'border-yellow-200',
      },
      Selesai: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        icon: XCircle,
        border: 'border-gray-200',
      },
    };

    const config = statusConfig[status] || statusConfig.Draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  // Filter data berdasarkan search dan status
  const filteredData: Periode[] = periodeData.filter((item: Periode) => {
    const matchesSearch: boolean = 
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tahun.includes(searchTerm) ||
      item.jenis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus: boolean = filterStatus === 'semua' || item.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Hitung periode aktif
  const activePeriode: Periode | undefined = periodeData.find((p: Periode) => p.status === 'Aktif');

  // Handler untuk membuka detail
  const handleViewDetail = (periode: Periode): void => {
    setSelectedPeriode(periode);
    setShowDetail(true);
  };

  // Handler untuk membuka tambah periode
  const handleTambahPeriode = (): void => {
    setShowTambah(true);
  };

  // Handler untuk kembali dari detail
  const handleBackFromDetail = (): void => {
    setShowDetail(false);
    setSelectedPeriode(null);
  };

  // Handler untuk kembali dari tambah
  const handleBackFromTambah = (): void => {
    setShowTambah(false);
  };

  // Jika showDetail true, tampilkan halaman detail
  if (showDetail && selectedPeriode) {
    return <DetailPeriodeKKM periode={selectedPeriode} onBack={handleBackFromDetail} />;
  }

  // Jika showTambah true, tampilkan halaman tambah
  if (showTambah) {
    return <TambahPeriodeKKM onBack={handleBackFromTambah} />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Periode KKM</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manajemen periode pelaksanaan Kuliah Kerja Mahasiswa
          </p>
        </div>
        <button 
          onClick={handleTambahPeriode}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} />
          Tambah Periode
        </button>
      </div>

      {/* Periode Aktif Banner */}
      {activePeriode && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                Periode aktif saat ini: <span className="font-bold">{activePeriode.nama}</span>
              </p>
              <p className="text-xs text-green-600">
                {activePeriode.pelaksanaan} - {activePeriode.penarikan} • Target: {activePeriode.target}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <CheckCircle size={14} />
              Aktif
            </span>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari periode..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="draft">Draft</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Menampilkan {filteredData.length} periode
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
                  Tahun
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Periode
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pelaksanaan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Penarikan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((periode: Periode) => (
                  <tr key={periode.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {periode.tahun}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{periode.nama}</p>
                        <p className="text-xs text-gray-500">Target: {periode.target}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${periode.jenis === 'Reguler' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {periode.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {periode.pelaksanaan}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {periode.penarikan}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={periode.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(periode)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                        {periode.status === 'Draft' && (
                          <button className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg transition-colors">
                            Aktifkan
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
                      <FileText size={40} className="text-gray-300" />
                      <p className="text-sm font-medium">Tidak ada data periode</p>
                      <p className="text-xs text-gray-400">Coba ubah filter atau tambahkan periode baru</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
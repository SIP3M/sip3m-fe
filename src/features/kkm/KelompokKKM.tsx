import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Printer,
  Search,
  Eye,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  Check,
  Edit,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';

// ==================== TYPES & INTERFACES ====================

interface Mahasiswa {
  nim: string;
  nama: string;
  prodi: string;
  fakultas: string;
  gender: 'L' | 'P';
  status: 'Verified' | 'Pending' | 'Rejected';
}

interface ProgramKerja {
  id: number;
  nama: string;
  status: 'Aktif' | 'Selesai';
}

interface RiwayatAktivitas {
  date: string;
  event: string;
  isImportant?: boolean;
}

interface KelompokData {
  id: number;
  nama: string;
  periode: string;
  dpl: string;
  desa: string;
  kecamatan: string;
  status: 'Aktif' | 'Perlu Perhatian' | 'Bermasalah' | 'Selesai';
  anggota: Mahasiswa[];
  programKerja: ProgramKerja[];
  riwayat: RiwayatAktivitas[];
}

// ==================== MOCK DATA ====================

const initialKelompokList: KelompokData[] = [
  {
    id: 1,
    nama: 'Kelompok 01',
    periode: 'KKM Reguler 2026',
    dpl: 'Dr. Ahmad Fauzi, M.Kom',
    desa: 'Astanajapura',
    kecamatan: 'Astanajapura',
    status: 'Aktif',
    anggota: [
      { nim: '210411001', nama: 'Andi Pratama', prodi: 'Teknik Informatika', fakultas: 'FT', gender: 'L', status: 'Verified' },
      { nim: '210481010', nama: 'Fitri Handayani', prodi: 'Pendidikan Agama Islam', fakultas: 'FAI', gender: 'P', status: 'Verified' },
      { nim: '210421003', nama: 'Budi Santoso', prodi: 'Farmasi', fakultas: 'FF', gender: 'L', status: 'Verified' },
      { nim: '210431004', nama: 'Dewi Anggraini', prodi: 'Hukum', fakultas: 'FH', gender: 'P', status: 'Verified' },
      { nim: '210451009', nama: 'Hendra Kusuma', prodi: 'Manajemen', fakultas: 'FEB', gender: 'L', status: 'Verified' },
      { nim: '210451010', nama: 'Indah Permata', prodi: 'Akuntansi', fakultas: 'FEB', gender: 'P', status: 'Verified' },
      { nim: '210441011', nama: 'Joko Prabowo', prodi: 'PGSD', fakultas: 'FKIP', gender: 'L', status: 'Verified' },
      { nim: '210411012', nama: 'Karina Dewi', prodi: 'Sistem Informasi', fakultas: 'FT', gender: 'P', status: 'Verified' },
      { nim: '210471013', nama: 'Lukman Hakim', prodi: 'Keperawatan', fakultas: 'FIKES', gender: 'L', status: 'Pending' },
      { nim: '210451014', nama: 'Maya Sari', prodi: 'Manajemen', fakultas: 'FEB', gender: 'P', status: 'Pending' },
    ],
    programKerja: [
      { id: 1, nama: 'Edukasi Digital UMKM', status: 'Aktif' },
      { id: 2, nama: 'Penyuluhan Kesehatan Masyarakat', status: 'Selesai' },
      { id: 3, nama: 'Pelatihan Administrasi Desa', status: 'Aktif' },
    ],
    riwayat: [
      { date: '12 Januari 2026', event: 'Kelompok berhasil dibuat melalui Generate Otomatis' },
      { date: '15 Januari 2026', event: 'DPL ditugaskan — Dr. Ahmad Fauzi, M.Kom' },
      { date: '20 Januari 2026', event: 'Pembekalan selesai dilaksanakan' },
      { date: '25 Januari 2026', event: 'Program kerja pertama ditambahkan' },
      { date: '01 Februari 2026', event: 'Pelaksanaan KKM dimulai di Desa Astanajapura', isImportant: true },
    ]
  },
  {
    id: 2,
    nama: 'Kelompok 02',
    periode: 'KKM Reguler 2026',
    dpl: 'Dr. Siti Aminah, M.Pd',
    desa: 'Palimanan',
    kecamatan: 'Palimanan',
    status: 'Perlu Perhatian',
    anggota: [
      { nim: '210411020', nama: 'Roni Wijaya', prodi: 'Teknik Sipil', fakultas: 'FT', gender: 'L', status: 'Verified' },
      { nim: '210481021', nama: 'Siti Rahma', prodi: 'Pendidikan Bahasa Inggris', fakultas: 'FKIP', gender: 'P', status: 'Verified' },
      { nim: '210421022', nama: 'Dedi Kurniawan', prodi: 'Farmasi', fakultas: 'FF', gender: 'L', status: 'Verified' },
      { nim: '210431023', nama: 'Lia Ananda', prodi: 'Hukum', fakultas: 'FH', gender: 'P', status: 'Pending' },
    ],
    programKerja: [
      { id: 1, nama: 'Sosialisasi Sanitasi Bersih', status: 'Aktif' }
    ],
    riwayat: [
      { date: '12 Januari 2026', event: 'Kelompok berhasil dibuat melalui Generate Otomatis' },
      { date: '16 Januari 2026', event: 'DPL ditugaskan — Dr. Siti Aminah, M.Pd' },
    ]
  },
  {
    id: 3,
    nama: 'Kelompok 03',
    periode: 'KKM Reguler 2026',
    dpl: 'Dr. Budi Hartono, S.H., M.H.',
    desa: 'Gempol',
    kecamatan: 'Gempol',
    status: 'Bermasalah',
    anggota: [
      { nim: '210411030', nama: 'Rian Hidayat', prodi: 'Teknik Informatika', fakultas: 'FT', gender: 'L', status: 'Verified' },
      { nim: '210481031', nama: 'Amelia Putri', prodi: 'Pendidikan Matematika', fakultas: 'FKIP', gender: 'P', status: 'Pending' },
    ],
    programKerja: [],
    riwayat: [
      { date: '12 Januari 2026', event: 'Kelompok berhasil dibuat melalui Generate Otomatis' },
    ]
  },
  {
    id: 4,
    nama: 'Kelompok 04',
    periode: 'KKM Reguler 2026',
    dpl: 'Dr. Rina Susanti, M.Farm',
    desa: 'Ciwaringin',
    kecamatan: 'Ciwaringin',
    status: 'Selesai',
    anggota: [
      { nim: '210411040', nama: 'Guntur Pamungkas', prodi: 'Teknik Elektro', fakultas: 'FT', gender: 'L', status: 'Verified' },
      { nim: '210481041', nama: 'Hana Lestari', prodi: 'Pendidikan Biologi', fakultas: 'FKIP', gender: 'P', status: 'Verified' },
    ],
    programKerja: [
      { id: 1, nama: 'Pojok Literasi Desa', status: 'Selesai' }
    ],
    riwayat: [
      { date: '12 Januari 2026', event: 'Kelompok berhasil dibuat melalui Generate Otomatis' },
      { date: '15 Januari 2026', event: 'DPL ditugaskan — Dr. Rina Susanti' },
      { date: '28 Februari 2026', event: 'Penarikan KKM dilaksanakan', isImportant: true },
    ]
  }
];

// Map prodi name to color codes for pie/donut chart
const prodiColorMap: Record<string, string> = {
  'Teknik Informatika': '#ef4444',       // Red
  'Pendidikan Agama Islam': '#3b82f6',   // Blue
  'Farmasi': '#10b981',                 // Green
  'Hukum': '#f97316',                   // Orange
  'Manajemen': '#8b5cf6',               // Purple
  'Akuntansi': '#06b6d4',               // Cyan
  'PGSD': '#ec4899',                    // Pink
  'Sistem Informasi': '#6366f1',         // Indigo
  'Keperawatan': '#2563eb',             // Royal Blue
  'Teknik Sipil': '#14b8a6',            // Teal
  'Pendidikan Bahasa Inggris': '#eab308',// Yellow
  'Pendidikan Matematika': '#a855f7',   // Light Purple
  'Teknik Elektro': '#f43f5e',          // Rose
  'Pendidikan Biologi': '#22c55e',      // Bright Green
};

// ==================== MAIN COMPONENT ====================

export default function KelompokKKM() {
  const [kelompokList, setKelompokList] = useState<KelompokData[]>(initialKelompokList);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null); // Default ke Daftar Kelompok KKM

  // Detail View State
  const [memberSearch, setMemberSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [showEditDPLModal, setShowEditDPLModal] = useState(false);
  const [tempDPLName, setTempDPLName] = useState('');
  const [showEditKelompokModal, setShowEditKelompokModal] = useState(false);
  const [tempDesa, setTempDesa] = useState('');
  const [tempKecamatan, setTempKecamatan] = useState('');

  // Master List Filter state
  const [listSearch, setListSearch] = useState('');

  // Find currently selected group
  const activeGroup = useMemo(() => {
    return kelompokList.find(g => g.id === selectedGroupId) || kelompokList[0];
  }, [kelompokList, selectedGroupId]);

  // Statistics for active group
  const stats = useMemo(() => {
    const verified = activeGroup.anggota.filter(m => m.status === 'Verified').length;
    const pending = activeGroup.anggota.filter(m => m.status === 'Pending').length;
    const rejected = activeGroup.anggota.filter(m => m.status === 'Rejected').length;
    const total = activeGroup.anggota.length;

    const male = activeGroup.anggota.filter(m => m.gender === 'L').length;
    const female = activeGroup.anggota.filter(m => m.gender === 'P').length;

    return { verified, pending, rejected, total, male, female };
  }, [activeGroup]);

  // Prodi Composition for Pie Chart
  const prodiComposition = useMemo(() => {
    const counts: Record<string, number> = {};
    activeGroup.anggota.forEach(m => {
      counts[m.prodi] = (counts[m.prodi] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      color: prodiColorMap[name] || '#6b7280'
    }));
  }, [activeGroup]);

  // Interactive Filtered Members for Table
  const filteredMembers = useMemo(() => {
    return activeGroup.anggota.filter(m =>
      m.nama.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.nim.includes(memberSearch) ||
      m.prodi.toLowerCase().includes(memberSearch.toLowerCase())
    );
  }, [activeGroup, memberSearch]);

  // Pagination calculations
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage]);

  // Render SVG Pie Chart
  const renderPieChart = () => {
    const radius = 25;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercent = 0;

    const slices = prodiComposition.map((item, idx) => {
      const percent = (item.count / stats.total) * 100;
      const strokeLength = (percent / 100) * circumference;
      const strokeOffset = circumference - strokeLength + (accumulatedPercent / 100) * circumference;
      accumulatedPercent += percent;

      return (
        <circle
          key={idx}
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={item.color}
          strokeWidth="50" // High stroke width makes it a pie slice instead of donut
          strokeDasharray={`${strokeLength} ${circumference}`}
          strokeDashoffset={-strokeOffset}
          transform="rotate(-90 50 50)"
        />
      );
    });

    // Generate white divider lines between slices
    const dividers: React.ReactNode[] = [];
    let currentPercent = 0;
    prodiComposition.forEach((item, idx) => {
      const angle = (currentPercent / 100) * 360 - 90;
      const angleRad = (angle * Math.PI) / 180;
      const x2 = 50 + 50 * Math.cos(angleRad);
      const y2 = 50 + 50 * Math.sin(angleRad);

      dividers.push(
        <line
          key={`div-${idx}`}
          x1={50}
          y1={50}
          x2={x2}
          y2={y2}
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      );
      currentPercent += (item.count / stats.total) * 100;
    });

    return (
      <div className="relative w-36 h-36 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-105 transition-transform duration-300">
          {slices}
          {dividers}
        </svg>
      </div>
    );
  };

  // Helper actions
  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;

    const newProg: ProgramKerja = {
      id: Date.now(),
      nama: newProgramName,
      status: 'Aktif'
    };

    setKelompokList(prev =>
      prev.map(g => {
        if (g.id === activeGroup.id) {
          return {
            ...g,
            programKerja: [...g.programKerja, newProg],
            riwayat: [
              ...g.riwayat,
              { date: 'Hari ini', event: `Program kerja "${newProgramName}" ditambahkan` }
            ]
          };
        }
        return g;
      })
    );

    setNewProgramName('');
    setShowAddProgram(false);
  };

  const handleUpdateDPL = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempDPLName.trim()) return;

    setKelompokList(prev =>
      prev.map(g => {
        if (g.id === activeGroup.id) {
          return {
            ...g,
            dpl: tempDPLName,
            riwayat: [
              ...g.riwayat,
              { date: 'Hari ini', event: `DPL diganti menjadi — ${tempDPLName}` }
            ]
          };
        }
        return g;
      })
    );

    setShowEditDPLModal(false);
  };

  const handleUpdateKelompok = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempDesa.trim() || !tempKecamatan.trim()) return;

    setKelompokList(prev =>
      prev.map(g => {
        if (g.id === activeGroup.id) {
          return {
            ...g,
            desa: tempDesa,
            kecamatan: tempKecamatan,
            riwayat: [
              ...g.riwayat,
              { date: 'Hari ini', event: `Informasi kelompok diperbarui: Desa ${tempDesa}, Kec. ${tempKecamatan}` }
            ]
          };
        }
        return g;
      })
    );

    setShowEditKelompokModal(false);
  };

  const handleDeleteMember = (nim: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mahasiswa ini dari kelompok?')) return;

    setKelompokList(prev =>
      prev.map(g => {
        if (g.id === activeGroup.id) {
          const removedMember = g.anggota.find(m => m.nim === nim);
          return {
            ...g,
            anggota: g.anggota.filter(m => m.nim !== nim),
            riwayat: [
              ...g.riwayat,
              { date: 'Hari ini', event: `Mahasiswa ${removedMember?.nama} dikeluarkan dari kelompok` }
            ]
          };
        }
        return g;
      })
    );
  };

  const handleSwapMember = (nim: string) => {
    alert(`Pindahkan Mahasiswa dengan NIM ${nim} ke kelompok lain. Fitur ini membuka dialog pemindahan kelompok.`);
  };

  const handleCetak = () => {
    window.print();
  };

  // Filter master kelompok list
  const filteredKelompokList = useMemo(() => {
    return kelompokList.filter(g =>
      g.nama.toLowerCase().includes(listSearch.toLowerCase()) ||
      g.desa.toLowerCase().includes(listSearch.toLowerCase()) ||
      g.dpl.toLowerCase().includes(listSearch.toLowerCase())
    );
  }, [kelompokList, listSearch]);

  // ==================== RENDER: MASTER LIST VIEW ====================

  if (selectedGroupId === null) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daftar Kelompok KKM</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manajemen dan monitoring kelompok Kuliah Kerja Mahasiswa (KKM)
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelompok, desa, atau DPL..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-800"
            />
          </div>
        </div>

        {/* Kelompok Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKelompokList.map(g => (
            <div
              key={g.id}
              onClick={() => {
                setSelectedGroupId(g.id);
                setMemberSearch('');
                setCurrentPage(1);
              }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                    {g.nama}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${g.status === 'Aktif' ? 'bg-green-50 text-green-700 border border-green-200' :
                      g.status === 'Perlu Perhatian' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      g.status === 'Bermasalah' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'}`}
                  >
                    {g.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">DPL</span>
                    <span className="font-medium text-gray-700 truncate max-w-[180px]">{g.dpl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lokasi</span>
                    <span className="font-medium text-gray-700">{g.desa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Anggota</span>
                    <span className="font-medium text-gray-700">{g.anggota.length} Mahasiswa</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-medium text-gray-400">
                <span>{g.periode}</span>
                <span className="text-red-500 font-semibold group-hover:underline flex items-center gap-1">
                  Lihat Detail <ExternalLink size={12} />
                </span>
              </div>
            </div>
          ))}

          {filteredKelompokList.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
              <FileText className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-sm font-semibold">Tidak ada kelompok ditemukan</p>
              <p className="text-xs text-gray-400 mt-1">Coba ubah kata kunci pencarian Anda</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== RENDER: DETAIL VIEW ====================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => setSelectedGroupId(null)}
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-sm mt-1"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{activeGroup.nama}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {activeGroup.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Informasi lengkap kelompok mahasiswa KKM — {activeGroup.periode}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setTempDesa(activeGroup.desa);
              setTempKecamatan(activeGroup.kecamatan);
              setShowEditKelompokModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Edit size={15} />
            Edit Kelompok
          </button>
          <button
            onClick={() => {
              setTempDPLName(activeGroup.dpl);
              setShowEditDPLModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <ArrowLeftRight size={15} />
            Ganti DPL
          </button>
          <button
            onClick={handleCetak}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Printer size={15} />
            Cetak Daftar
          </button>
        </div>
      </div>

      {/* 2. GRID WRAPPER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card: Informasi Kelompok */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
              Informasi Kelompok
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">Periode</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{activeGroup.periode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">DPL</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{activeGroup.dpl}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Desa</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{activeGroup.desa}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Kecamatan</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{activeGroup.kecamatan}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Jumlah Anggota</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{stats.total} / 10 Mahasiswa</p>
              </div>

              {/* Progress Bar Kelengkapan */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-400">Kelengkapan</span>
                  <span className="text-red-600">{stats.total}/10</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(stats.total / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Komposisi Kelompok */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Komposisi Kelompok
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                ● Komposisi Seimbang
              </span>
            </div>

            {/* Render Pie Chart */}
            <div className="py-4 border-b border-gray-50">
              {renderPieChart()}
            </div>

            {/* Legend List */}
            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
              {prodiComposition.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 font-medium truncate max-w-[180px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Distribusi Gender */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
              Distribusi Gender
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Laki-laki */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-1">👨</span>
                <p className="text-2xl font-bold text-blue-700">{stats.male}</p>
                <p className="text-xs text-blue-500 font-medium">Laki-laki</p>
              </div>
              {/* Perempuan */}
              <div className="bg-pink-50/50 rounded-xl p-4 border border-pink-100/50 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-1">👩</span>
                <p className="text-2xl font-bold text-pink-700">{stats.female}</p>
                <p className="text-xs text-pink-500 font-medium">Perempuan</p>
              </div>
            </div>
          </div>

          {/* Card: Dokumen Kelompok */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
              Dokumen Kelompok
            </h3>
            <div className="space-y-3">
              {/* Proposal */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-500 rounded">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">Proposal Program Kerja</p>
                    <p className="text-[10px] text-green-600 font-medium">Terupload</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Lihat">
                    <Eye size={14} />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Unduh">
                    <Download size={14} />
                  </button>
                </div>
              </div>

              {/* Logbook */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-500 rounded">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">Logbook Kelompok</p>
                    <p className="text-[10px] text-green-600 font-medium">Terupload</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Lihat">
                    <Eye size={14} />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Unduh">
                    <Download size={14} />
                  </button>
                </div>
              </div>

              {/* Laporan Akhir */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 text-gray-400 rounded">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">Laporan Akhir KKM</p>
                    <p className="text-[10px] text-gray-400 font-medium">Belum diupload</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Row 1: Status Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Verified Card */}
            <div className="bg-emerald-50/50 rounded-xl border border-emerald-100/60 p-4">
              <p className="text-xs text-gray-400 font-medium">Sudah Verifikasi</p>
              <div className="flex items-baseline gap-1 mt-2">
                <p className="text-3xl font-extrabold text-emerald-600">{stats.verified}</p>
                <p className="text-xs text-gray-400">mahasiswa</p>
              </div>
            </div>

            {/* Pending Card */}
            <div className="bg-amber-50/50 rounded-xl border border-amber-100/60 p-4">
              <p className="text-xs text-gray-400 font-medium">Pending</p>
              <div className="flex items-baseline gap-1 mt-2">
                <p className="text-3xl font-extrabold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-gray-400">mahasiswa</p>
              </div>
            </div>

            {/* Rejected Card */}
            <div className="bg-rose-50/50 rounded-xl border border-rose-100/60 p-4">
              <p className="text-xs text-gray-400 font-medium">Rejected</p>
              <div className="flex items-baseline gap-1 mt-2">
                <p className="text-3xl font-extrabold text-rose-600">{stats.rejected}</p>
                <p className="text-xs text-gray-400">mahasiswa</p>
              </div>
            </div>
          </div>

          {/* Row 2: Progress KKM */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Progress KKM
              </h3>
              <p className="text-xs font-semibold text-gray-500">
                Tahapan saat ini: <span className="text-red-600 font-bold">Pelaksanaan</span>
              </p>
            </div>

            {/* Custom Step Progress Tracker */}
            <div className="relative">
              {/* Connector lines behind steps */}
              <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-0" />
              {/* Active/Completed Connector lines */}
              <div className="absolute top-4 left-[10%] w-[40%] h-0.5 bg-green-500 -z-0" />
              <div className="absolute top-4 left-[50%] w-[20%] h-0.5 bg-green-500 -z-0" />

              <div className="relative flex justify-between items-center z-10 px-4">
                {/* Step 1: Pembentukan */}
                <div className="flex flex-col items-center text-center max-w-[80px]">
                  <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center border-4 border-white shadow shadow-green-200">
                    <Check size={16} />
                  </div>
                  <p className="text-[10px] font-bold text-green-600 mt-2">Pembentukan</p>
                </div>

                {/* Step 2: Pembekalan */}
                <div className="flex flex-col items-center text-center max-w-[80px]">
                  <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center border-4 border-white shadow shadow-green-200">
                    <Check size={16} />
                  </div>
                  <p className="text-[10px] font-bold text-green-600 mt-2">Pembekalan</p>
                </div>

                {/* Step 3: Pelaksanaan */}
                <div className="flex flex-col items-center text-center max-w-[80px]">
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center border-4 border-white shadow-lg shadow-red-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </div>
                  <p className="text-[10px] font-bold text-red-600 mt-2">Pelaksanaan</p>
                </div>

                {/* Step 4: Logbook */}
                <div className="flex flex-col items-center text-center max-w-[80px]">
                  <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center border-4 border-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">Logbook</p>
                </div>

                {/* Step 5: Laporan Akhir */}
                <div className="flex flex-col items-center text-center max-w-[80px]">
                  <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center border-4 border-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">Laporan Akhir</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-medium text-center mt-6">
              Progress berdasarkan tahapan administrasi KKM.
            </p>
          </div>

          {/* Row 3: Daftar Anggota */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Daftar Anggota
              </h3>
              
              {/* Member Search input */}
              <div className="relative">
                <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari anggota..."
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-56 pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-800"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">NIM</th>
                    <th className="py-2.5 px-3">NAMA</th>
                    <th className="py-2.5 px-3">PRODI / FAK.</th>
                    <th className="py-2.5 px-3">GENDER</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedMembers.map((m, idx) => (
                    <tr key={idx} className="text-xs hover:bg-gray-50/50 transition-colors">
                      {/* NIM */}
                      <td className="py-3 px-3 font-mono text-gray-400">{m.nim}</td>
                      
                      {/* NAMA */}
                      <td className="py-3 px-3 font-bold text-gray-800">{m.nama}</td>
                      
                      {/* PRODI / FAK */}
                      <td className="py-3 px-3 text-gray-600">
                        <div>
                          <p className="font-semibold text-gray-700 leading-tight">{m.prodi}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{m.fakultas}</p>
                        </div>
                      </td>
                      
                      {/* GENDER */}
                      <td className="py-3 px-3 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex w-5 h-5 rounded bg-yellow-500/10 border border-yellow-500/20 items-center justify-center text-[10px] text-yellow-600 shadow-sm" role="img" aria-label="avatar">
                            👤
                          </span>
                          <span className={m.gender === 'L' ? 'text-blue-600' : 'text-pink-600'}>
                            {m.gender}
                          </span>
                        </div>
                      </td>
                      
                      {/* STATUS */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border
                          ${m.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}
                        >
                          {m.status}
                        </span>
                      </td>
                      
                      {/* ACTIONS */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => alert(`Detail Profile Mahasiswa: ${m.nama}`)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Detail"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleSwapMember(m.nim)}
                            className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Ganti Kelompok"
                          >
                            <ArrowLeftRight size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.nim)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Keluarkan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedMembers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Tidak ada anggota ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2 text-xs">
                <span className="text-gray-400">
                  Menampilkan <span className="font-semibold text-gray-600">{paginatedMembers.length}</span> dari <span className="font-semibold text-gray-600">{filteredMembers.length}</span> anggota
                </span>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-500"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold transition-colors border
                        ${currentPage === page
                          ? 'bg-red-600 border-red-600 text-white shadow-sm shadow-red-200'
                          : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-600'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-500"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Program Kerja */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Program Kerja
              </h3>
              <button
                onClick={() => setShowAddProgram(true)}
                className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
              >
                <Plus size={14} />
                Tambah
              </button>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {activeGroup.programKerja.map((prog) => (
                <div
                  key={prog.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    <span className="text-xs font-semibold text-gray-800">{prog.nama}</span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border
                    ${prog.status === 'Aktif'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-blue-50 text-blue-600 border-blue-200'}`}
                  >
                    {prog.status}
                  </span>
                </div>
              ))}

              {activeGroup.programKerja.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">
                  Belum ada program kerja terdaftar.
                </div>
              )}
            </div>

            {/* In-place Add Form */}
            {showAddProgram && (
              <form onSubmit={handleAddProgram} className="mt-4 p-4 border border-red-100 bg-red-50/30 rounded-xl space-y-3">
                <p className="text-xs font-bold text-gray-800">Tambah Program Kerja Baru</p>
                <input
                  type="text"
                  placeholder="Nama program kerja..."
                  value={newProgramName}
                  onChange={(e) => setNewProgramName(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProgram(false);
                      setNewProgramName('');
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-sm"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Row 5: Riwayat Aktivitas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
              Riwayat Aktivitas
            </h3>

            {/* Vertical timeline */}
            <div className="relative pl-6 space-y-4">
              {/* Vertical line connector */}
              <div className="absolute left-[3.5px] top-2 bottom-2 w-0.5 bg-gray-200" />

              {activeGroup.riwayat.map((riw, idx) => (
                <div key={idx} className="relative flex flex-col items-start text-xs">
                  {/* Circle Indicator */}
                  <span className={`absolute left-[-26px] top-[3px] w-2.5 h-2.5 rounded-sm border-2 border-white shadow-sm
                    ${riw.isImportant ? 'bg-red-600 ring-2 ring-red-100' : 'bg-gray-300'}`}
                  />
                  <span className="text-[10px] text-gray-400 font-bold leading-none">{riw.date}</span>
                  <span className="text-gray-700 font-semibold mt-1 leading-normal">{riw.event}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ==================== EDIT DPL MODAL ==================== */}
      {showEditDPLModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Ganti DPL Kelompok</h3>
            <p className="text-xs text-gray-500 mb-4">Tugaskan dosen baru untuk membimbing {activeGroup.nama}</p>

            <form onSubmit={handleUpdateDPL} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap & Gelar DPL</label>
                <input
                  type="text"
                  value={tempDPLName}
                  onChange={(e) => setTempDPLName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 text-sm pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditDPLModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT KELOMPOK MODAL ==================== */}
      {showEditKelompokModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Edit Informasi Kelompok</h3>
            <p className="text-xs text-gray-500 mb-4">Ubah detail penempatan wilayah and lokasi kelompok</p>

            <form onSubmit={handleUpdateKelompok} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Desa</label>
                <input
                  type="text"
                  value={tempDesa}
                  onChange={(e) => setTempDesa(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={tempKecamatan}
                  onChange={(e) => setTempKecamatan(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 text-sm pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditKelompokModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

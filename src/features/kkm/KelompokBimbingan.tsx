import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  BookOpen,
} from "lucide-react";

interface AnggotaItem {
  nim: string;
  nama: string;
  prodi: string;
  peran?: string;
}

interface ProgramKerjaItem {
  id: number;
  nama: string;
  status: "Selesai" | "Berjalan" | "Direncanakan";
}

interface KelompokItem {
  id: number;
  nama: string;
  lokasi: string;
  kecamatan?: string;
  anggotaCount: number;
  programAktifCount: number;
  progress: number;
  status: "Aktif" | "Perlu Monitoring" | "Selesai";
  daftarAnggota?: AnggotaItem[];
  programKerja?: ProgramKerjaItem[];
}

const KELOMPOK_LIST: KelompokItem[] = [
  {
    id: 1,
    nama: "Kelompok 01",
    lokasi: "Astanajapura",
    kecamatan: "Kec. Astanajapura, Kab. Cirebon",
    anggotaCount: 10,
    programAktifCount: 3,
    progress: 80,
    status: "Aktif",
    daftarAnggota: [
      { nim: "202301001", nama: "Ahmad Rizki", prodi: "Teknik Informatika", peran: "Ketua Kelompok" },
      { nim: "202301002", nama: "Siti Nurhaliza", prodi: "Farmasi", peran: "Sekretaris" },
      { nim: "202301003", nama: "Budi Santoso", prodi: "Hukum", peran: "Bendahara" },
      { nim: "202301004", nama: "Dewi Lestari", prodi: "PGSD", peran: "Anggota" },
      { nim: "202301005", nama: "Fajar Nugraha", prodi: "Manajemen", peran: "Anggota" },
    ],
    programKerja: [
      { id: 1, nama: "Pemberdayaan UMKM Digital Desa", status: "Berjalan" },
      { id: 2, nama: "Penyuluhan Sanitasi Lingkungan Sehat", status: "Berjalan" },
      { id: 3, nama: "Bimbingan Belajar Gratis untuk Anak SD", status: "Berjalan" },
    ],
  },
  {
    id: 2,
    nama: "Kelompok 02",
    lokasi: "Palimanan",
    kecamatan: "Kec. Palimanan, Kab. Cirebon",
    anggotaCount: 10,
    programAktifCount: 2,
    progress: 55,
    status: "Aktif",
    daftarAnggota: [
      { nim: "202302001", nama: "Rian Hidayat", prodi: "Teknik Sipil", peran: "Ketua Kelompok" },
      { nim: "202302002", nama: "Nadia Putri", prodi: "Akuntansi", peran: "Sekretaris" },
      { nim: "202302003", nama: "Dimas Pratama", prodi: "Hukum", peran: "Bendahara" },
      { nim: "202302004", nama: "Intan Permata", prodi: "PGSD", peran: "Anggota" },
      { nim: "202302005", nama: "Yusuf Maulana", prodi: "Farmasi", peran: "Anggota" },
    ],
    programKerja: [
      { id: 1, nama: "Pengelolaan Bank Sampah Desa", status: "Berjalan" },
      { id: 2, nama: "Pelatihan Literasi Digital Remaja", status: "Berjalan" },
    ],
  },
];

export default function KelompokBimbingan() {
  const navigate = useNavigate();

  const getProgressColor = (progress: number) => {
    // Sesuai desain: 80% hijau, 55% merah
    if (progress >= 75) return "bg-green-500";
    return "bg-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelompok Bimbingan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar kelompok KKM yang Anda bimbing sebagai DPL
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {KELOMPOK_LIST.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Nama & Status */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{item.nama}</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
                  {item.status}
                </span>
              </div>

              {/* Lokasi */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                <MapPin size={15} className="text-gray-400 shrink-0" />
                <span>{item.lokasi}</span>
              </div>

              {/* Anggota & Program */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                <div className="flex items-center gap-1.5">
                  <Users size={15} className="text-gray-400 shrink-0" />
                  <span>{item.anggotaCount} anggota</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={15} className="text-gray-400 shrink-0" />
                  <span>{item.programAktifCount} program aktif</span>
                </div>
              </div>

              {/* Progress KKM */}
              <div className="mt-6">
                <div className="flex justify-between items-center text-xs font-medium text-gray-600 mb-2">
                  <span>Progress KKM</span>
                  <span className="font-bold text-gray-800">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                      item.progress
                    )}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  navigate(`/dosen-dashboard/kkm/kelompok-bimbingan/${item.id}`)
                }
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer text-center shadow-sm"
              >
                Detail Kelompok
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

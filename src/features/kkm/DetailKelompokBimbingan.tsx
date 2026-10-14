import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Eye,
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";

interface Anggota {
  nim: string;
  nama: string;
  prodi: string;
  peran: "Ketua" | "Anggota";
  email?: string;
  noHp?: string;
}

interface ProgramKerja {
  id: number;
  nama: string;
  status: "Berjalan" | "Selesai" | "Direncanakan";
}

interface DetailKelompokData {
  id: number;
  nama: string;
  periode: string;
  desa: string;
  kecamatan: string;
  jumlahAnggota: string;
  programKerjaAktif: string;
  progress: number;
  tahapan: {
    pembekalan: boolean;
    logbookAktif: boolean;
    programKerja: boolean;
    laporanAkhir: boolean;
  };
  daftarAnggota: Anggota[];
  programKerja: ProgramKerja[];
}

const DATA_KELOMPOK: Record<string, DetailKelompokData> = {
  "1": {
    id: 1,
    nama: "Kelompok 01",
    periode: "Periode KKM Reguler 2026",
    desa: "Astanajapura",
    kecamatan: "Astanajapura",
    jumlahAnggota: "10 Mahasiswa",
    programKerjaAktif: "3 program",
    progress: 80,
    tahapan: {
      pembekalan: true,
      logbookAktif: true,
      programKerja: true, // Sedang aktif berjalan (indikator merah)
      laporanAkhir: false,
    },
    daftarAnggota: [
      {
        nama: "Andi Pratama",
        nim: "210411001",
        prodi: "Teknik Informatika",
        peran: "Ketua",
        email: "andi.pratama@mhs.umc.ac.id",
        noHp: "0812-3456-7890",
      },
      {
        nama: "Fitri Handayani",
        nim: "210481010",
        prodi: "Pend. Agama Islam",
        peran: "Anggota",
        email: "fitri.handayani@mhs.umc.ac.id",
        noHp: "0812-3456-7891",
      },
      {
        nama: "Budi Santoso",
        nim: "210421003",
        prodi: "Farmasi",
        peran: "Anggota",
        email: "budi.santoso@mhs.umc.ac.id",
        noHp: "0812-3456-7892",
      },
      {
        nama: "Dewi Anggraini",
        nim: "210431004",
        prodi: "Hukum",
        peran: "Anggota",
        email: "dewi.anggraini@mhs.umc.ac.id",
        noHp: "0812-3456-7893",
      },
      {
        nama: "Hendra Kusuma",
        nim: "210451009",
        prodi: "Manajemen",
        peran: "Anggota",
        email: "hendra.kusuma@mhs.umc.ac.id",
        noHp: "0812-3456-7894",
      },
    ],
    programKerja: [
      { id: 1, nama: "Edukasi Digital UMKM", status: "Berjalan" },
      { id: 2, nama: "Penyuluhan Kesehatan", status: "Selesai" },
      { id: 3, nama: "Pelatihan Administrasi Desa", status: "Berjalan" },
    ],
  },
  "2": {
    id: 2,
    nama: "Kelompok 02",
    periode: "Periode KKM Reguler 2026",
    desa: "Palimanan",
    kecamatan: "Palimanan",
    jumlahAnggota: "10 Mahasiswa",
    programKerjaAktif: "2 program",
    progress: 55,
    tahapan: {
      pembekalan: true,
      logbookAktif: true,
      programKerja: true,
      laporanAkhir: false,
    },
    daftarAnggota: [
      {
        nama: "Rian Hidayat",
        nim: "210411002",
        prodi: "Teknik Sipil",
        peran: "Ketua",
        email: "rian.hidayat@mhs.umc.ac.id",
        noHp: "0813-2233-4455",
      },
      {
        nama: "Nadia Putri",
        nim: "210481012",
        prodi: "Akuntansi",
        peran: "Anggota",
        email: "nadia.putri@mhs.umc.ac.id",
        noHp: "0813-2233-4456",
      },
      {
        nama: "Dimas Pratama",
        nim: "210421005",
        prodi: "Hukum",
        peran: "Anggota",
        email: "dimas.pratama@mhs.umc.ac.id",
        noHp: "0813-2233-4457",
      },
      {
        nama: "Intan Permata",
        nim: "210431008",
        prodi: "PGSD",
        peran: "Anggota",
        email: "intan.permata@mhs.umc.ac.id",
        noHp: "0813-2233-4458",
      },
      {
        nama: "Yusuf Maulana",
        nim: "210451011",
        prodi: "Farmasi",
        peran: "Anggota",
        email: "yusuf.maulana@mhs.umc.ac.id",
        noHp: "0813-2233-4459",
      },
    ],
    programKerja: [
      { id: 1, nama: "Pengelolaan Bank Sampah Desa", status: "Berjalan" },
      { id: 2, nama: "Pelatihan Literasi Digital Remaja", status: "Berjalan" },
    ],
  },
};

export default function DetailKelompokBimbingan() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Gunakan data berdasarkan id atau default ke kelompok 01
  const kelompok = (id && DATA_KELOMPOK[id]) || DATA_KELOMPOK["1"];

  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null);

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    return "bg-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => navigate("/dosen-dashboard/kkm/kelompok-bimbingan")}
          className="mt-1 p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          title="Kembali ke Kelompok Bimbingan"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{kelompok.nama}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelompok Bimbingan DPL — {kelompok.periode}
          </p>
        </div>
      </div>

      {/* Grid Utama: Kolom Kiri & Kolom Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ==================== KOLOM KIRI ==================== */}
        <div className="space-y-6">
          {/* Card: Informasi Kelompok */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Informasi Kelompok
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">Desa</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {kelompok.desa}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">Kecamatan</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {kelompok.kecamatan}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">Jumlah Anggota</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {kelompok.jumlahAnggota}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Program Kerja Aktif
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {kelompok.programKerjaAktif}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-400 font-medium">Progress</span>
                <span className="text-gray-900 font-bold">{kelompok.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                    kelompok.progress
                  )}`}
                  style={{ width: `${kelompok.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card: Tahapan KKM */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5">Tahapan KKM</h2>

            <div className="space-y-4">
              {/* Step 1: Pembekalan */}
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-sm font-medium text-green-600">
                  Pembekalan
                </span>
              </div>

              {/* Step 2: Logbook Aktif */}
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-sm font-medium text-green-600">
                  Logbook Aktif
                </span>
              </div>

              {/* Step 3: Program Kerja (Aktif / In-Progress) */}
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <span className="text-sm font-semibold text-red-600">
                  Program Kerja
                </span>
              </div>

              {/* Step 4: Laporan Akhir (Belum) */}
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0" />
                <span className="text-sm font-medium text-gray-400">
                  Laporan Akhir
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== KOLOM KANAN ==================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Daftar Anggota */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Daftar Anggota</h2>
              <span className="text-xs text-gray-400 font-medium">
                {kelompok.daftarAnggota.length} mahasiswa
              </span>
            </div>

            {/* Tabel Anggota */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold tracking-wider">
                    <th className="pb-3 font-semibold uppercase">NAMA</th>
                    <th className="pb-3 font-semibold uppercase">NIM</th>
                    <th className="pb-3 font-semibold uppercase">PROGRAM STUDI</th>
                    <th className="pb-3 font-semibold uppercase">PERAN</th>
                    <th className="pb-3 font-semibold uppercase text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {kelompok.daftarAnggota.map((mhs, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 font-medium text-gray-900">
                        {mhs.nama}
                      </td>
                      <td className="py-3.5 text-gray-500 font-mono">
                        {mhs.nim}
                      </td>
                      <td className="py-3.5 text-gray-600">
                        {mhs.prodi}
                      </td>
                      <td className="py-3.5">
                        {mhs.peran === "Ketua" ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-600 inline-block">
                            Ketua
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 inline-block">
                            Anggota
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedAnggota(mhs)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100 cursor-pointer inline-flex items-center justify-center"
                          title="Lihat Detail Anggota"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Program Kerja */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Program Kerja</h2>

            <div className="space-y-3">
              {kelompok.programKerja.map((prog, index) => (
                <div
                  key={prog.id}
                  className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 w-4">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {prog.nama}
                    </span>
                  </div>

                  {prog.status === "Selesai" ? (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
                      Selesai
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                      Berjalan
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail Anggota (Aksi Eye Icon) */}
      {selectedAnggota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User size={18} className="text-red-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Profil Mahasiswa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnggota(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    {selectedAnggota.nama}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    NIM: {selectedAnggota.nim}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedAnggota.peran === "Ketua"
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {selectedAnggota.peran}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                  <GraduationCap size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Program Studi</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {selectedAnggota.prodi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Email Kampus</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {selectedAnggota.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Nomor WhatsApp</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {selectedAnggota.noHp || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAnggota(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

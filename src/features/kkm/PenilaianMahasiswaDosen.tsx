import { useState } from "react";
import { Save } from "lucide-react";

// ==================== TYPES ====================

interface NilaiRow {
  id: number;
  nama: string;
  nim: string;
  kelompok: string;
  kehadiran: number;
  keaktifan: number;
  logbook: number;
  progKerja: number;
  laporan: number;
  sikap: number;
  nilaiAkhir: number;
  grade: string;
  status: "tersimpan" | "belum";
}

// ==================== DATA ====================

const NILAI_DATA: NilaiRow[] = [
  {
    id: 1,
    nama: "Andi Pratama",
    nim: "210411001",
    kelompok: "Kelompok 01",
    kehadiran: 90,
    keaktifan: 85,
    logbook: 88,
    progKerja: 90,
    laporan: 85,
    sikap: 92,
    nilaiAkhir: 88,
    grade: "A",
    status: "belum",
  },
  {
    id: 2,
    nama: "Fitri Handayani",
    nim: "210481010",
    kelompok: "Kelompok 01",
    kehadiran: 95,
    keaktifan: 90,
    logbook: 85,
    progKerja: 88,
    laporan: 90,
    sikap: 95,
    nilaiAkhir: 90,
    grade: "A",
    status: "belum",
  },
  {
    id: 3,
    nama: "Budi Santoso",
    nim: "210421003",
    kelompok: "Kelompok 01",
    kehadiran: 85,
    keaktifan: 80,
    logbook: 82,
    progKerja: 85,
    laporan: 80,
    sikap: 88,
    nilaiAkhir: 83,
    grade: "B",
    status: "tersimpan",
  },
  {
    id: 4,
    nama: "Nisa Aulia",
    nim: "210451006",
    kelompok: "Kelompok 02",
    kehadiran: 92,
    keaktifan: 88,
    logbook: 90,
    progKerja: 85,
    laporan: 88,
    sikap: 90,
    nilaiAkhir: 89,
    grade: "A",
    status: "belum",
  },
  {
    id: 5,
    nama: "Oman Supriatna",
    nim: "210461020",
    kelompok: "Kelompok 02",
    kehadiran: 80,
    keaktifan: 75,
    logbook: 72,
    progKerja: 78,
    laporan: 75,
    sikap: 82,
    nilaiAkhir: 76,
    grade: "B",
    status: "belum",
  },
];

// ==================== MAIN COMPONENT ====================

export default function PenilaianMahasiswaDosen() {
  const [filter, setFilter] = useState<"semua" | "Kelompok 01" | "Kelompok 02">("semua");

  const filtered =
    filter === "semua"
      ? NILAI_DATA
      : NILAI_DATA.filter((r) => r.kelompok === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penilaian Mahasiswa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Input nilai akhir KKM mahasiswa bimbingan
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Save size={16} />
          Simpan Semua Nilai
        </button>
      </div>

      {/* Bobot */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Bobot Penilaian</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
          <span>Kehadiran: 15%</span>
          <span>Keaktifan: 15%</span>
          <span>Logbook: 20%</span>
          <span>Prog. Kerja: 20%</span>
          <span>Laporan: 20%</span>
          <span>Sikap: 10%</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(["semua", "Kelompok 01", "Kelompok 02"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === k
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {k === "semua" ? "Semua" : k}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  NAMA
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  KELOMPOK
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  KEHADIRAN
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  KEAKTIFAN
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  LOGBOOK
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  PROG. KERJA
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  LAPORAN
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  SIKAP
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  NILAI AKHIR
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  GRADE
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-800">{row.nama}</p>
                    <p className="text-xs text-gray-400">{row.nim}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{row.kelompok}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{row.kehadiran}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{row.keaktifan}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{row.logbook}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{row.progKerja}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{row.laporan}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{row.sikap}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-800">{row.nilaiAkhir}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{row.grade}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.status === "tersimpan"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {row.status === "tersimpan" ? "Tersimpan" : "Belum disimpan"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

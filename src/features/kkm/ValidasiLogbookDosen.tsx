import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Check, RotateCcw, Clock, CheckCircle2, BookOpen } from "lucide-react";

// ==================== TYPES ====================

export type StatusLogbook = "pending" | "approved" | "revisi";

export interface LogbookValidasi {
  id: number;
  mahasiswa: string;
  kelompok: string;
  tanggal: string;
  aktivitas: string;
  durasi: string;
  status: StatusLogbook;
}

// ==================== DATA ====================

export const LOGBOOK_DATA: LogbookValidasi[] = [
  {
    id: 1,
    mahasiswa: "Andi Pratama",
    kelompok: "Kelompok 01",
    tanggal: "05 Feb 2026",
    aktivitas: "Pelatihan Digital Marketing",
    durasi: "4 jam",
    status: "pending",
  },
  {
    id: 2,
    mahasiswa: "Fitri Handayani",
    kelompok: "Kelompok 01",
    tanggal: "05 Feb 2026",
    aktivitas: "Penyuluhan Kesehatan Ibu",
    durasi: "3 jam",
    status: "pending",
  },
  {
    id: 3,
    mahasiswa: "Nisa Aulia",
    kelompok: "Kelompok 02",
    tanggal: "04 Feb 2026",
    aktivitas: "Digitalisasi Administrasi Desa",
    durasi: "5 jam",
    status: "approved",
  },
  {
    id: 4,
    mahasiswa: "Oman Supriatna",
    kelompok: "Kelompok 02",
    tanggal: "03 Feb 2026",
    aktivitas: "Pelatihan Pembukuan UMKM",
    durasi: "3 jam",
    status: "revisi",
  },
  {
    id: 5,
    mahasiswa: "Budi Santoso",
    kelompok: "Kelompok 01",
    tanggal: "06 Feb 2026",
    aktivitas: "Penyuluhan Penggunaan Obat",
    durasi: "2 jam",
    status: "pending",
  },
];

// ==================== CONFIG ====================

const statusConfig: Record<
  StatusLogbook,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  revisi: {
    label: "Revisi",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
  },
};

// ==================== MAIN COMPONENT ====================

export default function ValidasiLogbookDosen() {
  const navigate = useNavigate();
  const [data, setData] = useState<LogbookValidasi[]>(LOGBOOK_DATA);
  const [activeTab, setActiveTab] = useState<"semua" | StatusLogbook>("semua");

  const counts: Record<StatusLogbook, number> = {
    pending: data.filter((d) => d.status === "pending").length,
    approved: data.filter((d) => d.status === "approved").length,
    revisi: data.filter((d) => d.status === "revisi").length,
  };

  const filteredData =
    activeTab === "semua" ? data : data.filter((d) => d.status === activeTab);

  const tabs: { key: "semua" | StatusLogbook; label: string; count: number }[] = [
    { key: "semua", label: "Semua", count: data.length },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "revisi", label: "Revisi", count: counts.revisi },
  ];

  const handleApprove = (id: number) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: "approved" } : row
      )
    );
  };

  const handleRevisi = (id: number) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: "revisi" } : row
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validasi Logbook</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review dan validasi logbook kegiatan mahasiswa KKM
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Menunggu Validasi</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{counts.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Approved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{counts.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Revisi</span>
            <RotateCcw size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{counts.revisi}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeTab === tab.key
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/40 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">MAHASISWA</th>
                <th className="py-4 px-6 font-semibold">KELOMPOK</th>
                <th className="py-4 px-6 font-semibold">TANGGAL</th>
                <th className="py-4 px-6 font-semibold">AKTIVITAS</th>
                <th className="py-4 px-6 font-semibold">DURASI</th>
                <th className="py-4 px-6 font-semibold">STATUS</th>
                <th className="py-4 px-6 font-semibold text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredData.map((row) => {
                const cfg = statusConfig[row.status];
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-5 px-6 font-bold text-gray-900 whitespace-nowrap">
                      {row.mahasiswa}
                    </td>
                    <td className="py-5 px-6 text-gray-600 whitespace-nowrap">
                      {row.kelompok}
                    </td>
                    <td className="py-5 px-6 text-gray-600 whitespace-nowrap">
                      {row.tanggal}
                    </td>
                    <td className="py-5 px-6 text-gray-700 whitespace-nowrap">
                      {row.aktivitas}
                    </td>
                    <td className="py-5 px-6 text-gray-600 whitespace-nowrap">
                      {row.durasi}
                    </td>
                    <td className="py-5 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`}
                        />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dosen-dashboard/kkm/validasi-logbook/${row.id}`)
                          }
                          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer inline-flex items-center justify-center"
                          title="Lihat Detail"
                        >
                          <Eye size={17} />
                        </button>
                        {row.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(row.id)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50 cursor-pointer inline-flex items-center justify-center"
                              title="Setujui"
                            >
                              <Check size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevisi(row.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer inline-flex items-center justify-center"
                              title="Minta Revisi"
                            >
                              <RotateCcw size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Clock,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";

import { LOGBOOK_DATA, type LogbookValidasi, type StatusLogbook } from "@/features/kkm/ValidasiLogbookDosen";

// ==================== DETAIL INFO ====================

const DETAIL_INFO: Record<number, { deskripsi: string; fotoCount: number }> = {
  1: {
    deskripsi:
      "Mengadakan sesi pelatihan digital marketing untuk pelaku UMKM di Desa Astanajapura. Dihadiri 25 peserta. Materi meliputi penggunaan media sosial dan marketplace.",
    fotoCount: 2,
  },
  2: {
    deskripsi:
      "Melakukan penyuluhan kesehatan ibu dan anak di desa binaan. Materi meliputi gizi, imunisasi, dan pemeriksaan dasar.",
    fotoCount: 2,
  },
  3: {
    deskripsi:
      "Digitalisasi administrasi desa: penginputan data penduduk, surat-menyurat, dan arsip digital.",
    fotoCount: 2,
  },
  4: {
    deskripsi:
      "Pelatihan pembukuan sederhana untuk UMKM, meliputi pencatatan pemasukan/pengeluaran dan laporan keuangan bulanan.",
    fotoCount: 2,
  },
  5: {
    deskripsi:
      "Penyuluhan penggunaan obat tradisional yang aman dan bermanfaat bagi masyarakat desa.",
    fotoCount: 2,
  },
};

const statusConfig: Record<
  StatusLogbook,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  revisi: { label: "Revisi", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

// ==================== MAIN COMPONENT ====================

export default function DetailValidasiLogbookDosen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const row: LogbookValidasi =
    LOGBOOK_DATA.find((d) => d.id === Number(id)) ?? LOGBOOK_DATA[0];
  const info = DETAIL_INFO[row.id] ?? DETAIL_INFO[1];

  const [status, setStatus] = useState<StatusLogbook>(row.status);
  const [catatan, setCatatan] = useState("");

  const cfg = statusConfig[status];

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dosen-dashboard/kkm/validasi-logbook")}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Logbook</h1>
            <p className="text-sm text-gray-500 mt-1">
              {row.mahasiswa} - {row.kelompok}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStatus("revisi");
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            Minta Revisi
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("approved");
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Check size={16} />
            Setujui
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Informasi Logbook */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Informasi Logbook
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Tanggal
                </p>
                <p className="text-sm text-gray-800">{row.tanggal}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Durasi
                </p>
                <p className="text-sm text-gray-800">{row.durasi}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Aktivitas
                </p>
                <p className="text-sm text-gray-800">{row.aktivitas}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                  {cfg.label}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Deskripsi Kegiatan
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{info.deskripsi}</p>
            </div>
          </div>

          {/* Catatan DPL */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Catatan DPL
            </h2>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tulis catatan untuk mahasiswa..."
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Foto Dokumentasi
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: info.fotoCount }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400"
              >
                <ImageIcon size={28} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

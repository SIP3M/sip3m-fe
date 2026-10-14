import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Flag, CheckCircle2 } from "lucide-react";

type StatusMonitoring = "Aktif" | "Perlu Monitoring" | "Tidak Aktif";

interface TimelineItem {
  id: number;
  date: string;
  title: string;
  isLatest?: boolean;
}

interface MonitoringDetailData {
  id: number;
  kelompok: string;
  desa: string;
  status: StatusMonitoring;
  progress: number;
  barColor: "green" | "red" | "yellow";
  logbookCount: number;
  timeline: TimelineItem[];
  catatanDefault?: string;
}

const DETAIL_MONITORING_DATA: Record<string, MonitoringDetailData> = {
  "1": {
    id: 1,
    kelompok: "Kelompok 01",
    desa: "Astanajapura",
    status: "Aktif",
    progress: 80,
    barColor: "green",
    logbookCount: 15,
    catatanDefault: "",
    timeline: [
      {
        id: 1,
        date: "10 Jan 2026",
        title: "Pembekalan selesai dilaksanakan",
      },
      {
        id: 2,
        date: "15 Jan 2026",
        title: "Program kerja pertama dimulai",
      },
      {
        id: 3,
        date: "20 Jan 2026",
        title: "Logbook pertama dikirim oleh kelompok",
      },
      {
        id: 4,
        date: "25 Jan 2026",
        title: "Monitoring lapangan oleh DPL",
      },
      {
        id: 5,
        date: "01 Feb 2026",
        title: "Program kerja kedua berjalan",
        isLatest: true,
      },
    ],
  },
  "2": {
    id: 2,
    kelompok: "Kelompok 02",
    desa: "Palimanan",
    status: "Perlu Monitoring",
    progress: 50,
    barColor: "red",
    logbookCount: 8,
    catatanDefault: "Perlu konfirmasi jadwal monitoring lapangan dan kelengkapan logbook anggota.",
    timeline: [
      {
        id: 1,
        date: "10 Jan 2026",
        title: "Pembekalan selesai dilaksanakan",
      },
      {
        id: 2,
        date: "18 Jan 2026",
        title: "Pemberangkatan kelompok ke lokasi desa",
      },
      {
        id: 3,
        date: "24 Jan 2026",
        title: "Logbook minggu pertama dikirimkan",
      },
      {
        id: 4,
        date: "30 Jan 2026",
        title: "Peringatan logbook belum lengkap",
        isLatest: true,
      },
    ],
  },
  "3": {
    id: 3,
    kelompok: "Kelompok 03",
    desa: "Gempol",
    status: "Tidak Aktif",
    progress: 25,
    barColor: "yellow",
    logbookCount: 3,
    catatanDefault: "Kelompok belum aktif mengirimkan logbook harian dalam 10 hari terakhir.",
    timeline: [
      {
        id: 1,
        date: "10 Jan 2026",
        title: "Pembekalan selesai dilaksanakan",
      },
      {
        id: 2,
        date: "17 Jan 2026",
        title: "Penerimaan di kantor desa",
      },
      {
        id: 3,
        date: "22 Jan 2026",
        title: "Aktivitas terhenti / minim pelaporan",
        isLatest: true,
      },
    ],
  },
  "4": {
    id: 4,
    kelompok: "Kelompok 04",
    desa: "Ciwaringin",
    status: "Aktif",
    progress: 95,
    barColor: "green",
    logbookCount: 20,
    catatanDefault: "Kinerja kelompok sangat baik dan seluruh program kerja selesai tepat waktu.",
    timeline: [
      {
        id: 1,
        date: "10 Jan 2026",
        title: "Pembekalan selesai dilaksanakan",
      },
      {
        id: 2,
        date: "15 Jan 2026",
        title: "Sosialisasi program kerja kepada warga desa",
      },
      {
        id: 3,
        date: "22 Jan 2026",
        title: "Pelaksanaan program utama desa",
      },
      {
        id: 4,
        date: "29 Jan 2026",
        title: "Monitoring dan evaluasi bersama aparat desa",
      },
      {
        id: 5,
        date: "05 Feb 2026",
        title: "Penyusunan draft laporan akhir KKM",
        isLatest: true,
      },
    ],
  },
};

export default function DetailMonitoringKKMDosen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const data = (id && DETAIL_MONITORING_DATA[id]) || DETAIL_MONITORING_DATA["1"];

  const [catatan, setCatatan] = useState(data.catatanDefault || "");
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSaveCatatan = () => {
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 3000);
  };

  const getBarColorClass = (color: "green" | "red" | "yellow") => {
    switch (color) {
      case "green":
        return "bg-emerald-500";
      case "red":
        return "bg-red-600";
      case "yellow":
        return "bg-amber-500";
      default:
        return "bg-emerald-500";
    }
  };

  const renderStatusBadge = (status: StatusMonitoring) => {
    switch (status) {
      case "Aktif":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Aktif
          </span>
        );
      case "Perlu Monitoring":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-amber-100/80 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Perlu Monitoring
          </span>
        );
      case "Tidak Aktif":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            Tidak Aktif
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => navigate("/dosen-dashboard/kkm/monitoring")}
          className="mt-1 p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          title="Kembali ke Monitoring KKM"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{data.kelompok}</h1>
            {renderStatusBadge(data.status)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Detail monitoring — {data.desa}
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ==================== KOLOM KIRI: TIMELINE AKTIVITAS ==================== */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-6">
            Timeline Aktivitas
          </h2>

          <div className="relative pl-6">
            {/* Garis Vertikal Timeline */}
            <div className="absolute left-[7px] top-2 bottom-4 w-px bg-gray-200" />

            {/* List Item Timeline */}
            <div className="space-y-6">
              {data.timeline.map((item) => (
                <div key={item.id} className="relative flex items-start gap-3">
                  {/* Titik / Dot pada Garis */}
                  <div
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 flex items-center justify-center shrink-0 ${
                      item.isLatest
                        ? "border-red-600 text-red-600"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isLatest ? "bg-red-600" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  {/* Isi Konten */}
                  <div className="pt-0.5">
                    <p className="text-xs text-gray-400 font-medium">
                      {item.date}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 leading-snug">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== KOLOM KANAN: PROGRESS & CATATAN ==================== */}
        <div className="space-y-6">
          {/* Card: Progress & Logbook */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Progress &amp; Logbook
            </h2>

            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-400 font-medium">Progress KKM</span>
                <span className="text-base font-bold text-gray-900">
                  {data.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColorClass(
                    data.barColor
                  )}`}
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <BookOpen size={16} className="text-gray-400 shrink-0" />
              <span>
                <strong className="font-bold text-gray-900">
                  {data.logbookCount}
                </strong>{" "}
                logbook telah dikumpulkan
              </span>
            </div>
          </div>

          {/* Card: Catatan Monitoring DPL */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Flag size={16} className="text-gray-700 shrink-0" />
              <h2 className="text-base font-bold text-gray-900">
                Catatan Monitoring DPL
              </h2>
            </div>

            <div className="space-y-4">
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tulis catatan monitoring..."
                rows={5}
                className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
              />

              {showSavedFeedback && (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-100 animate-in fade-in">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Catatan monitoring berhasil disimpan!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCatatan}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer text-center shadow-sm"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

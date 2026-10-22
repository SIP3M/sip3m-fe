import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Loader2, AlertTriangle, Inbox } from "lucide-react";
import { getKkmMonitoring } from "./kkmMonitoring.api";
import type { KkmMonitoringRow } from "./kkmMonitoring.types";

/** Batas halaman BE per panggilan (limit 12) — loop sampai semua keambil. */
const MAX_PAGES = 10;

/** Chip status mengikuti `status_label` dari BE (Aktif / Perlu Perhatian / dst). */
const STATUS_CHIP: Record<string, string> = {
  AKTIF: "bg-emerald-50 text-emerald-600",
  PERLU_PERHATIAN: "bg-amber-50 text-amber-600",
  BERMASALAH: "bg-red-50 text-red-600",
  SELESAI: "bg-sky-50 text-sky-600",
};

const getProgressColor = (progress: number) => {
  // Sesuai desain: >= 75% hijau, di bawahnya merah
  if (progress >= 75) return "bg-green-500";
  return "bg-red-600";
};

export default function KelompokBimbingan() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<KkmMonitoringRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const collected: KkmMonitoringRow[] = [];
        for (let page = 1; page <= MAX_PAGES; page += 1) {
          // Tanpa param dpl_id → BE memaksa dpl_id = user yang login (role DOSEN),
          // sehingga hanya kelompok bimbingan sendiri yang dikembalikan.
          const res = await getKkmMonitoring({ page });
          collected.push(...res.data);
          if (res.data.length === 0 || collected.length >= res.meta.totalData) break;
        }
        if (!cancelled) setRows(collected);
      } catch (err) {
        if (cancelled) return;
        const message = (
          err as { response?: { data?: { message?: string } } }
        )?.response?.data?.message;
        setError(message || "Gagal memuat kelompok bimbingan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelompok Bimbingan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar kelompok KKM yang Anda bimbing sebagai DPL
        </p>
      </div>

      {/* State: memuat */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <Loader2 size={18} className="animate-spin text-red-600" />
          Memuat kelompok bimbingan...
        </div>
      )}

      {/* State: gagal */}
      {!loading && error && (
        <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-6">
          <AlertTriangle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* State: kosong */}
      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-10 shadow-sm">
          <Inbox size={26} className="text-gray-300" />
          Belum ada kelompok yang Anda bimbing.
        </div>
      )}

      {/* Grid Cards */}
      {!loading && !error && rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rows.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Nama & Status */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{item.nama}</h3>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      STATUS_CHIP[item.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status_label}
                  </span>
                </div>

                {/* Lokasi */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                  <MapPin size={15} className="text-gray-400 shrink-0" />
                  <span>{item.desa}</span>
                </div>

                {/* Anggota */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Users size={15} className="text-gray-400 shrink-0" />
                    <span>{item.jumlah_anggota} anggota</span>
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
                        item.progress,
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
      )}
    </div>
  );
}

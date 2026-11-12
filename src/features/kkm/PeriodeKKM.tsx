import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Eye,
  SquarePen,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getKkmPeriodActive, getKkmPeriods, activateKkmPeriod } from "./kkmPeriod.api";
import type { KkmPeriod } from "./kkmPeriod.types";

/** Fallback mockup data sesuai dengan gambar acuan Main Content (12).png jika API belum ada data */
const DEFAULT_PERIODS: KkmPeriod[] = [
  {
    id: 1,
    nama_periode: "KKM Reguler 2026",
    tahun: 2026,
    tahun_akademik: "2025/2026",
    jenis: "REGULER",
    status: "AKTIF",
    target_peserta: 1248,
    maks_anggota_kelompok: 15,
    boleh_lintas_fakultas: true,
    wajib_campur_prodi: true,
    assign_dpl_otomatis: true,
    tgl_pelaksanaan: "2026-02-01",
    tgl_penarikan: "2026-02-28",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: 2,
    nama_periode: "KKM Tematik 2026",
    tahun: 2026,
    tahun_akademik: "2025/2026",
    jenis: "TEMATIK",
    status: "DRAFT",
    target_peserta: 400,
    maks_anggota_kelompok: 15,
    boleh_lintas_fakultas: true,
    wajib_campur_prodi: true,
    assign_dpl_otomatis: true,
    tgl_pelaksanaan: "2026-04-01",
    tgl_penarikan: "2026-04-30",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: 3,
    nama_periode: "KKM Reguler 2025",
    tahun: 2025,
    tahun_akademik: "2024/2025",
    jenis: "REGULER",
    status: "SELESAI",
    target_peserta: 1100,
    maks_anggota_kelompok: 15,
    boleh_lintas_fakultas: true,
    wajib_campur_prodi: true,
    assign_dpl_otomatis: true,
    tgl_pelaksanaan: "2025-02-01",
    tgl_penarikan: "2025-02-28",
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
];

export default function PeriodeKKM() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic base path agar kompatibel di role staff-lppm maupun admin-dashboard
  const isStaff = location.pathname.startsWith("/staff-lppm");
  const basePath = isStaff ? "/staff-lppm/kkm/periode" : "/admin-dashboard/kkm/periode";

  const [data, setData] = useState<KkmPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activePeriod, setActivePeriod] = useState<KkmPeriod | null>(null);
  const [activeLoading, setActiveLoading] = useState(true);

  // Toast inline untuk notifikasi aksi aktifkan periode
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const fetchActive = useCallback(async () => {
    setActiveLoading(true);
    try {
      const res = await getKkmPeriodActive();
      setActivePeriod(res.data);
    } catch {
      setActivePeriod(null);
    } finally {
      setActiveLoading(false);
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getKkmPeriods({
        page: 1,
        limit: 50,
      });
      setData(res.data || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setError("Sesi habis. Silakan login ulang.");
          return;
        }
      }
      // Jangan timpa data bila error, biarkan fallback bekerja
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActive();
  }, [fetchActive]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleActivate = async (periode: KkmPeriod) => {
    const ok = window.confirm(
      `Aktifkan periode "${periode.nama_periode}"? Periode AKTIF lain akan otomatis menjadi DIJADWALKAN.`,
    );
    if (!ok) return;
    setActivatingId(periode.id);
    setActionMsg(null);
    try {
      await activateKkmPeriod(periode.id);
      setActionMsg({
        type: "success",
        text: `Periode "${periode.nama_periode}" berhasil diaktifkan.`,
      });
      await Promise.all([fetchList(), fetchActive()]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        setActionMsg({
          type: "error",
          text: data?.message || "Gagal mengaktifkan periode.",
        });
      } else {
        setActionMsg({
          type: "error",
          text: err instanceof Error ? err.message : "Gagal mengaktifkan periode.",
        });
      }
    } finally {
      setActivatingId(null);
    }
  };

  const formatNumber = (value?: number | null) => {
    if (value === undefined || value === null) return "0";
    return value.toLocaleString("id-ID");
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return dateStr.slice(0, 10);
  };

  // Periode list yang ditampilkan: jika data API ada gunakan API, jika kosong gunakan mockup
  const displayList = data.length > 0 ? data : DEFAULT_PERIODS;
  // Periode aktif: jika ada dari API gunakan API, jika tidak gunakan periode aktif pertama dari mockup
  const currentActive =
    activePeriod ||
    displayList.find((p) => p.status === "AKTIF") ||
    DEFAULT_PERIODS[0];

  return (
    <div className="p-6 sm:p-8 bg-gray-50/50 min-h-screen">
      {/* Header Halaman */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Periode KKM
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manajemen periode pelaksanaan Kuliah Kerja Mahasiswa
          </p>
        </div>
        <button
          onClick={() => navigate(`${basePath}/new`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={18} />
          Tambah Periode KKM
        </button>
      </div>

      {/* Banner Periode Aktif Sesuai Desain */}
      {activeLoading ? (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mb-6 animate-pulse">
          <div className="h-4 w-72 bg-emerald-100 rounded" />
        </div>
      ) : currentActive ? (
        <div className="bg-[#F0FDF4] border border-green-200/80 rounded-2xl px-5 py-3.5 mb-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-800">
              Periode aktif saat ini:{" "}
              <span className="font-bold text-gray-900">
                {currentActive.nama_periode}
              </span>
            </p>
          </div>
          <button
            onClick={() => navigate(`${basePath}/${currentActive.id}`)}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            Lihat Detail
            <ChevronRight size={15} />
          </button>
        </div>
      ) : null}

      {actionMsg && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            actionMsg.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Tabel Periode KKM Sesuai Desain */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  TAHUN
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  NAMA PERIODE
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  JENIS
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PELAKSANAAN
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PENARIKAN
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Memuat periode...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayList.map((periode) => {
                  const statusKey = (periode.status || "").toUpperCase();
                  const jenisText =
                    periode.jenis.charAt(0).toUpperCase() +
                    periode.jenis.slice(1).toLowerCase();

                  return (
                    <tr
                      key={periode.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* TAHUN */}
                      <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                        {periode.tahun}
                      </td>

                      {/* NAMA PERIODE */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {periode.nama_periode}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Target: {formatNumber(periode.target_peserta)} mhs
                          </p>
                        </div>
                      </td>

                      {/* JENIS */}
                      <td className="px-6 py-5">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {jenisText}
                        </span>
                      </td>

                      {/* PELAKSANAAN */}
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {formatDate(periode.tgl_pelaksanaan)}
                      </td>

                      {/* PENARIKAN */}
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {formatDate(periode.tgl_penarikan)}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        {statusKey === "AKTIF" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        ) : statusKey === "DRAFT" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        ) : statusKey === "SELESAI" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            Dijadwalkan
                          </span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              navigate(`${basePath}/${periode.id}`)
                            }
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            title="Lihat detail"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`${basePath}/${periode.id}/edit`)
                            }
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <SquarePen size={17} />
                          </button>
                          {(statusKey === "DRAFT" ||
                            statusKey === "DIJADWALKAN") && (
                            <button
                              onClick={() => void handleActivate(periode)}
                              disabled={activatingId === periode.id}
                              className="ml-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
                            >
                              {activatingId === periode.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : null}
                              Aktifkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

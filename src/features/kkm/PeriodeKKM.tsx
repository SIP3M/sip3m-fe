import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getKkmPeriodActive, getKkmPeriods, activateKkmPeriod } from "./kkmPeriod.api";
import type { KkmPeriod, KkmPeriodMeta } from "./kkmPeriod.types";

type StatusKey = "DRAFT" | "AKTIF" | "DIJADWALKAN" | "SELESAI";

function StatusBadge({ status }: { status: string }) {
  const key = status.toUpperCase() as StatusKey;
  const cfg: Record<StatusKey, { bg: string; text: string; dot: string }> = {
    AKTIF: { bg: "bg-green-50 border-green-200", text: "text-green-700", dot: "bg-green-500" },
    DRAFT: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" },
    DIJADWALKAN: { bg: "bg-sky-50 border-sky-200", text: "text-sky-700", dot: "bg-sky-500" },
    SELESAI: { bg: "bg-blue-50 border-blue-200", text: "text-blue-600", dot: "bg-blue-500" },
  };
  const c = cfg[key] ?? cfg.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {key === "DIJADWALKAN" ? "Dijadwalkan" : key === "AKTIF" ? "Aktif" : key === "DRAFT" ? "Draft" : "Selesai"}
    </span>
  );
}

function JenisBadge({ jenis }: { jenis: string }) {
  const normalized = jenis.toUpperCase();
  const isReguler = normalized === "REGULER";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isReguler ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
      {isReguler ? "Reguler" : "Tematik"}
    </span>
  );
}

export default function PeriodeKKM() {
  const navigate = useNavigate();

  const [data, setData] = useState<KkmPeriod[]>([]);
  const [meta, setMeta] = useState<KkmPeriodMeta>({ totalData: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activePeriod, setActivePeriod] = useState<KkmPeriod | null>(null);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeError, setActiveError] = useState<string | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [filterJenis, setFilterJenis] = useState<string>("semua");
  const [filterTahun, setFilterTahun] = useState<string>("");
  const [filterTahunAkademik, setFilterTahunAkademik] = useState<string>("");
  const [page, setPage] = useState(1);

  // Toast inline for activate
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchActive = useCallback(async () => {
    setActiveLoading(true);
    setActiveError(null);
    try {
      const res = await getKkmPeriodActive();
      setActivePeriod(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setActiveError("Sesi habis. Silakan login ulang.");
      } else {
        // Active endpoint may return null with 200, but if error we show fallback
        setActiveError(null);
        setActivePeriod(null);
      }
    } finally {
      setActiveLoading(false);
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getKkmPeriods({
        page,
        search: debouncedSearch || undefined,
        status: filterStatus !== "semua" ? filterStatus : undefined,
        jenis: filterJenis !== "semua" ? filterJenis : undefined,
        tahun: filterTahun || undefined,
        tahun_akademik: filterTahunAkademik || undefined,
        limit: 10,
      });
      setData(res.data || []);
      setMeta(res.meta || { totalData: (res.data || []).length, totalPages: 1, currentPage: page, limit: 10 });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setError("Sesi habis. Silakan login ulang.");
          // Optionally redirect after short delay
          setTimeout(() => navigate("/login"), 1200);
          return;
        }
        if (status === 403) {
          setError("Akses ditolak: hanya ADMIN_LPPM/STAFF_LPPM yang boleh melihat daftar.");
        } else {
          const msg = (err.response?.data as { message?: string })?.message || err.message;
          setError(msg || "Gagal memuat periode KKM.");
        }
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat periode KKM.");
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterStatus, filterJenis, filterTahun, filterTahunAkademik, navigate]);

  useEffect(() => {
    void fetchActive();
  }, [fetchActive]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleActivate = async (periode: KkmPeriod) => {
    const ok = window.confirm(`Aktifkan periode "${periode.nama_periode}"? Periode AKTIF lain akan otomatis menjadi DIJADWALKAN.`);
    if (!ok) return;
    setActivatingId(periode.id);
    setActionMsg(null);
    try {
      await activateKkmPeriod(periode.id);
      setActionMsg({ type: "success", text: `Periode "${periode.nama_periode}" berhasil diaktifkan.` });
      await Promise.all([fetchList(), fetchActive()]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
        if (status === 401) {
          setActionMsg({ type: "error", text: "Sesi habis. Silakan login ulang." });
          return;
        }
        if (status === 403) {
          setActionMsg({ type: "error", text: "Hanya ADMIN_LPPM yang boleh mengaktifkan periode." });
          return;
        }
        const firstErr = data?.errors ? Object.values(data.errors)[0] : null;
        const msg = (Array.isArray(firstErr) ? firstErr[0] : firstErr as string | undefined) || data?.message || err.message;
        setActionMsg({ type: "error", text: msg || "Gagal mengaktifkan periode." });
      } else {
        setActionMsg({ type: "error", text: err instanceof Error ? err.message : "Gagal mengaktifkan periode." });
      }
    } finally {
      setActivatingId(null);
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilterStatus("semua");
    setFilterJenis("semua");
    setFilterTahun("");
    setFilterTahunAkademik("");
    setPage(1);
  };

  const totalPages = meta.totalPages || 1;
  const currentPage = meta.currentPage || page;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Periode KKM</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manajemen periode pelaksanaan Kuliah Kerja Mahasiswa</p>
        </div>
        <button
          onClick={() => navigate("/admin-dashboard/kkm/periode/new")}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} />
          Tambah Periode KKM
        </button>
      </div>

      {/* Periode Aktif Banner */}
      {activeLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-lg bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-64 bg-gray-100 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
        </div>
      ) : activePeriod ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                Periode aktif saat ini: <span className="font-bold">{activePeriod.nama_periode}</span>
              </p>
              <p className="text-xs text-green-600">
                {activePeriod.tgl_pelaksanaan ? activePeriod.tgl_pelaksanaan.slice(0, 10) : "-"} - {activePeriod.tgl_penarikan ? activePeriod.tgl_penarikan.slice(0, 10) : "-"} • Target: {activePeriod.target_peserta} mhs
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin-dashboard/kkm/periode/${activePeriod.id}`)}
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            Lihat Detail &gt;
          </button>
        </div>
      ) : activeError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {activeError}
        </div>
      ) : (
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg border border-gray-200">
            <Calendar size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">Tidak ada periode aktif</p>
        </div>
      )}

      {actionMsg && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${actionMsg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {actionMsg.text}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama_periode / tahun_akademik / deskripsi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="semua">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="AKTIF">Aktif</option>
                <option value="DIJADWALKAN">Dijadwalkan</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>
          </div>

          <div className="min-w-[140px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Jenis</label>
            <select
              value={filterJenis}
              onChange={(e) => {
                setFilterJenis(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="semua">Semua Jenis</option>
              <option value="REGULER">Reguler</option>
              <option value="TEMATIK">Tematik</option>
            </select>
          </div>

          <div className="w-[110px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Tahun</label>
            <input
              type="number"
              placeholder="2026"
              value={filterTahun}
              onChange={(e) => {
                setFilterTahun(e.target.value);
                setPage(1);
              }}
              min={2000}
              max={2100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="w-[140px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Tahun Akademik</label>
            <input
              type="text"
              placeholder="2025/2026"
              value={filterTahunAkademik}
              onChange={(e) => {
                setFilterTahunAkademik(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={clearFilters}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1"
          >
            <Filter size={14} />
            Reset
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-3">Menampilkan {meta.totalData} periode • Halaman {currentPage} dari {totalPages}</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tahun</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Periode</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pelaksanaan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Penarikan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Memuat periode...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((periode) => (
                  <tr key={periode.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{periode.tahun}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{periode.nama_periode}</p>
                        <p className="text-xs text-gray-500">Target: {periode.target_peserta} mhs • {periode.tahun_akademik}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <JenisBadge jenis={periode.jenis} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{periode.tgl_pelaksanaan ? periode.tgl_pelaksanaan.slice(0, 10) : "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{periode.tgl_penarikan ? periode.tgl_penarikan.slice(0, 10) : "-"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={periode.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/admin-dashboard/kkm/periode/${periode.id}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin-dashboard/kkm/periode/${periode.id}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {(periode.status === "DRAFT" || periode.status === "DIJADWALKAN") && (
                          <button
                            onClick={() => void handleActivate(periode)}
                            disabled={activatingId === periode.id}
                            className="ml-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {activatingId === periode.id ? <Loader2 size={12} className="animate-spin" /> : null}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {meta.totalData} data • {meta.limit} per halaman
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <Clock size={12} />
        <span>Status SELESAI otomatis via cron harian (tgl_penarikan &lt; hari ini) + manual override.</span>
        <span className="inline-flex items-center gap-1 ml-2">
          <CheckCircle size={12} className="text-green-500" />
          Hanya 1 periode AKTIF dalam satu waktu.
        </span>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { getKkmPeriodActive, getKkmPeriods } from "./kkmPeriod.api";
import { deleteKkmLocation, getKkmLocationStats, getKkmLocations } from "./kkmLocation.api";
import type { KkmLocation, KkmLocationStats } from "./kkmLocation.types";
import type { KkmPeriod } from "./kkmPeriod.types";
import KkmLocationModal from "./KkmLocationModal";
import KkmLocationDetailModal from "./KkmLocationDetailModal";

export default function LokasiKKM() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.roles === "ADMIN_LPPM";

  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<KkmLocation[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<KkmLocationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<KkmLocation | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load periodes + active default
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const [activeRes, listRes] = await Promise.allSettled([getKkmPeriodActive(), getKkmPeriods({ page: 1, limit: 50 })]);
        if (cancelled) return;
        if (listRes.status === "fulfilled") setPeriodes(listRes.value.data || []);
        const active = activeRes.status === "fulfilled" ? activeRes.value.data : null;
        if (active?.id) {
          setSelectedPeriodeId(active.id);
        } else if (listRes.status === "fulfilled" && listRes.value.data.length > 0) {
          // Fallback to first periode if no active, but spec says require pilih dulu -> we auto-select first for UX
          // To respect spec "default = periode AKTIF", we only auto-select if active exists; otherwise leave null so hint shows
          // Keep null so user sees hint
        }
      } catch {
        // ignore
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchList = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setData([]);
      setMeta({ totalData: 0, totalPages: 1, currentPage: 1, limit: 10 });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getKkmLocations({
        periode_id: selectedPeriodeId,
        page,
        search: debouncedSearch || undefined,
        kecamatan: filterKecamatan || undefined,
        kabupaten: filterKabupaten || undefined,
        status: filterStatus !== "semua" ? filterStatus : undefined,
        limit: 10,
      });
      setData(res.data || []);
      setMeta(res.meta || { totalData: 0, totalPages: 1, currentPage: page, limit: 10 });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setError("Sesi habis. Silakan login ulang.");
          setTimeout(() => navigate("/login"), 1200);
          return;
        }
        if (status === 403) setError("Akses ditolak.");
        else setError((err.response?.data as { message?: string })?.message || err.message || "Gagal memuat lokasi.");
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat lokasi.");
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriodeId, page, debouncedSearch, filterKecamatan, filterKabupaten, filterStatus, navigate]);

  const fetchStats = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getKkmLocationStats(selectedPeriodeId);
      setStats(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setStats(null);
      } else {
        setStatsError(axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : "Gagal memuat statistik.");
      }
    } finally {
      setStatsLoading(false);
    }
  }, [selectedPeriodeId]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const handleDelete = async (loc: KkmLocation) => {
    const ok = window.confirm(`Hapus lokasi Desa "${loc.desa}" (Kec. ${loc.kecamatan})?`);
    if (!ok) return;
    setDeletingId(loc.id);
    try {
      await deleteKkmLocation(loc.id);
      setToast({ type: "success", text: "Lokasi berhasil dihapus." });
      await Promise.all([fetchList(), fetchStats()]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setToast({ type: "error", text: "Hanya ADMIN LPPM yang boleh menghapus lokasi." });
      } else {
        const msg = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : "Gagal menghapus lokasi.";
        setToast({ type: "error", text: msg });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilterKecamatan("");
    setFilterKabupaten("");
    setFilterStatus("semua");
    setPage(1);
  };

  const totalPages = meta.totalPages || 1;
  const currentPage = meta.currentPage || page;

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "Tersedia") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle size={12} />
          Tersedia
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <XCircle size={12} />
        Penuh
      </span>
    );
  };

  const KuotaProgress = ({ terisi, kuota }: { terisi: number; kuota: number }) => {
    const pct = kuota > 0 ? Math.min(100, (terisi / kuota) * 100) : 0;
    const isFull = terisi >= kuota && kuota > 0;
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isFull ? "bg-red-500" : "bg-gray-300"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-500">
          {terisi}/{kuota}
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lokasi / Desa KKM</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manajemen lokasi dan desa penempatan KKM</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            disabled={selectedPeriodeId == null}
            title={selectedPeriodeId == null ? "Pilih periode dulu" : undefined}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            Tambah Lokasi
          </button>
        )}
      </div>

      {toast && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {toast.text}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Periode selector + Stats ringkas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[260px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Periode *</label>
            <select
              value={selectedPeriodeId ? String(selectedPeriodeId) : ""}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null;
                setSelectedPeriodeId(v);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Pilih periode</option>
              {periodes.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.nama_periode} • {p.tahun_akademik} {p.status === "AKTIF" ? "(Aktif)" : `(${p.status})`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            {selectedPeriodeId == null ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Pilih periode dulu.</p>
            ) : statsLoading ? (
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Loader2 size={14} className="animate-spin" /> Memuat statistik...
              </p>
            ) : stats ? (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Total Desa: {stats.total_desa}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="font-medium">Total Kecamatan: {stats.total_kecamatan}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="font-medium">Total Kuota: {stats.total_kuota}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-gray-500">Terisi: {stats.total_terisi}</span>
                {stats.per_kecamatan.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.per_kecamatan.map((k) => `${k.kecamatan} (${k.jumlah_desa} desa)`).join(" • ")}
                  </div>
                )}
              </div>
            ) : statsError ? (
              <p className="text-sm text-red-600">{statsError}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Filter & Search - disable when no periode */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari desa / kecamatan / kabupaten..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={selectedPeriodeId == null}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="w-[160px]">
            <input
              type="text"
              placeholder="Kecamatan"
              value={filterKecamatan}
              onChange={(e) => {
                setFilterKecamatan(e.target.value);
                setPage(1);
              }}
              disabled={selectedPeriodeId == null}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
            />
          </div>
          <div className="w-[160px]">
            <input
              type="text"
              placeholder="Kabupaten"
              value={filterKabupaten}
              onChange={(e) => {
                setFilterKabupaten(e.target.value);
                setPage(1);
              }}
              disabled={selectedPeriodeId == null}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
            />
          </div>
          <div className="w-[140px]">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              disabled={selectedPeriodeId == null}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
            >
              <option value="semua">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Penuh">Penuh</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            disabled={selectedPeriodeId == null}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1 disabled:opacity-40"
          >
            <Filter size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Table - 7 columns only: DESA | KECAMATAN | KABUPATEN | KUOTA | TERISI | STATUS | AKSI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DESA</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">KECAMATAN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">KABUPATEN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">KUOTA</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">TERISI</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedPeriodeId == null ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <MapPin size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">Pilih periode dulu</p>
                      <p className="text-xs text-gray-400">Pilih periode untuk menampilkan lokasi desa KKM.</p>
                    </div>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Memuat lokasi...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((lokasi) => (
                  <tr key={lokasi.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-red-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-800">{lokasi.desa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lokasi.kecamatan}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lokasi.kabupaten}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{lokasi.kuota}</td>
                    <td className="px-6 py-4">
                      <KuotaProgress terisi={lokasi.terisi} kuota={lokasi.kuota} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lokasi.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setDetailId(lokasi.id);
                            setShowDetail(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detail"
                        >
                          <Eye size={16} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditTarget(lokasi)}
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => void handleDelete(lokasi)}
                              disabled={deletingId === lokasi.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Hapus"
                            >
                              {deletingId === lokasi.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <MapPin size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">Belum ada lokasi di periode ini</p>
                      <p className="text-xs text-gray-400">Tambah lokasi untuk periode terpilih.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination 10/halaman */}
        {selectedPeriodeId != null && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * meta.limit + 1} - {Math.min(currentPage * meta.limit, meta.totalData)} dari {meta.totalData} lokasi
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${currentPage === p ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
        {selectedPeriodeId != null && totalPages <= 1 && meta.totalData > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">Menampilkan {meta.totalData} lokasi</div>
        )}
      </div>

      <KkmLocationModal
        mode="create"
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          setToast({ type: "success", text: "Lokasi berhasil ditambahkan." });
          void fetchList();
          void fetchStats();
        }}
        periodeLockedId={selectedPeriodeId}
      />

      <KkmLocationModal
        mode="edit"
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={() => {
          setToast({ type: "success", text: "Lokasi berhasil diperbarui." });
          void fetchList();
          void fetchStats();
        }}
        periodeLockedId={selectedPeriodeId}
        location={editTarget}
      />

      <KkmLocationDetailModal
        open={showDetail}
        locationId={detailId}
        onClose={() => {
          setShowDetail(false);
          setDetailId(null);
        }}
        onEdit={(loc) => {
          setShowDetail(false);
          setEditTarget(loc);
        }}
        onDeleted={() => {
          setToast({ type: "success", text: "Lokasi berhasil dihapus." });
          void fetchList();
          void fetchStats();
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}

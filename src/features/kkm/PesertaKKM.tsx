import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserX,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { getKkmPeriodActive, getKkmPeriods } from "./kkmPeriod.api";
import { getKkmDplKelompok } from "./kkmDpl.api";
import {
  getKkmPeserta,
  getKkmPesertaStats,
  bulkUpdateKkmPesertaStatus,
  updateKkmPesertaStatus,
  exportKkmPeserta,
} from "./kkmPeserta.api";
import type { KkmPeserta, KkmPesertaStats } from "./kkmPeserta.types";
import type { KkmPeriod } from "./kkmPeriod.types";
import type { KkmDplKelompokItem } from "./kkmDpl.types";
import KkmPesertaAssignKelompokModal from "./KkmPesertaAssignKelompokModal";
import KkmPesertaDetailModal from "./KkmPesertaDetailModal";

type TabKey = "semua" | "pending" | "verified" | "rejected" | "belum_kelompok";

function StatusVerifikasiBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  if (normalized === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
        Verified
      </span>
    );
  }
  if (normalized === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <XCircle size={12} />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
      <Clock size={12} />
      Pending
    </span>
  );
}

function StatusKelompokBadge({ peserta }: { peserta: KkmPeserta }) {
  if (peserta.kelompok && peserta.status_kelompok === "Sudah Ditempatkan") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        <Users size={12} />
        {peserta.kelompok.nama} {peserta.kelompok.desa ? `· ${peserta.kelompok.desa}` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
      <MapPin size={12} />
      Belum Ditempatkan
    </span>
  );
}

export default function PesertaKKM() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.roles === "ADMIN_LPPM";

  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);

  const [stats, setStats] = useState<KkmPesertaStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterFakultas, setFilterFakultas] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  const [filterSemester, setFilterSemester] = useState<string>("semua");
  const [filterKelompokId, setFilterKelompokId] = useState<string>("semua");
  const [kelompokOptions, setKelompokOptions] = useState<KkmDplKelompokItem[]>([]);

  const [activeTab, setActiveTab] = useState<TabKey>("semua");

  const [rows, setRows] = useState<KkmPeserta[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        if (activeRes.status === "fulfilled") {
          const activeData = (activeRes.value as unknown as { data?: KkmPeriod | null })?.data ?? (activeRes.value as unknown as KkmPeriod | null);
          // getKkmPeriodActive returns { message, data: KkmPeriod|null } so activeRes.value.data is KkmPeriod|null
          const wrapped = activeRes.value as { data: KkmPeriod | null };
          const activePeriod = wrapped.data;
          if (activePeriod?.id) {
            setSelectedPeriodeId(activePeriod.id);
            return;
          }
        }
        // fallback: latest periode (first of list sorted desc by id? BE returns by created)
        if (listRes.status === "fulfilled" && listRes.value.data.length > 0) {
          // Use first as fallback if no active, but spec says without periode table empty + hint — so we could still auto-select latest for UX
          // We'll auto-select latest to match Peserta filter requirement "default = GET /active or latest"
          const latest = listRes.value.data[0];
          if (latest?.id) setSelectedPeriodeId(latest.id);
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

  // Fetch kelompok options for filter dropdown
  useEffect(() => {
    if (selectedPeriodeId == null) {
      setKelompokOptions([]);
      return;
    }
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await getKkmDplKelompok({ periode_id: selectedPeriodeId, unassigned_only: false });
        if (!cancelled) setKelompokOptions(res.data || []);
      } catch {
        if (!cancelled) setKelompokOptions([]);
      }
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [selectedPeriodeId]);

  const statusQuery = useMemo(() => {
    if (activeTab === "pending") return "PENDING";
    if (activeTab === "verified") return "VERIFIED";
    if (activeTab === "rejected") return "REJECTED";
    return undefined;
  }, [activeTab]);

  // Enum BE (Swagger): "BelumDitempatkan" — tanpa spasi, pakai "Belum Ditempatkan" berujung 400.
  const statusKelompokQuery = useMemo(() => {
    if (activeTab === "belum_kelompok") return "BelumDitempatkan";
    return undefined;
  }, [activeTab]);

  const fetchStats = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getKkmPesertaStats(selectedPeriodeId);
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

  const fetchList = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setRows([]);
      setMeta({ totalData: 0, totalPages: 1, currentPage: 1, limit: 10 });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getKkmPeserta({
        periode_id: selectedPeriodeId,
        page,
        search: debouncedSearch || undefined,
        fakultas: filterFakultas.trim() || undefined,
        prodi: filterProdi.trim() || undefined,
        semester: filterSemester !== "semua" ? filterSemester : undefined,
        kelompok_id: filterKelompokId !== "semua" ? filterKelompokId : undefined,
        status: statusQuery,
        status_kelompok: statusKelompokQuery,
        limit: 10,
      });
      setRows(res.data || []);
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
        else setError((err.response?.data as { message?: string })?.message || err.message || "Gagal memuat peserta.");
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat peserta.");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriodeId, page, debouncedSearch, filterFakultas, filterProdi, filterSemester, filterKelompokId, statusQuery, statusKelompokQuery, navigate]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  // Clear selection when filters/page/tab change
  useEffect(() => {
    setSelectedIds([]);
  }, [selectedPeriodeId, debouncedSearch, filterFakultas, filterProdi, filterSemester, filterKelompokId, activeTab, page]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilterFakultas("");
    setFilterProdi("");
    setFilterSemester("semua");
    setFilterKelompokId("semua");
    setActiveTab("semua");
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === rows.length && rows.length > 0) setSelectedIds([]);
    else setSelectedIds(rows.map((r) => r.id));
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBulkStatus = async (status: "VERIFIED" | "REJECTED") => {
    if (selectedPeriodeId == null) {
      showToast("error", "Pilih periode dulu.");
      return;
    }
    if (selectedIds.length === 0) return;
    setBulkLoading(status);
    try {
      await bulkUpdateKkmPesertaStatus({ periode_id: selectedPeriodeId, peserta_ids: selectedIds, status });
      showToast("success", `Berhasil update ${selectedIds.length} peserta menjadi ${status}.`);
      setSelectedIds([]);
      await Promise.all([fetchStats(), fetchList()]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
        const msg = data?.message || err.message;
        if (err.response?.status === 403) showToast("error", "Hanya ADMIN LPPM");
        else if (err.response?.status === 400) showToast("error", msg || "Validasi gagal.");
        else showToast("error", msg || "Gagal update status.");
      } else showToast("error", err instanceof Error ? err.message : "Gagal update status.");
    } finally {
      setBulkLoading(null);
    }
  };

  const handleSingleStatus = async (id: number, status: "VERIFIED" | "REJECTED" | "PENDING") => {
    setBulkLoading(`single-${id}`);
    try {
      await updateKkmPesertaStatus(id, status);
      showToast("success", `Peserta berhasil diupdate menjadi ${status}.`);
      await Promise.all([fetchStats(), fetchList()]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        const msg = data?.message || err.message;
        if (err.response?.status === 403) showToast("error", "Hanya ADMIN LPPM");
        else showToast("error", msg || "Gagal update status.");
      } else showToast("error", "Gagal update status.");
    } finally {
      setBulkLoading(null);
    }
  };

  const handleExport = async () => {
    if (selectedPeriodeId == null) {
      showToast("error", "Pilih periode dulu.");
      return;
    }
    try {
      const blob = await exportKkmPeserta({
        periode_id: selectedPeriodeId,
        search: debouncedSearch || undefined,
        fakultas: filterFakultas.trim() || undefined,
        prodi: filterProdi.trim() || undefined,
        semester: filterSemester !== "semua" ? filterSemester : undefined,
        kelompok_id: filterKelompokId !== "semua" ? filterKelompokId : undefined,
        status: statusQuery,
        status_kelompok: statusKelompokQuery,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `peserta-kkm-periode-${selectedPeriodeId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("success", "Export berhasil diunduh.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) showToast("error", "Hanya ADMIN/STAFF LPPM");
      else showToast("error", "Gagal export data.");
    }
  };

  const totalPages = meta.totalPages || 1;
  const currentPage = meta.currentPage || page;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Peserta KKM</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola peserta KKM per periode</p>
        </div>
        <button
          onClick={() => void handleExport()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm shrink-0"
        >
          <Download size={16} />
          Export Data
        </button>
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

      {/* Periode selector (wajib) */}
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
            ) : statsError ? (
              <p className="text-sm text-red-600">{statsError}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* 5 Kartu Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</p>
              {statsLoading ? <p className="text-xl font-bold text-gray-800 mt-1"><Loader2 size={16} className="animate-spin" /></p> : <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats?.total ?? 0}</p>}
            </div>
            <div className="bg-gray-100 p-2 rounded-lg"><Users size={18} className="text-gray-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Verified</p>
              {statsLoading ? <p className="text-xl font-bold text-green-600 mt-1"><Loader2 size={16} className="animate-spin" /></p> : <p className="text-2xl font-bold text-green-600 mt-0.5">{stats?.verified ?? 0}</p>}
            </div>
            <div className="bg-green-50 p-2 rounded-lg"><CheckCircle size={18} className="text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pending</p>
              {statsLoading ? <p className="text-xl font-bold text-yellow-600 mt-1"><Loader2 size={16} className="animate-spin" /></p> : <p className="text-2xl font-bold text-yellow-600 mt-0.5">{stats?.pending ?? 0}</p>}
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg"><Clock size={18} className="text-yellow-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Rejected</p>
              {statsLoading ? <p className="text-xl font-bold text-red-600 mt-1"><Loader2 size={16} className="animate-spin" /></p> : <p className="text-2xl font-bold text-red-600 mt-0.5">{stats?.rejected ?? 0}</p>}
            </div>
            <div className="bg-red-50 p-2 rounded-lg"><XCircle size={18} className="text-red-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Belum Kelompok</p>
              {statsLoading ? <p className="text-xl font-bold text-orange-600 mt-1"><Loader2 size={16} className="animate-spin" /></p> : <p className="text-2xl font-bold text-orange-600 mt-0.5">{stats?.belum_kelompok ?? 0}</p>}
            </div>
            <div className="bg-orange-50 p-2 rounded-lg"><UserX size={18} className="text-orange-600" /></div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-[160px]">
            <input
              type="text"
              placeholder="Semua Fakultas"
              value={filterFakultas}
              onChange={(e) => { setFilterFakultas(e.target.value); setPage(1); }}
              disabled={selectedPeriodeId == null}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
            />
          </div>
          <div className="w-[160px]">
            <input
              type="text"
              placeholder="Semua Program Studi"
              value={filterProdi}
              onChange={(e) => { setFilterProdi(e.target.value); setPage(1); }}
              disabled={selectedPeriodeId == null}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
            />
          </div>
          <div className="w-[140px]">
            <select
              value={filterSemester}
              onChange={(e) => { setFilterSemester(e.target.value); setPage(1); }}
              disabled={selectedPeriodeId == null}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
            >
              <option value="semua">Semua Semester</option>
              {Array.from({ length: 14 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>
          <div className="w-[180px]">
            <select
              value={filterKelompokId}
              onChange={(e) => { setFilterKelompokId(e.target.value); setPage(1); }}
              disabled={selectedPeriodeId == null}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
            >
              <option value="semua">Semua (Kelompok)</option>
              {kelompokOptions.map((k) => (
                <option key={k.id} value={String(k.id)}>{k.nama} {k.lokasi?.desa ? `· ${k.lokasi.desa}` : k.desa ? `· ${k.desa}` : ""}</option>
              ))}
            </select>
          </div>
          <button onClick={clearFilters} disabled={selectedPeriodeId == null} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
            Reset
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari NIM, nama, prodi, kelompok..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={selectedPeriodeId == null}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "semua" as TabKey, label: "Semua", count: stats?.total ?? 0 },
              { key: "pending" as TabKey, label: "Pending", count: stats?.pending ?? 0 },
              { key: "verified" as TabKey, label: "Verified", count: stats?.verified ?? 0 },
              { key: "rejected" as TabKey, label: "Rejected", count: stats?.rejected ?? 0 },
              { key: "belum_kelompok" as TabKey, label: "Belum Kelompok", count: stats?.belum_kelompok ?? 0 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                disabled={selectedPeriodeId == null}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-40 ${activeTab === tab.key ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
              >
                {tab.label} {tab.count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-blue-700">{selectedIds.length} peserta dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void handleBulkStatus("VERIFIED")}
              disabled={!isAdmin || bulkLoading != null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg"
            >
              {bulkLoading === "VERIFIED" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
              Verifikasi Massal
            </button>
            <button
              onClick={() => void handleBulkStatus("REJECTED")}
              disabled={!isAdmin || bulkLoading != null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg"
            >
              {bulkLoading === "REJECTED" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Reject
            </button>
            <button
              onClick={() => setShowAssign(true)}
              disabled={!isAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-medium rounded-lg"
            >
              <Users size={12} />
              Assign Kelompok
            </button>
            <button onClick={() => void handleExport()} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg">
              <Download size={12} />
              Export Data
            </button>
            <button onClick={() => setSelectedIds([])} className="text-xs text-blue-700 hover:underline px-2">
              Batal pilih
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === rows.length && rows.length > 0}
                    onChange={toggleSelectAll}
                    disabled={selectedPeriodeId == null || rows.length === 0}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:opacity-40"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NIM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NAMA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PRODI / FAK.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SEM.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS VERIFIKASI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS KELOMPOK</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedPeriodeId == null ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">Pilih periode dulu</p>
                      <p className="text-xs text-gray-400">Pilih periode untuk menampilkan peserta KKM.</p>
                    </div>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Memuat peserta...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((peserta) => (
                  <tr key={peserta.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(peserta.id)}
                        onChange={() => toggleSelectOne(peserta.id)}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-800">{peserta.nim}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{peserta.nama}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-800">{peserta.prodi || "—"}</p>
                        <p className="text-xs text-gray-400">{peserta.fakultas || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        SEM. {peserta.semester ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusVerifikasiBadge status={peserta.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusKelompokBadge peserta={peserta} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setDetailId(peserta.id);
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
                              onClick={() => void handleSingleStatus(peserta.id, "VERIFIED")}
                              disabled={bulkLoading === `single-${peserta.id}`}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Verifikasi"
                            >
                              {bulkLoading === `single-${peserta.id}` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
                            </button>
                            <button
                              onClick={() => void handleSingleStatus(peserta.id, "REJECTED")}
                              disabled={bulkLoading === `single-${peserta.id}`}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">Belum ada peserta di periode ini</p>
                      <p className="text-xs text-gray-400">Coba ubah filter atau pilih periode lain.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">Menampilkan {rows.length} dari {meta.totalData} peserta</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || selectedPeriodeId == null}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <span className="px-3 py-1 text-sm font-medium bg-red-600 text-white rounded-lg">{currentPage}</span>
            {totalPages > 1 && <span className="text-sm text-gray-500">/ {totalPages}</span>}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || selectedPeriodeId == null}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Selanjutnya <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <KkmPesertaDetailModal open={showDetail} pesertaId={detailId} onClose={() => { setShowDetail(false); setDetailId(null); }} />

      <KkmPesertaAssignKelompokModal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        onSuccess={() => {
          showToast("success", `Berhasil assign ${selectedIds.length} peserta ke kelompok.`);
          setSelectedIds([]);
          void fetchStats();
          void fetchList();
        }}
        periodeId={selectedPeriodeId}
        pesertaIds={selectedIds}
      />
    </div>
  );
}

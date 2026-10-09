import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Eye,
  Edit,
  User,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  BookOpen,
  Loader2,
  AlertCircle,
  XCircle,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { getKkmPeriodActive, getKkmPeriods } from "./kkmPeriod.api";
import { cabutKkmDpl, getKkmDpl, getKkmDplStats } from "./kkmDpl.api";
import type { KkmDplRow } from "./kkmDpl.types";
import type { KkmPeriod } from "./kkmPeriod.types";
import KkmDplAssignModal from "./KkmDplAssignModal";

function avatarInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase() || name.slice(0, 2).toUpperCase();
}

function StatusBadge({ status, isActive }: { status: string; isActive: boolean }) {
  if (isActive || status === "Aktif") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
        Aktif DPL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
      <Clock size={12} />
      Belum Ditugaskan
    </span>
  );
}

function KelompokCell({ count, maksimal }: { count: number; maksimal: number | null }) {
  const hasMaks = maksimal != null && maksimal > 0;
  const pct = hasMaks ? Math.min(100, (count / maksimal) * 100) : 0;
  return (
    <div className="min-w-[90px]">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <Users size={14} className="text-gray-400" />
        <span>
          {count}/{hasMaks ? maksimal : "—"}
        </span>
      </div>
      <div className="mt-1 w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${hasMaks ? "bg-red-600" : "bg-gray-300"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DesaBimbinganCell({ desa }: { desa: string[] }) {
  if (!desa || desa.length === 0) return <span className="text-sm text-gray-400">—</span>;
  const firstTwo = desa.slice(0, 2);
  const rest = desa.length - 2;
  return (
    <div className="flex flex-wrap items-center gap-1.5 max-w-[180px]">
      {firstTwo.map((d) => (
        <span key={d} className="inline-flex px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
          {d}
        </span>
      ))}
      {rest > 0 && <span className="inline-flex px-2 py-1 rounded-full text-xs bg-red-50 text-red-600 border border-red-200">+{rest}</span>}
    </div>
  );
}

export default function DPLKKM() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.roles === "ADMIN_LPPM";

  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterFakultas, setFilterFakultas] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<KkmDplRow[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<{ total_dpl_aktif: number; belum_ditugaskan: number; total_kelompok: number; rata_rata_bimbingan: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignPreselectedDosen, setAssignPreselectedDosen] = useState<KkmDplRow["dosen"] | null>(null);
  const [assignPreselectedRow, setAssignPreselectedRow] = useState<KkmDplRow | null>(null);

  const [detailRow, setDetailRow] = useState<KkmDplRow | null>(null);
  const [cabutLoadingId, setCabutLoadingId] = useState<number | null>(null);

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
        // activeRes shape: { message, data: KkmPeriod | null } — getKkmPeriodActive returns that wrapper
        const activeId = (active as unknown as { data?: KkmPeriod | null })?.data?.id ?? (active as unknown as KkmPeriod | null)?.id ?? null;
        // Also handle if BE returns directly { data: period }
        const altActiveId = (activeRes.status === "fulfilled" ? (activeRes.value as unknown as { data?: KkmPeriod | null })?.data?.id : null) ?? null;
        const finalActiveId = activeId || altActiveId;
        if (finalActiveId) setSelectedPeriodeId(finalActiveId);
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
    setLoading(true);
    setError(null);
    try {
      const statusParam = filterStatus === "semua" ? undefined : filterStatus === "aktif" ? "Aktif" : filterStatus === "belum" ? "Belum Ditugaskan" : filterStatus;
      const res = await getKkmDpl({
        periode_id: selectedPeriodeId,
        page,
        search: debouncedSearch || undefined,
        fakultas: filterFakultas || undefined,
        status: statusParam,
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
        else setError((err.response?.data as { message?: string })?.message || err.message || "Gagal memuat DPL.");
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat DPL.");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriodeId, page, debouncedSearch, filterFakultas, filterStatus, navigate]);

  const fetchStats = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getKkmDplStats(selectedPeriodeId);
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

  const fakultasOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.dosen.fakultas) set.add(r.dosen.fakultas);
    });
    // Include common Fakultas even if not in current page
    return Array.from(set).sort();
  }, [rows]);

  const totalPages = meta.totalPages || 1;
  const currentPage = meta.currentPage || page;

  const handleCabut = async (row: KkmDplRow) => {
    if (!selectedPeriodeId) {
      setToast({ type: "error", text: "Pilih periode dulu." });
      return;
    }
    const ok = window.confirm(`Cabut penugasan DPL "${row.dosen.name}" di periode ini? ${row.kelompok.count} kelompok akan dilepas.`);
    if (!ok) return;
    setCabutLoadingId(row.dosen.id);
    try {
      await cabutKkmDpl({ dosen_id: row.dosen.id, periode_id: selectedPeriodeId });
      setToast({ type: "success", text: "Tugas DPL berhasil dicabut." });
      await Promise.all([fetchList(), fetchStats()]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as { message?: string })?.message || err.message;
        if (status === 403) setToast({ type: "error", text: "Hanya ADMIN LPPM yang boleh mencabut DPL." });
        else if (status === 400) setToast({ type: "error", text: msg || "Periode sudah SELESAI." });
        else setToast({ type: "error", text: msg || "Gagal mencabut DPL." });
      } else {
        setToast({ type: "error", text: err instanceof Error ? err.message : "Gagal mencabut DPL." });
      }
    } finally {
      setCabutLoadingId(null);
    }
  };

  const openAssignForRow = (row: KkmDplRow, mode: "tugaskan" | "edit") => {
    setAssignPreselectedDosen(row.dosen);
    setAssignPreselectedRow(mode === "edit" ? row : null);
    // For "tugaskan" on Belum Ditugaskan, keep row as null so modal knows it's create
    if (mode === "edit") setAssignPreselectedRow(row);
    else setAssignPreselectedRow(null);
    setAssignOpen(true);
  };

  const openAssignNew = () => {
    setAssignPreselectedDosen(null);
    setAssignPreselectedRow(null);
    setAssignOpen(true);
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilterFakultas("");
    setFilterStatus("semua");
    setPage(1);
  };

  // Auto-hide toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen DPL KKM</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola penugasan dosen pembimbing lapangan untuk setiap kelompok KKM.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAssignNew}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0"
          >
            <Users size={16} />
            Tugaskan DPL Baru
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

      {/* Banner Sistem Izin Dinamis DPL */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Info size={20} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800">Sistem Izin Dinamis DPL</p>
          <p className="text-xs text-blue-600">
            <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">DPL_KKM = ACTIVE</span> diberikan sementara. Akses dicabut otomatis saat penugasan berakhir.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari dosen, NIDN, atau desa..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="w-[200px]">
            <select
              value={selectedPeriodeId ? String(selectedPeriodeId) : ""}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null;
                setSelectedPeriodeId(v);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Semua Periode</option>
              {periodes.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.nama_periode} • {p.tahun_akademik} {p.status === "AKTIF" ? "(Aktif)" : `(${p.status})`}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[160px]">
            <select
              value={filterFakultas}
              onChange={(e) => {
                setFilterFakultas(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Semua Fakultas</option>
              {fakultasOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
              {fakultasOptions.length === 0 && (
                <>
                  <option value="Teknik">Teknik</option>
                  <option value="FKIP">FKIP</option>
                </>
              )}
            </select>
          </div>
          <div className="w-[160px]">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Belum Ditugaskan">Belum Ditugaskan</option>
            </select>
          </div>
          <button onClick={clearFilters} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Reset
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">Menampilkan {meta.totalData} dari {meta.totalData} dosen</div>
      </div>

      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total DPL Aktif</p>
              {statsLoading ? (
                <p className="text-2xl font-bold text-green-600 mt-1 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                </p>
              ) : (
                <p className="text-2xl font-bold text-green-600 mt-0.5">{stats?.total_dpl_aktif ?? 0}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Dosen pembimbing aktif saat ini</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <UserCheck size={18} className="text-green-600" />
            </div>
          </div>
          {statsError && <p className="text-xs text-red-500 mt-2">{statsError}</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Belum Ditugaskan</p>
              {statsLoading ? (
                <p className="text-2xl font-bold text-orange-600 mt-1 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                </p>
              ) : (
                <p className="text-2xl font-bold text-orange-600 mt-0.5">{stats?.belum_ditugaskan ?? 0}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Dosen tersedia untuk DPL</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <UserX size={18} className="text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Kelompok KKM</p>
              {statsLoading ? (
                <p className="text-2xl font-bold text-blue-600 mt-1 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                </p>
              ) : (
                <p className="text-2xl font-bold text-blue-600 mt-0.5">{stats?.total_kelompok ?? 0}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Kelompok aktif periode berjalan</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Rata-rata Bimbingan</p>
              {statsLoading ? (
                <p className="text-2xl font-bold text-purple-600 mt-1 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                </p>
              ) : (
                <p className="text-2xl font-bold text-purple-600 mt-0.5">{stats ? `${stats.rata_rata_bimbingan} Klp` : "0 Klp"}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Per dosen pembimbing</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <BookOpen size={18} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table 7 kolom */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NAMA DOSEN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">FAKULTAS / PRODI</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS DPL</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">KELOMPOK</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DESA BIMBINGAN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PERIODE</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Memuat DPL...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.dosen.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                          {avatarInitials(row.dosen.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{row.dosen.name}</p>
                          <p className="text-xs text-gray-400">{row.dosen.nidn_nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{row.dosen.fakultas || "—"}</p>
                      <p className="text-xs text-gray-400">{row.dosen.prodi || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.status_dpl} isActive={row.is_dpl_aktif} />
                    </td>
                    <td className="px-6 py-4">
                      <KelompokCell count={row.kelompok.count} maksimal={row.kelompok.maksimal} />
                    </td>
                    <td className="px-6 py-4">
                      <DesaBimbinganCell desa={row.desa_bimbingan} />
                    </td>
                    <td className="px-6 py-4">
                      {row.periode ? (
                        <div>
                          <p className="text-sm text-gray-700">{row.periode.nama_periode}</p>
                          <p className="text-xs text-gray-400">{row.periode.tahun_akademik}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailRow(row)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detail"
                        >
                          <Eye size={16} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openAssignForRow(row, "edit")}
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            {row.is_dpl_aktif ? (
                              <button
                                onClick={() => void handleCabut(row)}
                                disabled={cabutLoadingId === row.dosen.id}
                                className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg disabled:opacity-40"
                                title="Cabut"
                              >
                                {cabutLoadingId === row.dosen.id ? <Loader2 size={12} className="animate-spin inline" /> : "Cabut"}
                              </button>
                            ) : (
                              <button
                                onClick={() => openAssignForRow(row, "tugaskan")}
                                className="px-2 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg"
                              >
                                Tugaskan
                              </button>
                            )}
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
                      <User size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">Belum ada DPL di periode ini</p>
                      <p className="text-xs text-gray-400">Coba ubah filter atau tugaskan DPL baru.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">Menampilkan {rows.length} dari {meta.totalData} Dosen DPL</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <span className="px-3 py-1 text-sm font-medium bg-red-600 text-white rounded-lg">{currentPage}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Selanjutnya <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal simple */}
      {detailRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailRow(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Detail DPL</h3>
              <button onClick={() => setDetailRow(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">{avatarInitials(detailRow.dosen.name)}</div>
                <div>
                  <p className="font-semibold text-gray-800">{detailRow.dosen.name}</p>
                  <p className="text-gray-500">{detailRow.dosen.nidn_nip} · {detailRow.dosen.fakultas || "-"} / {detailRow.dosen.prodi || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={detailRow.status_dpl} isActive={detailRow.is_dpl_aktif} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Kelompok</p>
                  <p className="font-medium text-gray-700">
                    {detailRow.kelompok.count}/{detailRow.kelompok.maksimal ?? "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase">Desa Bimbingan</p>
                  <div className="mt-1">
                    <DesaBimbinganCell desa={detailRow.desa_bimbingan} />
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase">Periode</p>
                  <p className="font-medium text-gray-700">{detailRow.periode ? `${detailRow.periode.nama_periode} • ${detailRow.periode.tahun_akademik}` : "—"}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button onClick={() => setDetailRow(null)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <KkmDplAssignModal
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setAssignPreselectedDosen(null);
          setAssignPreselectedRow(null);
        }}
        onSuccess={() => {
          setToast({ type: "success", text: "DPL berhasil ditugaskan." });
          void fetchList();
          void fetchStats();
        }}
        periodeLockedId={selectedPeriodeId}
        periodes={periodes}
        preselectedDosen={assignPreselectedDosen}
        preselectedRow={assignPreselectedRow}
      />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Printer,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { getKkmPeriodActive, getKkmPeriods } from "./kkmPeriod.api";
import { getKkmLocations } from "./kkmLocation.api";
import { getKkmDpl } from "./kkmDpl.api";
import {
  getKkmKelompokList,
  getKkmKelompokStats,
} from "./kkmKelompok.api";
import {
  KKM_KELOMPOK_KOMPOSISI_OPTIONS,
  KKM_KELOMPOK_STATUS_OPTIONS,
  type KkmKelompokKomposisi,
  type KkmKelompokListItem,
  type KkmKelompokListMeta,
  type KkmKelompokStats,
  type KkmKelompokStatus,
} from "./kkmKelompok.types";
import type { KkmPeriod } from "./kkmPeriod.types";
import type { KkmLocation } from "./kkmLocation.types";
import type { KkmDplRow } from "./kkmDpl.types";
import {
  FilledProgressBar,
  GenderCount,
  KelompokStatusBadge,
  KomposisiBadge,
  getKkmErrorMessage,
} from "./kkmKelompok.ui";

const STATUS_LABEL: Record<KkmKelompokStatus, string> = {
  AKTIF: "Semua Status",
  BELUM_LENGKAP: "Belum Lengkap",
  BERMASALAH: "Bermasalah",
};

const KOMPOSISI_LABEL: Record<KkmKelompokKomposisi, string> = {
  SEIMBANG: "Seimbang",
  DOMINASI: "Dominasi",
  PERLU_PENYESUAIAN: "Perlu Penyesuaian",
};

const selectClass =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50";

function StatCard({
  label,
  value,
  loading,
  icon,
  tone,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ReactNode;
  tone: "gray" | "green" | "yellow" | "red" | "blue";
}) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  }[tone];
  const valueClass = {
    gray: "text-gray-800",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    blue: "text-blue-600",
  }[tone];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider truncate">
            {label}
          </p>
          {loading ? (
            <Loader2 size={18} className="animate-spin text-gray-400 mt-1.5" />
          ) : (
            <p className={`text-2xl font-bold mt-0.5 ${valueClass}`}>{value ?? 0}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg shrink-0 ${toneClass}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function KelompokKKM() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.roles === "ADMIN_LPPM";

  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);

  const [stats, setStats] = useState<KkmKelompokStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | KkmKelompokStatus>("");
  const [filterKomposisi, setFilterKomposisi] = useState<"" | KkmKelompokKomposisi>("");
  const [filterDesa, setFilterDesa] = useState("");
  const [filterDplId, setFilterDplId] = useState("");

  const [desaOptions, setDesaOptions] = useState<KkmLocation[]>([]);
  const [dplOptions, setDplOptions] = useState<KkmDplRow[]>([]);

  const [rows, setRows] = useState<KkmKelompokListItem[]>([]);
  const [meta, setMeta] = useState<KkmKelompokListMeta>({
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Init periode (active -> fallback list pertama)
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const [activeRes, listRes] = await Promise.allSettled([
          getKkmPeriodActive(),
          getKkmPeriods({ page: 1, limit: 50 }),
        ]);
        if (cancelled) return;
        if (listRes.status === "fulfilled") setPeriodes(listRes.value.data || []);
        if (activeRes.status === "fulfilled" && activeRes.value.data?.id) {
          setSelectedPeriodeId(activeRes.value.data.id);
          return;
        }
        if (listRes.status === "fulfilled" && listRes.value.data.length > 0) {
          setSelectedPeriodeId(listRes.value.data[0].id);
        }
      } catch {
        // abaikan — state tetap kosong dan user memilih manual
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Opsi filter desa + DPL per periode
  useEffect(() => {
    if (selectedPeriodeId == null) {
      setDesaOptions([]);
      setDplOptions([]);
      return;
    }
    let cancelled = false;
    const fetchOptions = async () => {
      try {
        const [locRes, dplRes] = await Promise.allSettled([
          getKkmLocations({ periode_id: selectedPeriodeId, page: 1, limit: 200 }),
          getKkmDpl({ periode_id: selectedPeriodeId, page: 1, limit: 50 }),
        ]);
        if (cancelled) return;
        if (locRes.status === "fulfilled") setDesaOptions(locRes.value.data || []);
        else setDesaOptions([]);
        if (dplRes.status === "fulfilled") setDplOptions(dplRes.value.data || []);
        else setDplOptions([]);
      } catch {
        if (!cancelled) {
          setDesaOptions([]);
          setDplOptions([]);
        }
      }
    };
    void fetchOptions();
    return () => {
      cancelled = true;
    };
  }, [selectedPeriodeId]);

  const fetchStats = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    try {
      const res = await getKkmKelompokStats(selectedPeriodeId);
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedPeriodeId]);

  const fetchList = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setRows([]);
      setMeta({ totalData: 0, totalPages: 1, currentPage: 1, limit: 12 });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getKkmKelompokList({
        periode_id: selectedPeriodeId,
        page,
        search: debouncedSearch || undefined,
        status: filterStatus,
        komposisi: filterKomposisi,
        desa: filterDesa || undefined,
        dpl_id: filterDplId ? Number(filterDplId) : "",
      });
      setRows(res.data || []);
      setMeta(res.meta || { totalData: 0, totalPages: 1, currentPage: page, limit: 12 });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Sesi habis. Silakan login ulang.");
        setTimeout(() => navigate("/login"), 1200);
        return;
      }
      setError(getKkmErrorMessage(err, "Gagal memuat kelompok KKM."));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [
    selectedPeriodeId,
    page,
    debouncedSearch,
    filterStatus,
    filterKomposisi,
    filterDesa,
    filterDplId,
    navigate,
  ]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const resetFilters = () => {
    setSearchInput("");
    setFilterStatus("");
    setFilterKomposisi("");
    setFilterDesa("");
    setFilterDplId("");
    setPage(1);
  };

  const totalPages = meta.totalPages || 1;
  const currentPage = meta.currentPage || page;

  const filterActive = useMemo(
    () =>
      Boolean(
        debouncedSearch || filterStatus || filterKomposisi || filterDesa || filterDplId,
      ),
    [debouncedSearch, filterStatus, filterKomposisi, filterDesa, filterDplId],
  );

  const periodeSelesai =
    periodes.find((p) => p.id === selectedPeriodeId)?.status === "SELESAI";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelompok KKM</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manajemen operasional kelompok mahasiswa KKM
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* 5 kartu stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Kelompok"
          value={stats?.total_kelompok}
          loading={statsLoading}
          icon={<Users size={18} />}
          tone="gray"
        />
        <StatCard
          label="Aktif"
          value={stats?.aktif}
          loading={statsLoading}
          icon={<CheckCircle2 size={18} />}
          tone="green"
        />
        <StatCard
          label="Belum Lengkap"
          value={stats?.belum_lengkap}
          loading={statsLoading}
          icon={<Clock3 size={18} />}
          tone="yellow"
        />
        <StatCard
          label="Bermasalah"
          value={stats?.bermasalah}
          loading={statsLoading}
          icon={<AlertTriangle size={18} />}
          tone="red"
        />
        <StatCard
          label="Total Mahasiswa"
          value={stats?.total_mahasiswa}
          loading={statsLoading}
          icon={<UserCheck size={18} />}
          tone="blue"
        />
      </div>

      {/* Filter bar */}
      <div className="no-print bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari kelompok, desa, DPL, mahasiswa..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={selectedPeriodeId == null}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="w-[200px]">
            <select
              value={selectedPeriodeId ? String(selectedPeriodeId) : ""}
              onChange={(e) => {
                setSelectedPeriodeId(e.target.value ? Number(e.target.value) : null);
                setFilterDesa("");
                setFilterDplId("");
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Pilih periode</option>
              {periodes.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.nama_periode} {p.tahun_akademik ? `• ${p.tahun_akademik}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[170px]">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as "" | KkmKelompokStatus);
                setPage(1);
              }}
              disabled={selectedPeriodeId == null}
              className={selectClass}
            >
              <option value="">Semua</option>
              {KKM_KELOMPOK_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[170px]">
            <select
              value={filterDesa}
              onChange={(e) => {
                setFilterDesa(e.target.value);
                setPage(1);
              }}
              disabled={selectedPeriodeId == null}
              className={selectClass}
            >
              <option value="">Semua Desa</option>
              {desaOptions.map((d) => (
                <option key={d.id} value={d.desa}>
                  {d.desa}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[190px]">
            <select
              value={filterDplId}
              onChange={(e) => {
                setFilterDplId(e.target.value);
                setPage(1);
              }}
              disabled={selectedPeriodeId == null}
              className={selectClass}
            >
              <option value="">Semua DPL</option>
              {dplOptions.map((d) => (
                <option key={d.dosen.id} value={String(d.dosen.id)}>
                  {d.dosen.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[180px]">
            <select
              value={filterKomposisi}
              onChange={(e) => {
                setFilterKomposisi(e.target.value as "" | KkmKelompokKomposisi);
                setPage(1);
              }}
              disabled={selectedPeriodeId == null}
              className={selectClass}
            >
              <option value="">Semua Komposisi</option>
              {KKM_KELOMPOK_KOMPOSISI_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {KOMPOSISI_LABEL[k]}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetFilters}
            disabled={!filterActive || selectedPeriodeId == null}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Reset
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Menampilkan {rows.length} kelompok
          {filterActive ? " (filter aktif)" : ""}
          {periodeSelesai ? " · Periode SELESAI — edit dinonaktifkan" : ""}
        </p>
      </div>

      {/* Card grid */}
      {selectedPeriodeId == null ? (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-12 text-center text-gray-500">
            <Users size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">Pilih periode dulu</p>
            <p className="text-xs text-gray-400">
              Kelompok KKM dibuat dari jumlah desa pada periode terpilih.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-12 flex flex-col items-center gap-2 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Memuat kelompok...</span>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-12 text-center text-gray-500">
            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">Kelompok tidak ditemukan</p>
            <p className="text-xs text-gray-400">
              Coba ubah filter, atau generate kelompok dari menu Generate Kelompok.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((k) => (
              <div
                key={k.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-gray-800">{k.nama}</h3>
                  <KelompokStatusBadge status={k.status} />
                </div>

                <p className="text-xs text-gray-500">
                  DPL:{" "}
                  <span className="text-gray-700 font-medium">
                    {k.dpl_name?.trim() ? k.dpl_name : "Belum ada DPL"}
                  </span>
                </p>

                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin size={13} className="text-gray-400" />
                  {k.lokasi.desa}
                  {k.lokasi.kecamatan ? `, ${k.lokasi.kecamatan}` : ""}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-gray-700 font-semibold">
                    <Users size={13} className="text-gray-400" />
                    {k.jumlah_anggota} / {k.lokasi.kuota} anggota
                  </span>
                  <span className="font-semibold text-gray-600">
                    {Math.round(k.persentase_terisi || 0)}%
                  </span>
                </div>
                <FilledProgressBar percent={k.persentase_terisi} />

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <GenderCount laki={k.gender?.laki ?? 0} perempuan={k.gender?.perempuan ?? 0} />
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-green-500" />
                    {k.terverifikasi}/{k.jumlah_anggota} terverifikasi
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(k.prodi || []).slice(0, 5).map((p) => (
                    <span
                      key={p.nama}
                      className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600"
                    >
                      {p.nama}
                    </span>
                  ))}
                  {(k.prodi || []).length > 5 && (
                    <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-400">
                      +{k.prodi.length - 5} lainnya
                    </span>
                  )}
                </div>

                <KomposisiBadge komposisi={k.komposisi} />

                <div className="no-print grid grid-cols-3 gap-2 pt-1 mt-auto">
                  <button
                    onClick={() => navigate(`/admin-dashboard/kkm/kelompok/${k.id}`)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Eye size={14} />
                    Detail
                  </button>
                  <button
                    onClick={() => navigate(`/admin-dashboard/kkm/kelompok/${k.id}/edit`)}
                    disabled={!isAdmin || periodeSelesai}
                    title={
                      !isAdmin
                        ? "Hanya ADMIN LPPM"
                        : periodeSelesai
                          ? "Periode SELESAI — tidak bisa diedit"
                          : undefined
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Printer size={14} />
                    Cetak
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="no-print mt-4 bg-white rounded-xl border border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Total {meta.totalData} kelompok · Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Sebelumnya
              </button>
              <span className="px-3 py-1 text-sm font-medium bg-red-600 text-white rounded-lg">
                {currentPage}
              </span>
              {totalPages > 1 && <span className="text-sm text-gray-500">/ {totalPages}</span>}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Selanjutnya <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

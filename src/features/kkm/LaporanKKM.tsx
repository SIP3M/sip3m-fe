import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  RotateCcw,
  Search,
} from "lucide-react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePermission } from "@/features/auth/usePermission";
import { PERMISSIONS } from "@/constant/permissions";
import {
  bulkApproveLaporan,
  downloadLaporanZip,
  exportLaporanExcel,
  getLaporanDetail,
  getLaporanList,
  reviewLaporan,
} from "./kkmLaporan.api";
import type {
  JenisLaporan,
  KkmLaporanParams,
  KkmLaporanRow,
  KkmLaporanStats,
  StatusLaporan,
} from "./kkmLaporan.types";
import { formatBerkasSize } from "./kkmLogbookKelompok.types";

// =====================================================================
// Laporan KKM — halaman review laporan kelompok (Awal/Mingguan/Akhir).
// Data asli dari GET /kkm/laporan. Untuk role DOSEN (DPL), scope kelompok
// bimbingan dipaksa server-side → halaman identik dengan admin.
// =====================================================================

type TabKey = "semua" | StatusLaporan;

const EMPTY_STATS: KkmLaporanStats = {
  BELUM_UPLOAD: 0,
  MENUNGGU_REVIEW: 0,
  DISETUJUI: 0,
  REVISI: 0,
  TERLAMBAT: 0,
  total: 0,
};

const STATUS_META: Record<
  StatusLaporan,
  { label: string; bg: string; text: string; Icon: typeof Clock }
> = {
  BELUM_UPLOAD: { label: "Belum Upload", bg: "bg-gray-100", text: "text-gray-600", Icon: Clock },
  MENUNGGU_REVIEW: { label: "Menunggu Review", bg: "bg-yellow-50", text: "text-yellow-700", Icon: Clock },
  DISETUJUI: { label: "Disetujui", bg: "bg-green-50", text: "text-green-700", Icon: CheckCircle2 },
  REVISI: { label: "Revisi", bg: "bg-red-50", text: "text-red-600", Icon: RotateCcw },
  TERLAMBAT: { label: "Terlambat", bg: "bg-orange-50", text: "text-orange-600", Icon: AlertTriangle },
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "BELUM_UPLOAD", label: "Belum Upload" },
  { key: "MENUNGGU_REVIEW", label: "Menunggu Review" },
  { key: "DISETUJUI", label: "Disetujui" },
  { key: "REVISI", label: "Revisi" },
  { key: "TERLAMBAT", label: "Terlambat" },
];

const DONUT_SEGMENTS: { key: StatusLaporan; label: string; color: string }[] = [
  { key: "DISETUJUI", label: "Disetujui", color: "#22c55e" },
  { key: "MENUNGGU_REVIEW", label: "Menunggu Review", color: "#f59e0b" },
  { key: "REVISI", label: "Revisi", color: "#ef4444" },
  { key: "BELUM_UPLOAD", label: "Belum Upload", color: "#9ca3af" },
  { key: "TERLAMBAT", label: "Terlambat", color: "#ea580c" },
];

const JENIS_OPTIONS: { value: JenisLaporan; label: string }[] = [
  { value: "LAPORAN_AWAL", label: "Laporan Awal" },
  { value: "LAPORAN_MINGGUAN", label: "Laporan Mingguan" },
  { value: "LAPORAN_AKHIR", label: "Laporan Akhir" },
];

const STAT_CARDS: {
  key: StatusLaporan;
  label: string;
  Icon: typeof Clock;
  iconColor: string;
  bg: string;
  border: string;
  valueColor: string;
}[] = [
  { key: "BELUM_UPLOAD", label: "Belum Upload", Icon: Clock, iconColor: "text-gray-400", bg: "bg-gray-50", border: "border-gray-100", valueColor: "text-gray-700" },
  { key: "MENUNGGU_REVIEW", label: "Menunggu Review", Icon: Clock, iconColor: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-100", valueColor: "text-yellow-700" },
  { key: "DISETUJUI", label: "Disetujui", Icon: CheckCircle2, iconColor: "text-green-500", bg: "bg-green-50", border: "border-green-100", valueColor: "text-green-600" },
  { key: "REVISI", label: "Revisi", Icon: RotateCcw, iconColor: "text-red-500", bg: "bg-red-50", border: "border-red-100", valueColor: "text-red-600" },
  { key: "TERLAMBAT", label: "Terlambat Upload", Icon: AlertTriangle, iconColor: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100", valueColor: "text-orange-600" },
];

const fmtTanggal = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";

const fmtUkuran = (bytes: number | null): string => formatBerkasSize(bytes);

// ==================== SUB COMPONENTS ====================

function StatCard({
  label,
  value,
  Icon,
  iconColor,
  bg,
  border,
  valueColor,
}: {
  label: string;
  value: number;
  Icon: typeof Clock;
  iconColor: string;
  bg: string;
  border: string;
  valueColor: string;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <Icon size={14} className={iconColor} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusLaporan }) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

function DonutChart({ stats }: { stats: KkmLaporanStats }) {
  const total = stats.total;
  if (total === 0) {
    return (
      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-gray-400">Kosong</span>
      </div>
    );
  }
  // Akumulasi kumulatif per segmen tanpa mutable accumulator.
  const cumulatives = DONUT_SEGMENTS.reduce<number[]>((acc, s) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    return [...acc, prev + stats[s.key]];
  }, []);
  const parts = DONUT_SEGMENTS.map((s, i) => {
    const start = ((cumulatives[i] - stats[s.key]) / total) * 100;
    const end = (cumulatives[i] / total) * 100;
    return `${s.color} ${start}% ${end}%`;
  });
  return (
    <div
      className="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: `conic-gradient(${parts.join(", ")})` }}
    >
      <div className="w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-800">{total}</span>
        <span className="text-[10px] text-gray-400">laporan</span>
      </div>
    </div>
  );
}

function DesaProgressBar({
  items,
}: {
  items: { desa: string; total: number; terupload: number; persentase: number }[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400">Belum ada data desa.</p>;
  }
  return (
    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
      {items.map((item) => (
        <div key={item.desa} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-28 flex-shrink-0 truncate" title={item.desa}>
            {item.desa}
          </span>
          <div className="flex-1 h-4 bg-gray-50 rounded relative overflow-hidden">
            <div
              className={`h-full rounded ${item.persentase >= 80 ? "bg-green-500" : item.persentase >= 50 ? "bg-yellow-400" : "bg-red-500"}`}
              style={{ width: `${item.persentase}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-14 text-right flex-shrink-0">
            {item.terupload}/{item.total} · {item.persentase}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function LaporanKKMPage({ variant = "admin" }: { variant?: "admin" | "dosen" }) {
  const { hasPermission } = usePermission();
  const canReview = hasPermission(PERMISSIONS.KKM_LAPORAN_REVIEW);
  const canExport = hasPermission(PERMISSIONS.KKM_LAPORAN_EXPORT);

  const [rows, setRows] = useState<KkmLaporanRow[]>([]);
  const [stats, setStats] = useState<KkmLaporanStats>(EMPTY_STATS);
  const [desaProgress, setDesaProgress] = useState<
    { desa: string; total: number; terupload: number; persentase: number }[]
  >([]);
  const [filterOptions, setFilterOptions] = useState<{ desa: string[]; dpl: { id: number; nama: string }[] }>({
    desa: [],
    dpl: [],
  });
  const [periodeOptions, setPeriodeOptions] = useState<
    { id: number; nama_periode: string; status: string }[]
  >([]);
  const [periode, setPeriode] = useState<{
    id: number;
    nama_periode: string;
    tahun_akademik: string;
    status: string;
  } | null>(null);
  const [meta, setMeta] = useState<{ totalData: number; totalPages: number; currentPage: number; limit: number } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state — semua query opsional ke GET /kkm/laporan
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [periodeId, setPeriodeId] = useState<number | null>(null);
  const [jenisFilter, setJenisFilter] = useState<JenisLaporan | "">("");
  const [desaFilter, setDesaFilter] = useState("");
  const [dplId, setDplId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Selection (dihapus saat query berubah — hanya baris menunggu review)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal detail & review
  const [detailRow, setDetailRow] = useState<KkmLaporanRow | null>(null);
  const [detailData, setDetailData] = useState<KkmLaporanRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [revisiRow, setRevisiRow] = useState<KkmLaporanRow | null>(null);
  const [catatan, setCatatan] = useState("");
  const [catatanError, setCatatanError] = useState<string | null>(null);
  const [confirmRow, setConfirmRow] = useState<KkmLaporanRow | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Debounce pencarian (500ms) + reset halaman
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Ambil daftar laporan
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getLaporanList({
          periode_id: periodeId ?? undefined,
          page,
          search: search || undefined,
          status: activeTab === "semua" ? undefined : activeTab,
          jenis: jenisFilter || undefined,
          desa: desaFilter || undefined,
          dpl_id: dplId ?? undefined,
        });
        if (cancelled) return;
        setRows(res.data.data);
        setStats(res.data.stats);
        setDesaProgress(res.data.progress_desa);
        setFilterOptions(res.data.filters);
        setPeriodeOptions(res.data.periode_options);
        setPeriode(res.data.periode);
        setMeta(res.data.meta);
        setSelectedIds([]);
        // Pengaman: page di luar range → tarik ke halaman terakhir yang valid
        if (res.data.meta.totalData > 0 && res.data.meta.currentPage > res.data.meta.totalPages) {
          setPage(res.data.meta.totalPages);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };
        const status = e.response?.status;
        setError(
          status === 403
            ? "Akses ditolak — halaman laporan hanya untuk Ketua LPPM / Staff LPPM / DPL."
            : e.response?.data?.message ||
              e.message ||
              "Gagal memuat daftar laporan KKM.",
        );
        setRows([]);
        setMeta(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [periodeId, page, search, activeTab, jenisFilter, desaFilter, dplId]);

  const currentPage = meta?.currentPage ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const hasFilter = Boolean(
    search || activeTab !== "semua" || jenisFilter || desaFilter || dplId !== null,
  );

  const counts: Record<TabKey, number> = {
    semua: stats.total,
    BELUM_UPLOAD: stats.BELUM_UPLOAD,
    MENUNGGU_REVIEW: stats.MENUNGGU_REVIEW,
    DISETUJUI: stats.DISETUJUI,
    REVISI: stats.REVISI,
    TERLAMBAT: stats.TERLAMBAT,
  };

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const changePeriode = (value: string) => {
    setPeriodeId(value ? Number(value) : null);
    setDesaFilter("");
    setDplId(null);
    setPage(1);
  };

  const changeJenis = (value: string) => {
    setJenisFilter(value as JenisLaporan | "");
    setPage(1);
  };

  const changeDesa = (value: string) => {
    setDesaFilter(value);
    setPage(1);
  };

  const changeDpl = (value: string) => {
    setDplId(value ? Number(value) : null);
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const currentParams = (): KkmLaporanParams => ({
    periode_id: periodeId ?? undefined,
    search: search || undefined,
    status: activeTab === "semua" ? undefined : activeTab,
    jenis: jenisFilter || undefined,
    desa: desaFilter || undefined,
    dpl_id: dplId ?? undefined,
  });

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      const blob = await exportLaporanExcel(currentParams());
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `laporan-kkm-${stamp}.xlsx`);
      setToast({ type: "success", text: "Export Excel berhasil diunduh." });
    } catch {
      setToast({ type: "error", text: "Gagal export laporan." });
    }
  };

  const handleZip = async () => {
    try {
      const blob = await downloadLaporanZip(currentParams());
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `laporan-kkm-${stamp}.zip`);
      setToast({ type: "success", text: "ZIP laporan berhasil diunduh." });
    } catch {
      setToast({ type: "error", text: "Gagal mengunduh ZIP laporan." });
    }
  };

  const openDetail = async (row: KkmLaporanRow) => {
    setDetailRow(row);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await getLaporanDetail(row.kelompok_id, row.jenis);
      setDetailData(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setToast({
        type: "error",
        text: e.response?.data?.message || "Gagal memuat detail laporan.",
      });
      setDetailRow(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const doReview = async (
    row: KkmLaporanRow,
    status: "DISETUJUI" | "REVISI",
    note?: string,
  ) => {
    setActionLoading(true);
    try {
      const res = await reviewLaporan({
        kelompok_id: row.kelompok_id,
        jenis: row.jenis,
        status,
        catatan: note,
      });
      setToast({ type: "success", text: res.message });
      setConfirmRow(null);
      setRevisiRow(null);
      setCatatan("");
      // Refresh daftar + detail (bila modal terbuka)
      const refreshed = await getLaporanList({
        periode_id: periodeId ?? undefined,
        page,
        search: search || undefined,
        status: activeTab === "semua" ? undefined : activeTab,
        jenis: jenisFilter || undefined,
        desa: desaFilter || undefined,
        dpl_id: dplId ?? undefined,
      });
      setRows(refreshed.data.data);
      setStats(refreshed.data.stats);
      setDesaProgress(refreshed.data.progress_desa);
      setMeta(refreshed.data.meta);
      if (detailRow && detailRow.kelompok_id === row.kelompok_id && detailRow.jenis === row.jenis) {
        try {
          const d = await getLaporanDetail(row.kelompok_id, row.jenis);
          setDetailData(d.data);
        } catch {
          // biarkan data lama pada modal
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setToast({
        type: "error",
        text: e.response?.data?.message || "Gagal me-review laporan.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const submitRevisi = () => {
    if (!revisiRow) return;
    const trimmed = catatan.trim();
    if (trimmed.length < 3) {
      setCatatanError("Catatan revisi wajib diisi minimal 3 karakter.");
      return;
    }
    setCatatanError(null);
    void doReview(revisiRow, "REVISI", trimmed);
  };

  const handleBulkApprove = async () => {
    const items = rows
      .filter((r) => selectedIds.includes(r.id))
      .map((r) => ({ kelompok_id: r.kelompok_id, jenis: r.jenis }));
    if (items.length === 0) {
      setConfirmBulk(false);
      return;
    }
    setActionLoading(true);
    try {
      const res = await bulkApproveLaporan({ items });
      setToast({ type: "success", text: res.message });
      setSelectedIds([]);
      setConfirmBulk(false);
      const refreshed = await getLaporanList({
        periode_id: periodeId ?? undefined,
        page,
        search: search || undefined,
        status: activeTab === "semua" ? undefined : activeTab,
        jenis: jenisFilter || undefined,
        desa: desaFilter || undefined,
        dpl_id: dplId ?? undefined,
      });
      setRows(refreshed.data.data);
      setStats(refreshed.data.stats);
      setDesaProgress(refreshed.data.progress_desa);
      setMeta(refreshed.data.meta);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setToast({
        type: "error",
        text: e.response?.data?.message || "Gagal menyetujui laporan massal.",
      });
      setConfirmBulk(false);
    } finally {
      setActionLoading(false);
    }
  };

  const isDosen = variant === "dosen";

  return (
    <div className={isDosen ? "space-y-6" : "p-6 bg-gray-50 min-h-screen"}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan KKM</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isDosen
              ? "Review dan supervisi laporan kelompok bimbingan"
              : "Validasi dan manajemen laporan kelompok KKM"}
          </p>
          {periode && (
            <p className="text-sm font-medium text-gray-700 mt-1.5">
              {periode.nama_periode} · T.A. {periode.tahun_akademik}
            </p>
          )}
        </div>
        {canExport && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleExport()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Export Excel
            </button>
            <button
              onClick={() => void handleZip()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Archive size={16} />
              Download ZIP
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={stats[card.key]}
            Icon={card.Icon}
            iconColor={card.iconColor}
            bg={card.bg}
            border={card.border}
            valueColor={card.valueColor}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Distribusi Status Laporan</h3>
          <div className="flex items-center gap-8">
            <DonutChart stats={stats} />
            <div className="space-y-2">
              {DONUT_SEGMENTS.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-gray-600 w-32">{s.label}</span>
                  <span className="font-semibold text-gray-800">{stats[s.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Progress Upload per Desa
          </h3>
          <DesaProgressBar items={desaProgress} />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari kelompok, desa, DPL, atau nama file..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="relative">
            <select
              value={periodeId ?? ""}
              onChange={(e) => changePeriode(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Periode aktif (otomatis)</option>
              {periodeOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_periode}
                  {p.status === "AKTIF" ? " · AKTIF" : ""}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={jenisFilter}
              onChange={(e) => changeJenis(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Semua Jenis</option>
              {JENIS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={dplId ?? ""}
              onChange={(e) => changeDpl(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Semua DPL</option>
              {filterOptions.dpl.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={desaFilter}
              onChange={(e) => changeDesa(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Semua Desa</option>
              {filterOptions.desa.map((nama) => (
                <option key={nama} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => changeTab(tab.key)}
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
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {canReview && selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-700">
              {selectedIds.length} laporan dipilih
            </span>
            <button
              onClick={() => setConfirmBulk(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Check size={13} />
              Setujui Massal
            </button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Batal pilih
          </button>
        </div>
      )}

      {/* Belum ada periode aktif */}
      {meta && !periode && !isLoading && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Belum ada periode aktif. Aktifkan satu periode KKM untuk melihat data laporan.
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-10 px-6 py-3" />
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-3">Kelompok</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Desa / DPL</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Jenis Laporan</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">File</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Deadline</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4" colSpan={8}>
                      <div className="h-5 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-gray-400" colSpan={8}>
                    {!meta
                      ? error || "Tidak ada data laporan."
                      : meta.totalData === 0
                        ? hasFilter
                          ? "Tidak ada laporan yang cocok dengan filter."
                          : periode
                            ? "Belum ada laporan pada periode ini."
                            : "Belum ada data laporan — belum ada periode aktif."
                        : "Halaman tidak tersedia — memuat ulang…"}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const selectable = row.status === "MENUNGGU_REVIEW";
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {canReview && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row.id)}
                            disabled={!selectable}
                            onChange={() => toggleSelect(row.id)}
                            title={
                              selectable
                                ? undefined
                                : "Hanya laporan menunggu review yang bisa dipilih"
                            }
                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-30"
                          />
                        )}
                      </td>
                      <td className="px-2 py-4">
                        <p className="text-sm font-semibold text-gray-800">{row.kelompok}</p>
                        <p className="text-xs text-gray-400">{row.kecamatan}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">{row.desa}</p>
                        <p className="text-xs text-gray-400">{row.dpl.nama ?? "-"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                          {row.jenis_label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {row.file ? (
                          <div>
                            <p className="text-sm text-gray-700 max-w-44 truncate" title={row.file.nama}>
                              {row.file.nama}
                            </p>
                            <p className="text-xs text-gray-400">
                              {fmtUkuran(row.file.ukuran)} · {fmtTanggal(row.upload_date)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Belum upload</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{row.deadline_tampil ?? "Tanpa batas"}</p>
                        {row.deadline_note && (
                          <p
                            className={`flex items-center gap-1 text-xs mt-0.5 ${
                              row.deadline_note.type === "danger" ? "text-red-500" : "text-orange-500"
                            }`}
                          >
                            <AlertTriangle size={11} />
                            {row.deadline_note.text}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => void openDetail(row)}
                            title="Lihat detail"
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          {canReview && row.status === "MENUNGGU_REVIEW" && (
                            <>
                              <button
                                onClick={() => setConfirmRow(row)}
                                title="Setujui"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  setRevisiRow(row);
                                  setCatatan("");
                                  setCatatanError(null);
                                }}
                                title="Minta revisi"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <RotateCcw size={15} />
                              </button>
                            </>
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

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Menampilkan <span className="font-semibold text-gray-700">{rows.length}</span> dari{" "}
              <span className="font-semibold text-gray-700">{meta.totalData}</span> laporan
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={isLoading || currentPage <= 1}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading || isActive}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-semibold rounded-lg transition-colors ${
                      isActive ? "text-white bg-red-600" : "text-gray-500 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={isLoading || currentPage >= totalPages}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      <Dialog
        open={Boolean(detailRow)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailRow(null);
            setDetailData(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
            <DialogDescription>
              {detailRow
                ? `${detailRow.kelompok} — ${detailRow.jenis_label}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-3">
              <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-40 animate-pulse rounded bg-gray-100" />
            </div>
          ) : detailData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Desa / Kecamatan</p>
                  <p className="font-medium text-gray-800">
                    {detailData.desa} · {detailData.kecamatan}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">DPL</p>
                  <p className="font-medium text-gray-800">{detailData.dpl.nama ?? "-"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={detailData.status} />
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Deadline</p>
                  <p className="font-medium text-gray-800">
                    {detailData.deadline_tampil ?? "Tanpa batas"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Diunggah</p>
                  <p className="font-medium text-gray-800">
                    {detailData.upload_date ? fmtTanggal(detailData.upload_date) : "Belum upload"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Reviewer</p>
                  <p className="font-medium text-gray-800">
                    {detailData.reviewed_by
                      ? `${detailData.reviewed_by} · ${fmtTanggal(detailData.reviewed_at)}`
                      : "-"}
                  </p>
                </div>
              </div>

              {detailData.catatan_revisi && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                  <p className="text-xs font-semibold text-red-600">Catatan Revisi Terakhir</p>
                  <p className="text-sm text-red-700 mt-1">{detailData.catatan_revisi}</p>
                </div>
              )}

              {detailData.file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {detailData.file.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fmtUkuran(detailData.file.ukuran)} · oleh {detailData.file.diunggah_oleh}
                      </p>
                    </div>
                    <a
                      href={detailData.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <FileText size={13} />
                      Buka PDF
                    </a>
                  </div>
                  <iframe
                    src={detailData.file.url}
                    title={`Preview ${detailData.file.nama}`}
                    className="w-full h-80 rounded-lg border border-gray-200"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400">Belum ada file yang diunggah.</p>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <button
              onClick={() => {
                setDetailRow(null);
                setDetailData(null);
              }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Tutup
            </button>
            {canReview && detailData?.status === "MENUNGGU_REVIEW" && (
              <>
                <button
                  onClick={() => {
                    setRevisiRow(detailData);
                    setCatatan("");
                    setCatatanError(null);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <RotateCcw size={14} />
                  Minta Revisi
                </button>
                <button
                  onClick={() => setConfirmRow(detailData)}
                  className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Check size={14} />
                  Setujui
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Setujui (tunggal) */}
      <ConfirmDialog
        open={Boolean(confirmRow)}
        onOpenChange={(open) => !actionLoading && setConfirmRow(open ? confirmRow : null)}
        title="Setujui Laporan?"
        description={
          confirmRow
            ? `${confirmRow.kelompok} — ${confirmRow.jenis_label} akan ditandai disetujui.`
            : ""
        }
        confirmLabel="Setujui"
        cancelLabel="Batal"
        isLoading={actionLoading}
        variant="default"
        onConfirm={() => confirmRow && void doReview(confirmRow, "DISETUJUI")}
      />

      {/* Modal Konfirmasi Setujui Massal */}
      <ConfirmDialog
        open={confirmBulk}
        onOpenChange={(open) => !actionLoading && setConfirmBulk(open)}
        title="Setujui Massal?"
        description={`${selectedIds.length} laporan menunggu review akan ditandai disetujui.`}
        confirmLabel="Setujui Semua"
        cancelLabel="Batal"
        isLoading={actionLoading}
        variant="default"
        onConfirm={() => void handleBulkApprove()}
      />

      {/* Modal Revisi (catatan wajib) */}
      <Dialog
        open={Boolean(revisiRow)}
        onOpenChange={(open) => {
          if (!actionLoading) {
            setRevisiRow(open ? revisiRow : null);
            if (!open) setCatatanError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Minta Revisi Laporan</DialogTitle>
            <DialogDescription>
              {revisiRow ? `${revisiRow.kelompok} — ${revisiRow.jenis_label}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="catatan-revisi" className="text-sm font-medium text-gray-700">
              Catatan Revisi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="catatan-revisi"
              value={catatan}
              onChange={(e) => {
                setCatatan(e.target.value);
                if (catatanError) setCatatanError(null);
              }}
              rows={4}
              maxLength={500}
              placeholder="Jelaskan bagian laporan yang harus diperbaiki..."
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                catatanError ? "border-red-300 bg-red-50/40" : "border-gray-300"
              }`}
            />
            <div className="flex items-center justify-between">
              <p className={`text-xs ${catatanError ? "text-red-600" : "text-gray-400"}`}>
                {catatanError ?? "Wajib diisi minimal 3 karakter."}
              </p>
              <p className="text-xs text-gray-400">{catatan.length}/500</p>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setRevisiRow(null);
                setCatatanError(null);
              }}
              disabled={actionLoading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              onClick={submitRevisi}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {actionLoading && <Clock size={14} className="animate-spin" />}
              Kirim Revisi
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LaporanKKM() {
  return <LaporanKKMPage variant="admin" />;
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Search,
  ChevronDown,
  Bell,
  Pin,
  Trash2,
  Calendar,
  Users,
  Eye,
  ArrowRight,
  AlertCircle,
  Clock,
  Loader2,
  Paperclip,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { usePermission } from "@/features/auth/usePermission";
import { PERMISSIONS } from "@/constant/permissions";
import { getReferensiAktif } from "@/features/master/referensi.api";
import {
  deletePengumuman,
  getPengumumanAdmin,
  getPengumumanDetail,
  publishPengumuman,
  togglePinPengumuman,
} from "./pengumuman.api";
import type {
  Pengumuman,
  PengumumanPrioritas,
  PengumumanStats,
  PengumumanTargetType,
  PengumumanListMeta,
} from "./pengumuman.types";
import IsiPengumuman from "@/components/common/IsiPengumuman";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  formatTanggalPengumuman,
  formatUkuranFile,
  ringkasIsi,
} from "@/utils/pengumuman";

const CREATE_PATH = "/admin-dashboard/kkm/pengumuman/baru";

const kategoriPalette = [
  { bg: "bg-purple-50", text: "text-purple-600" },
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-rose-50", text: "text-rose-600" },
  { bg: "bg-blue-50", text: "text-blue-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
  { bg: "bg-indigo-50", text: "text-indigo-600" },
  { bg: "bg-teal-50", text: "text-teal-600" },
];

const kategoriStyle = (kategori: string) => {
  let hash = 0;
  for (let i = 0; i < kategori.length; i += 1) {
    hash = (hash * 31 + kategori.charCodeAt(i)) % 997;
  }
  return kategoriPalette[hash % kategoriPalette.length];
};

const prioritasConfig: Record<
  PengumumanPrioritas,
  { label: string; bg: string; text: string; Icon: typeof AlertCircle }
> = {
  PENTING: {
    label: "Penting",
    bg: "bg-red-50",
    text: "text-red-600",
    Icon: AlertCircle,
  },
  SEDANG: {
    label: "Sedang",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    Icon: Clock,
  },
  INFORMASI: {
    label: "Informasi",
    bg: "bg-blue-50",
    text: "text-blue-600",
    Icon: Bell,
  },
};

const audiensOptions: { value: PengumumanTargetType; label: string }[] = [
  { value: "PESERTA", label: "Semua Peserta KKM" },
  { value: "DPL", label: "Semua DPL" },
  { value: "KELOMPOK", label: "Kelompok Tertentu" },
  { value: "DESA", label: "Desa Tertentu" },
  { value: "PERIODE", label: "Periode KKM Tertentu" },
  { value: "FAKULTAS", label: "Fakultas Tertentu" },
];

// ==================== SUB COMPONENTS ====================

function StatPill({
  label,
  value,
  bg,
  text,
}: {
  label: string;
  value: number;
  bg?: string;
  text?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${bg ?? "bg-white"} ${
        bg ? "border-transparent" : "border-gray-200"
      }`}
    >
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${text ?? "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}

function PriorityBadge({ prioritas }: { prioritas: PengumumanPrioritas }) {
  const c = prioritasConfig[prioritas] ?? prioritasConfig.INFORMASI;
  const Icon = c.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      <Icon size={12} />
      {c.label}
    </span>
  );
}

function KategoriBadge({ kategori }: { kategori: string }) {
  const c = kategoriStyle(kategori);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {kategori}
    </span>
  );
}

function StatusBadge({ status }: { status: Pengumuman["status"] }) {
  return status === "PUBLISHED" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
      <CheckCircle2 size={12} />
      Terbit
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
      <Clock size={12} />
      Terjadwal
    </span>
  );
}

// ==================== MAIN COMPONENT ====================

export default function PengumumanKKM() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermission();
  const isAdminLppm = hasPermission(PERMISSIONS.KKM_PENGUMUMAN_KELOLA);

  // ── daftar ──
  const [items, setItems] = useState<Pengumuman[]>([]);
  const [stats, setStats] = useState<PengumumanStats | null>(null);
  const [meta, setMeta] = useState<PengumumanListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(
    (location.state as { flash?: string } | null)?.flash ?? null,
  );

  // ── filter ──
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [prioritas, setPrioritas] = useState<PengumumanPrioritas | "">("");
  const [audiens, setAudiens] = useState<PengumumanTargetType | "">("");
  const [kategoriOptions, setKategoriOptions] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // ── detail ──
  const [detail, setDetail] = useState<Pengumuman | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── aksi ──
  const [deleteTarget, setDeleteTarget] = useState<Pengumuman | null>(null);
  const [publishTarget, setPublishTarget] = useState<Pengumuman | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // debounce pencarian
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // reset halaman saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, kategori, prioritas, audiens]);

  // opsi kategori dari master
  useEffect(() => {
    let alive = true;
    getReferensiAktif("KATEGORI_PENGUMUMAN")
      .then((rows) => {
        if (alive) setKategoriOptions(rows.map((r) => r.nama));
      })
      .catch(() => {
        // gagal memuat opsi filter bukan masalah kritis — daftar tetap jalan
      });
    return () => {
      alive = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPengumumanAdmin({
        page,
        search: debouncedSearch || undefined,
        kategori: kategori || undefined,
        prioritas: prioritas || undefined,
        audiens: audiens || undefined,
      });
      setItems(res.data);
      setStats(res.stats);
      setMeta(res.meta);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Gagal memuat daftar pengumuman.",
        );
      } else {
        setError("Terjadi kesalahan pada server.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, kategori, prioritas, audiens]);

  useEffect(() => {
    void load();
  }, [load]);

  // tutup pesan sukses setelah beberapa detik
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(timer);
  }, [flash]);

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    setActionError(null);
    try {
      const res = await getPengumumanDetail(id);
      setDetail(res.data);
    } catch (err) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Gagal memuat detail pengumuman."
          : "Terjadi kesalahan pada server.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setDetail(null);

  const refreshDetail = async (id: number) => {
    try {
      const res = await getPengumumanDetail(id);
      setDetail(res.data);
    } catch {
      setDetail(null);
    }
  };

  const handleTogglePin = async (item: Pengumuman) => {
    setBusy(true);
    setActionError(null);
    try {
      await togglePinPengumuman(item.id);
      await load();
      if (detail?.id === item.id) await refreshDetail(item.id);
    } catch (err) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Gagal memperbarui sematan."
          : "Terjadi kesalahan pada server.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!publishTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await publishPengumuman(publishTarget.id);
      setPublishTarget(null);
      setFlash(res.message);
      await load();
      if (detail?.id === res.data.id) await refreshDetail(res.data.id);
    } catch (err) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Gagal menerbitkan pengumuman."
          : "Terjadi kesalahan pada server.",
      );
      setPublishTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await deletePengumuman(deleteTarget.id);
      setDeleteTarget(null);
      if (detail?.id === deleteTarget.id) closeDetail();
      setFlash(res.message);
      await load();
    } catch (err) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Gagal menghapus pengumuman."
          : "Terjadi kesalahan pada server.",
      );
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const totalPages = meta?.totalPages ?? 1;
  const totalData = meta?.totalData ?? items.length;

  const emptyState = useMemo(() => {
    if (loading) return null;
    if (items.length > 0) return null;
    const adaFilter =
      debouncedSearch || kategori || prioritas || audiens || page > 1;
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
        <Bell size={28} className="mx-auto text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-600">
          {adaFilter
            ? "Tidak ada pengumuman yang cocok dengan filter."
            : "Belum ada pengumuman."}
        </p>
        {adaFilter ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setKategori("");
              setPrioritas("");
              setAudiens("");
            }}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Reset filter
          </button>
        ) : isAdminLppm ? (
          <button
            type="button"
            onClick={() => navigate(CREATE_PATH)}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Buat pengumuman pertama
          </button>
        ) : null}
      </div>
    );
  }, [loading, items.length, debouncedSearch, kategori, prioritas, audiens, page, isAdminLppm, navigate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengumuman KKM</h1>
          <p className="text-gray-500 text-sm mt-1">
            Communication hub — kelola dan broadcast pengumuman kepada seluruh
            civitas KKM
          </p>
        </div>
        {isAdminLppm && (
          <button
            type="button"
            onClick={() => navigate(CREATE_PATH)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            Buat Pengumuman
          </button>
        )}
      </div>

      {flash && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            {flash}
          </span>
          <button
            type="button"
            onClick={() => setFlash(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={15} />
          {actionError}
        </div>
      )}

      {/* Stat Pills */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <StatPill label="Total Pengumuman" value={stats?.total ?? 0} />
        <StatPill
          label="Penting"
          value={stats?.penting ?? 0}
          bg="bg-red-50"
          text="text-red-600"
        />
        <StatPill
          label="Sedang"
          value={stats?.sedang ?? 0}
          bg="bg-yellow-50"
          text="text-yellow-700"
        />
        <StatPill
          label="Dipinned"
          value={stats?.dipinned ?? 0}
          bg="bg-blue-50"
          text="text-blue-600"
        />
        <StatPill
          label="Terjadwal"
          value={stats?.terjadwal ?? 0}
          bg="bg-slate-100"
          text="text-slate-600"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengumuman..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            />
          </div>

          <div className="relative">
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={prioritas}
              onChange={(e) =>
                setPrioritas(e.target.value as PengumumanPrioritas | "")
              }
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Semua Prioritas</option>
              <option value="PENTING">Penting</option>
              <option value="SEDANG">Sedang</option>
              <option value="INFORMASI">Informasi</option>
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={audiens}
              onChange={(e) =>
                setAudiens(e.target.value as PengumumanTargetType | "")
              }
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Semua Audiens</option>
              {audiensOptions.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <span className="text-sm text-gray-400 whitespace-nowrap lg:ml-2">
            {loading ? "Memuat..." : `${totalData} pengumuman`}
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin text-red-600" />
          Memuat pengumuman...
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <AlertCircle size={28} className="mx-auto text-red-400" />
          <p className="mt-3 text-sm text-gray-600">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border p-5 relative ${
                  item.is_pinned ? "border-red-200" : "border-gray-100"
                }`}
              >
                {item.is_pinned && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mb-3">
                    <Pin size={12} />
                    DISEMATKAN
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Bell size={18} className="text-red-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-gray-800">
                          {item.judul}
                        </h3>
                        <PriorityBadge prioritas={item.prioritas} />
                        <KategoriBadge kategori={item.kategori} />
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {ringkasIsi(item.isi, 180)}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          {formatTanggalPengumuman(
                            item.published_at ?? item.created_at,
                          )}
                          {item.status === "SCHEDULED" && item.scheduled_at
                            ? ` • terbit ${formatTanggalPengumuman(item.scheduled_at)}`
                            : ""}
                        </span>
                        <span
                          className="flex items-center gap-1.5"
                          title={item.audiens.join(", ")}
                        >
                          <Users size={13} />
                          {item.audiens.length > 0
                            ? item.audiens.join(", ")
                            : "—"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye size={13} />
                          {item.dibaca}/{item.total_penerima} dibaca
                        </span>
                        {item.lampiran && (
                          <span className="flex items-center gap-1.5">
                            <Paperclip size={13} />
                            {item.lampiran.name}
                          </span>
                        )}
                        {item.created_by && (
                          <span className="flex items-center gap-1.5">
                            oleh {item.created_by}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAdminLppm && (
                    <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleTogglePin(item)}
                        title={item.is_pinned ? "Lepas sematan" : "Sematkan"}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          item.is_pinned
                            ? "bg-red-50 text-red-500"
                            : "text-gray-300 hover:text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <Pin size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setDeleteTarget(item)}
                        title="Hapus pengumuman"
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 mt-3">
                  {isAdminLppm && item.status === "SCHEDULED" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setPublishTarget(item)}
                      className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Send size={14} />
                      Terbitkan sekarang
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void openDetail(item.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Baca Selengkapnya
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {emptyState}

          {/* Pagination */}
          {totalPages > 1 && items.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-gray-500">
                Halaman {meta?.currentPage ?? page} dari {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Berikutnya
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL DETAIL */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeDetail}
            aria-hidden
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 flex items-start justify-between gap-4 bg-white border-b border-gray-100 px-6 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {detail && (
                    <>
                      <PriorityBadge prioritas={detail.prioritas} />
                      <KategoriBadge kategori={detail.kategori} />
                      <StatusBadge status={detail.status} />
                    </>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-bold text-gray-900">
                  {detailLoading ? "Memuat detail..." : detail?.judul}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              {detailLoading || !detail ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                  <Loader2 size={18} className="animate-spin text-red-600" />
                  Memuat detail...
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {detail.status === "PUBLISHED"
                        ? `Terbit ${formatTanggalPengumuman(detail.published_at)}`
                        : `Dijadwalkan ${formatTanggalPengumuman(detail.scheduled_at)}`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={13} />
                      {detail.audiens.join(", ") || "—"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} />
                      {detail.dibaca}/{detail.total_penerima} dibaca
                    </span>
                    {detail.created_by && (
                      <span className="flex items-center gap-1.5">
                        dibuat oleh {detail.created_by}
                      </span>
                    )}
                  </div>

                  <IsiPengumuman
                    isi={detail.isi}
                    className="text-sm text-gray-600"
                  />

                  {detail.lampiran && (
                    <a
                      href={detail.lampiran.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Paperclip size={16} className="text-red-500" />
                      <span className="flex-1 truncate">
                        {detail.lampiran.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatUkuranFile(detail.lampiran.size)}
                      </span>
                    </a>
                  )}
                </>
              )}
            </div>

            {detail && isAdminLppm && (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleTogglePin(detail)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Pin size={15} />
                  {detail.is_pinned ? "Lepas Sematan" : "Sematkan"}
                </button>
                {detail.status === "SCHEDULED" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setPublishTarget(detail)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50"
                  >
                    <Send size={15} />
                    Terbitkan sekarang
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDeleteTarget(detail)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KONFIRMASI HAPUS */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Pengumuman?"
        description={
          <>
            Pengumuman <strong>{deleteTarget?.judul}</strong> beserta lampiran,
            catatan penerima, dan notifikasi yang sudah terkirim akan dihapus
            permanen.
          </>
        }
        confirmLabel="Hapus"
        isLoading={busy}
        onConfirm={() => void handleDelete()}
      />

      {/* KONFIRMASI TERBITKAN */}
      <ConfirmDialog
        open={!!publishTarget}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        title="Terbitkan Pengumuman?"
        description={
          <>
            Pengumuman <strong>{publishTarget?.judul}</strong> akan langsung
            disebar ke {publishTarget?.total_penerima || "seluruh"} penerima dan
            memicu notifikasi in-app. Tindakan ini tidak dapat dibatalkan.
          </>
        }
        confirmLabel="Terbitkan"
        variant="default"
        isLoading={busy}
        onConfirm={() => void handlePublish()}
      />
    </div>
  );
}

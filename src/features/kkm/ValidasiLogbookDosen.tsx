import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLogbookValidasi, reviewLogbook } from "@/features/kkm/kkmLogbook.api";
import {
  type KkmLogbookStatus,
  type KkmLogbookValidasiRow,
} from "@/features/kkm/kkmLogbook.types";

// =====================================================================
// Halaman "Validasi Logbook" DPL — GET /kkm/logbook/validasi (lintas
// kelompok bimbingan). Aksi cepat: ✓ Setujui (konfirmasi), ⟳ Minta
// Revisi (modal catatan wajib); mata → halaman detail.
// =====================================================================

type TabKey = "semua" | KkmLogbookStatus;

const STATUS_DOT: Record<
  KkmLogbookStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  PENDING: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  REVISI: { label: "Revisi", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

const formatTanggal = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  return fallback;
};

export default function ValidasiLogbookDosen() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<KkmLogbookValidasiRow[]>([]);
  const [stats, setStats] = useState({ menunggu: 0, approved: 0, revisi: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<TabKey>("semua");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Aksi cepat
  const [approveTarget, setApproveTarget] = useState<KkmLogbookValidasiRow | null>(null);
  const [revisiTarget, setRevisiTarget] = useState<KkmLogbookValidasiRow | null>(null);
  const [revisiCatatan, setRevisiCatatan] = useState("");
  const [actError, setActError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Debounce pencarian
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getLogbookValidasi({
        page,
        ...(tab === "semua" ? {} : { status: tab }),
        ...(search ? { search } : {}),
      });
      setRows(res.data);
      setStats(res.stats);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Gagal memuat daftar validasi logbook."));
    } finally {
      setIsLoading(false);
    }
  }, [page, tab, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "semua", label: "Semua", count: stats.menunggu + stats.approved + stats.revisi },
    { key: "PENDING", label: "Pending", count: stats.menunggu },
    { key: "APPROVED", label: "Approved", count: stats.approved },
    { key: "REVISI", label: "Revisi", count: stats.revisi },
  ];

  const handleApprove = async () => {
    if (!approveTarget) return;
    setIsActing(true);
    setActError(null);
    try {
      await reviewLogbook(approveTarget.kelompok_id, approveTarget.id, { status: "APPROVED" });
      setApproveTarget(null);
      showToast(`Logbook ${approveTarget.mahasiswa.nama} disetujui.`);
      await load();
    } catch (err) {
      setActError(getErrorMessage(err, "Gagal menyetujui logbook."));
    } finally {
      setIsActing(false);
    }
  };

  const openRevisi = (row: KkmLogbookValidasiRow) => {
    setRevisiTarget(row);
    setRevisiCatatan("");
    setActError(null);
  };

  const handleRevisi = async () => {
    if (!revisiTarget) return;
    if (revisiCatatan.trim().length < 3) {
      setActError("Catatan wajib diisi minimal 3 karakter.");
      return;
    }
    setIsActing(true);
    setActError(null);
    try {
      await reviewLogbook(revisiTarget.kelompok_id, revisiTarget.id, {
        status: "REVISI",
        catatan: revisiCatatan.trim(),
      });
      setRevisiTarget(null);
      showToast(`Revisi diminta untuk logbook ${revisiTarget.mahasiswa.nama}.`);
      await load();
    } catch (err) {
      setActError(getErrorMessage(err, "Gagal meminta revisi logbook."));
    } finally {
      setIsActing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validasi Logbook</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review dan validasi logbook kegiatan mahasiswa KKM
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Menunggu Validasi</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.menunggu}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Approved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Revisi</span>
            <RotateCcw size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.revisi}</p>
        </div>
      </div>

      {/* Filter Tabs + pencarian */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                tab === t.key
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama / judul / kelompok..."
          className="h-9 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          {toast}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2" aria-busy="true" aria-label="Memuat daftar logbook">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && loadError && (
        <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
          <RefreshCw size={22} className="text-red-500" />
          <p className="mt-3 text-sm font-medium text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer"
          >
            <RefreshCw size={15} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !loadError && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/40 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">MAHASISWA</th>
                  <th className="py-4 px-6 font-semibold">KELOMPOK</th>
                  <th className="py-4 px-6 font-semibold">TANGGAL</th>
                  <th className="py-4 px-6 font-semibold">AKTIVITAS</th>
                  <th className="py-4 px-6 font-semibold">STATUS</th>
                  <th className="py-4 px-6 font-semibold text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center text-sm text-gray-400">
                      {search
                        ? `Tidak ada logbook yang cocok dengan pencarian "${search}".`
                        : "Belum ada entri logbook untuk divalidasi."}
                    </td>
                  </tr>
                )}

                {rows.map((row) => {
                  const cfg = STATUS_DOT[row.status];
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-5 px-6 font-bold text-gray-900 whitespace-nowrap">
                        {row.mahasiswa.nama}
                        <p className="mt-0.5 text-xs font-normal text-gray-400">
                          {row.mahasiswa.nim ?? "-"}
                        </p>
                      </td>
                      <td className="py-5 px-6 text-gray-600 whitespace-nowrap">
                        {row.kelompok.nama}
                        <p className="mt-0.5 text-xs text-gray-400">{row.kelompok.desa}</p>
                      </td>
                      <td className="py-5 px-6 text-gray-600 whitespace-nowrap">
                        {formatTanggal(row.tanggal)}
                      </td>
                      <td className="py-5 px-6 text-gray-700">
                        <p className="font-medium">{row.judul}</p>
                        <p className="mt-0.5 max-w-sm truncate text-xs text-gray-400">
                          {row.deskripsi}
                        </p>
                      </td>
                      <td className="py-5 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/dosen-dashboard/kkm/validasi-logbook/${row.id}`)
                            }
                            className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer inline-flex items-center justify-center"
                            title="Lihat Detail"
                          >
                            <Eye size={17} />
                          </button>
                          {row.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setApproveTarget(row)}
                                className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50 cursor-pointer inline-flex items-center justify-center"
                                title="Setujui"
                              >
                                <Check size={17} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openRevisi(row)}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer inline-flex items-center justify-center"
                                title="Minta Revisi"
                              >
                                <RotateCcw size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
              <p className="text-xs text-gray-400">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal konfirmasi Setujui */}
      <Dialog open={approveTarget !== null} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl bg-white p-6 sm:max-w-md">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Setujui Logbook?
          </DialogTitle>
          {approveTarget && (
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">{approveTarget.judul}</span> oleh{" "}
              {approveTarget.mahasiswa.nama} akan disetujui.
            </p>
          )}
          {actError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
              {actError}
            </p>
          )}
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setApproveTarget(null)}
              disabled={isActing}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleApprove()}
              disabled={isActing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 cursor-pointer disabled:opacity-60"
            >
              {isActing && <Loader2 size={15} className="animate-spin" />}
              {isActing ? "Menyimpan..." : "Setujui"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Minta Revisi (catatan wajib) */}
      <Dialog open={revisiTarget !== null} onOpenChange={(o) => !o && setRevisiTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl bg-white p-6 sm:max-w-md">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Minta Revisi Logbook
          </DialogTitle>
          {revisiTarget && (
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">{revisiTarget.judul}</span> oleh{" "}
              {revisiTarget.mahasiswa.nama}
            </p>
          )}
          <div className="mt-4">
            <label
              htmlFor="revisi-catatan"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Catatan untuk Mahasiswa <span className="text-red-500">*</span>
            </label>
            <textarea
              id="revisi-catatan"
              rows={4}
              value={revisiCatatan}
              onChange={(e) => {
                setRevisiCatatan(e.target.value);
                setActError(null);
              }}
              placeholder="Tulis catatan untuk mahasiswa..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>
          {actError && (
            <p className="mt-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
              {actError}
            </p>
          )}
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setRevisiTarget(null)}
              disabled={isActing}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleRevisi()}
              disabled={isActing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer disabled:opacity-60"
            >
              {isActing && <Loader2 size={15} className="animate-spin" />}
              {isActing ? "Menyimpan..." : "Kirim Revisi"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

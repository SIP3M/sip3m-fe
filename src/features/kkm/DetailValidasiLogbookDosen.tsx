import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { getLogbookValidasiDetail, reviewLogbook } from "@/features/kkm/kkmLogbook.api";
import {
  formatLogbookFileSize,
  type KkmLogbookStatus,
  type GetLogbookValidasiDetailResponse,
} from "@/features/kkm/kkmLogbook.types";

// =====================================================================
// Halaman detail "Validasi Logbook" DPL — GET /kkm/logbook/validasi/:id.
// Dokumen logbook ditampilkan sebagai PDF (embed pratinjau + tombol
// buka di tab baru), menggantikan kartu foto dokumentasi. Aksi: Setujui
// (konfirmasi) & Minta Revisi (catatan wajib) → PATCH review.
// =====================================================================

type Detail = GetLogbookValidasiDetailResponse["data"];

const STATUS_CONFIG: Record<
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

export default function DetailValidasiLogbookDosen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const entryId = Number(id);

  const [detail, setDetail] = useState<Detail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [catatan, setCatatan] = useState("");
  const [actError, setActError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [isConfirmApprove, setIsConfirmApprove] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isInteger(entryId) || entryId <= 0) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    setNotFound(false);
    try {
      const res = await getLogbookValidasiDetail(entryId);
      setDetail(res.data);
      // Prefill catatan dgn catatan revisi terakhir agar DPL bisa menyempurnakannya
      setCatatan(res.data.catatan_revisi ?? "");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setNotFound(true);
      } else {
        setLoadError(getErrorMessage(err, "Gagal memuat detail logbook."));
      }
    } finally {
      setIsLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async () => {
    if (!detail) return;
    setIsActing(true);
    setActError(null);
    try {
      await reviewLogbook(detail.kelompok_id, detail.id, { status: "APPROVED" });
      setIsConfirmApprove(false);
      showToast("Logbook disetujui.");
      await load();
    } catch (err) {
      setActError(getErrorMessage(err, "Gagal menyetujui logbook."));
    } finally {
      setIsActing(false);
    }
  };

  const handleRevisi = async () => {
    if (!detail) return;
    if (catatan.trim().length < 3) {
      setActError("Catatan wajib diisi minimal 3 karakter.");
      return;
    }
    setIsActing(true);
    setActError(null);
    try {
      await reviewLogbook(detail.kelompok_id, detail.id, {
        status: "REVISI",
        catatan: catatan.trim(),
      });
      showToast("Permintaan revisi terkirim ke mahasiswa.");
      await load();
    } catch (err) {
      setActError(getErrorMessage(err, "Gagal meminta revisi logbook."));
    } finally {
      setIsActing(false);
    }
  };

  const cfg = detail ? STATUS_CONFIG[detail.status] : STATUS_CONFIG.PENDING;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dosen-dashboard/kkm/validasi-logbook")}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Logbook</h1>
            <p className="text-sm text-gray-500 mt-1">
              {detail
                ? `${detail.mahasiswa.nama} - ${detail.kelompok.nama}`
                : "Memuat detail..."}
            </p>
          </div>
        </div>
        {detail && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActError(null);
                handleRevisi();
              }}
              disabled={isActing}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              {isActing ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
              Minta Revisi
            </button>
            <button
              type="button"
              onClick={() => {
                setActError(null);
                setIsConfirmApprove(true);
              }}
              disabled={isActing}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              <Check size={16} />
              Setujui
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          {toast}
        </div>
      )}

      {/* Error aksi */}
      {actError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {actError}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4" aria-busy="true" aria-label="Memuat detail logbook">
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      )}

      {/* Tidak ditemukan */}
      {!isLoading && notFound && (
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
          <FileText size={26} className="text-gray-400" />
          <h2 className="mt-4 text-lg font-bold text-gray-900">Logbook tidak ditemukan</h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Entri logbook mungkin sudah dihapus atau bukan bagian dari kelompok
            bimbingan Anda.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dosen-dashboard/kkm/validasi-logbook")}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer"
          >
            Kembali ke Daftar
          </button>
        </div>
      )}

      {/* Error load */}
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

      {/* Konten */}
      {!isLoading && !notFound && !loadError && detail && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Informasi Logbook */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Informasi Logbook
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Tanggal
                  </p>
                  <p className="text-sm text-gray-800 flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    {formatTanggal(detail.tanggal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                    {cfg.label}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Aktivitas
                  </p>
                  <p className="text-sm text-gray-800">{detail.judul}</p>
                </div>
                {detail.lokasi_kegiatan && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Lokasi Kegiatan
                    </p>
                    <p className="text-sm text-gray-800">{detail.lokasi_kegiatan}</p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Mahasiswa
                  </p>
                  <p className="text-sm text-gray-800">
                    {detail.mahasiswa.nama}
                    {detail.mahasiswa.nim ? ` (${detail.mahasiswa.nim})` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Deskripsi Kegiatan
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {detail.deskripsi}
                </p>
              </div>

              {detail.reviewed_at && detail.reviewer && (
                <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2.5">
                  <p className="text-xs text-gray-500">
                    Terakhir direview oleh{" "}
                    <span className="font-semibold text-gray-700">
                      {detail.reviewer.nama}
                    </span>{" "}
                    pada {formatTanggal(detail.reviewed_at)}
                  </p>
                </div>
              )}
            </div>

            {/* Catatan DPL */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                Catatan DPL
              </h2>
              <textarea
                value={catatan}
                onChange={(e) => {
                  setCatatan(e.target.value);
                  setActError(null);
                }}
                placeholder="Tulis catatan untuk mahasiswa..."
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <p className="mt-2 text-xs text-gray-400">
                Catatan wajib diisi saat meminta revisi; akan dilihat mahasiswa
                pada halaman logbooknya.
              </p>
            </div>
          </div>

          {/* Right column — Dokumen Logbook (PDF) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Dokumen Logbook
            </h2>
            {detail.file_url ? (
              <>
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <iframe
                    src={detail.file_url}
                    title="Pratinjau dokumen logbook"
                    className="h-96 w-full"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400">
                    PDF {formatLogbookFileSize(detail.file_size)}
                  </span>
                  <a
                    href={detail.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <ExternalLink size={13} />
                    Buka di Tab Baru
                  </a>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center">
                <FileText size={26} className="text-gray-300" />
                <p className="mt-3 text-sm text-gray-400">
                  Mahasiswa tidak melampirkan file logbook (PDF).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Konfirmasi Setujui */}
      {isConfirmApprove && detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isActing && setIsConfirmApprove(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi persetujuan logbook"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900">Setujui Logbook?</h3>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">{detail.judul}</span> oleh{" "}
              {detail.mahasiswa.nama} akan disetujui.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsConfirmApprove(false)}
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
                {isActing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Setujui
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

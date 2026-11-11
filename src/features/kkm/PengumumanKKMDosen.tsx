import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Bell,
  ChevronRight,
  Loader2,
  Paperclip,
  X,
  AlertCircle,
} from "lucide-react";

import { getPengumumanSaya, markPengumumanRead } from "./pengumuman.api";
import type { Pengumuman } from "./pengumuman.types";
import IsiPengumuman from "@/components/common/IsiPengumuman";
import {
  formatTanggalPengumuman,
  formatUkuranFile,
  ringkasIsi,
} from "@/utils/pengumuman";

/**
 * Pengumuman KKM sisi DOSEN — HANYA BACA.
 * Pembuatan & pengelolaan pengumuman dilakukan KETUA_LPPM
 * (halaman /admin-dashboard/kkm/pengumuman).
 */

const kategoriStyle = (kategori: string) => {
  const base = "rounded-full px-2.5 py-1 text-xs font-semibold";
  const map: Record<string, string> = {
    Jadwal: "bg-blue-50 text-blue-600",
    Deadline: "bg-red-50 text-red-600",
    Pembekalan: "bg-purple-50 text-purple-600",
    Penempatan: "bg-emerald-50 text-emerald-600",
    Monitoring: "bg-sky-50 text-sky-600",
    Revisi: "bg-orange-50 text-orange-600",
    "Lokasi KKM": "bg-teal-50 text-teal-600",
  };
  return `${base} ${map[kategori] ?? "bg-green-50 text-green-600"}`;
};

export default function PengumumanKKMDosen() {
  const [items, setItems] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Pengumuman | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPengumumanSaya();
      setItems(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Gagal memuat pengumuman.");
      } else {
        setError("Terjadi kesalahan pada server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const belumDibaca = useMemo(
    () => items.filter((item) => !item.read_at).length,
    [items],
  );

  /** Buka detail sekaligus menandai sudah dibaca (masuk statistik "dibaca X/Y"). */
  const openDetail = async (item: Pengumuman) => {
    setDetailLoading(true);
    try {
      if (!item.read_at) {
        const res = await markPengumumanRead(item.id);
        const readAt = res.data.read_at ?? new Date().toISOString();
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, read_at: readAt } : p)),
        );
        setDetail({ ...item, read_at: readAt });
      } else {
        setDetail(item);
      }
    } catch {
      setDetail(item);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header — tanpa tombol tambah (baca saja) */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
          <p className="text-sm text-gray-500 mt-1">
            Informasi resmi dari LPPM yang menyasar Anda
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600">
          <Bell size={14} />
          {belumDibaca} belum dibaca
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={15} />
          {error}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-auto font-medium underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin text-red-600" />
          Memuat pengumuman...
        </div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 && !error && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <p className="text-sm font-medium text-gray-500">
                Belum ada pengumuman untuk Anda
              </p>
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">
                    {item.judul}
                  </h3>
                  {!item.read_at && (
                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  )}
                </div>
                <span className={`shrink-0 ${kategoriStyle(item.kategori)}`}>
                  {item.kategori}
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {ringkasIsi(item.isi, 220)}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  {formatTanggalPengumuman(
                    item.published_at ?? item.created_at,
                  )}
                  {item.audiens.length > 0 ? ` • Target: ${item.audiens.join(", ")}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => void openDetail(item)}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Baca selengkapnya
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETAIL (baca saja) */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDetail(null)}
            aria-hidden
          />
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
              <div className="min-w-0">
                <span className={kategoriStyle(detail?.kategori ?? "")}>
                  {detail?.kategori}
                </span>
                <h2 className="mt-2 text-lg font-bold text-gray-900">
                  {detail?.judul}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  {detail
                    ? `${formatTanggalPengumuman(detail.published_at ?? detail.created_at)} • ${detail.created_by ?? "LPPM UMC"}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
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
          </div>
        </div>
      )}
    </div>
  );
}

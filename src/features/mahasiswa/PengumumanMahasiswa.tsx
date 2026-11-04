import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bell, ChevronRight, Loader2, Paperclip, X, AlertCircle } from "lucide-react";

import {
  getPengumumanSaya,
  markPengumumanRead,
} from "@/features/kkm/pengumuman.api";
import type { Pengumuman } from "@/features/kkm/pengumuman.types";
import IsiPengumuman from "@/components/common/IsiPengumuman";
import {
  formatTanggalPengumuman,
  formatUkuranFile,
  ringkasIsi,
} from "@/utils/pengumuman";

/** Warna badge kategori — diambil dari palet, fallback untuk kategori baru */
const KATEGORI_STYLE: Record<string, string> = {
  Pembekalan: "bg-purple-100 text-purple-700",
  Penempatan: "bg-blue-100 text-blue-700",
  Deadline: "bg-red-100 text-red-700",
  Revisi: "bg-orange-100 text-orange-700",
  Jadwal: "bg-amber-100 text-amber-700",
  "Lokasi KKM": "bg-emerald-100 text-emerald-700",
  Monitoring: "bg-sky-100 text-sky-700",
};

const kategoriStyle = (kategori: string) =>
  KATEGORI_STYLE[kategori] ?? "bg-gray-100 text-gray-600";

export default function PengumumanMahasiswa() {
  const [items, setItems] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Semua");
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

  /** Tab = "Semua" + kategori unik yang benar-benar ada pada data. */
  const tabs = useMemo(() => {
    const kategoriUnik = [...new Set(items.map((item) => item.kategori))];
    return ["Semua", ...kategoriUnik];
  }, [items]);

  const daftar = useMemo(
    () =>
      activeTab === "Semua"
        ? items
        : items.filter((item) => item.kategori === activeTab),
    [items, activeTab],
  );

  /** Buka detail → tandai terbaca (menurunkan badge & statistik "dibaca X/Y"). */
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
      // gagal menandai tidak menghalangi pengguna membaca isi
      setDetail(item);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
          <p className="text-sm text-gray-500 mt-1">
            Informasi dan pengumuman resmi dari LPPM UMC
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600">
          <Bell size={14} />
          {belumDibaca} belum dibaca
        </span>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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

      {/* FILTER TABS */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const active = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* DAFTAR PENGUMUMAN */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin text-red-600" />
          Memuat pengumuman...
        </div>
      ) : (
        <div className="space-y-3">
          {daftar.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <p className="text-sm font-medium text-gray-500">
                Belum ada pengumuman
                {activeTab !== "Semua" ? " pada kategori ini" : ""} untuk Anda
              </p>
            </div>
          )}

          {daftar.map((item) => {
            const belumDibacaItem = !item.read_at;
            return (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => void openDetail(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    void openDetail(item);
                  }
                }}
                className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-red-200 hover:shadow-md cursor-pointer"
              >
                {/* IKON */}
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    belumDibacaItem
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Bell size={18} />
                </span>

                {/* ISI */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-gray-900">
                      {item.judul}
                    </h3>
                    {item.is_pinned && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                        Disematkan
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${kategoriStyle(item.kategori)}`}
                    >
                      {item.kategori}
                    </span>
                    <span>
                      {formatTanggalPengumuman(
                        item.published_at ?? item.created_at,
                      )}
                    </span>
                    <span>—</span>
                    <span>{item.created_by ?? "LPPM UMC"}</span>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {ringkasIsi(item.isi, 180)}
                  </p>

                  {item.lampiran && (
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <Paperclip size={12} />
                      {item.lampiran.name}
                    </span>
                  )}
                </div>

                {/* TANDAS BELUM DIBACA + PANAH */}
                <div className="flex shrink-0 items-center gap-3 pt-1">
                  {belumDibacaItem && (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  <ChevronRight
                    size={18}
                    className="text-gray-300 transition-colors group-hover:text-red-400"
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL DETAIL */}
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
                <div className="flex flex-wrap items-center gap-2">
                  {detail && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${kategoriStyle(detail.kategori)}`}
                    >
                      {detail.kategori}
                    </span>
                  )}
                </div>
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

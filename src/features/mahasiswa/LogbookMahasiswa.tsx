import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  RotateCcw,
  UserX,
} from "lucide-react";
import dayjs from "dayjs";
import TambahLogbookModal from "@/features/mahasiswa/components/TambahLogbookModal";
import { getLogbookSaya } from "@/features/kkm/kkmLogbook.api";
import {
  formatLogbookFileSize,
  KKM_LOGBOOK_STATUS_LABEL,
  type KkmLogbookEntry,
  type KkmLogbookStatus,
} from "@/features/kkm/kkmLogbook.types";

// =====================================================================
// Halaman "Logbook Kegiatan" mahasiswa — terhubung ke GET /kkm/logbook/me.
// =====================================================================

const STATUS_CONFIG: Record<
  KkmLogbookStatus,
  { badge: string; icon: typeof CheckCircle2 }
> = {
  APPROVED: {
    badge: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  PENDING: {
    badge: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  REVISI: {
    badge: "bg-red-100 text-red-600",
    icon: RotateCcw,
  },
};

const formatTanggal = (iso: string): string => {
  const d = dayjs(iso);
  return d.isValid() ? d.format("DD MMM YYYY") : iso;
};

export default function LogbookMahasiswa() {
  const [entries, setEntries] = useState<KkmLogbookEntry[]>([]);
  const [kelompokId, setKelompokId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [belumAda, setBelumAda] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detail, setDetail] = useState<KkmLogbookEntry | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setBelumAda(false);
    try {
      const res = await getLogbookSaya();
      setEntries(res.data.entries);
      setKelompokId(res.data.kelompok.id);
    } catch (err) {
      // 404 = mahasiswa belum tergabung kelompok mana pun → empty-state khusus.
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setBelumAda(true);
      } else {
        const data = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)
          : undefined;
        setLoadError(data?.message || "Gagal memuat logbook Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const total = entries.length;
  const approved = entries.filter((row) => row.status === "APPROVED").length;
  const pending = entries.filter((row) => row.status === "PENDING").length;
  const revisi = entries.filter((row) => row.status === "REVISI").length;

  const statistik = [
    {
      nilai: total,
      label: "Total Logbook",
      card: "bg-white border border-gray-100",
      angka: "text-gray-900",
    },
    {
      nilai: approved,
      label: "Approved",
      card: "bg-green-50 border border-green-100",
      angka: "text-green-600",
    },
    {
      nilai: pending,
      label: "Pending",
      card: "bg-amber-50 border border-amber-100",
      angka: "text-amber-600",
    },
    {
      nilai: revisi,
      label: "Perlu Revisi",
      card: "bg-red-50 border border-red-100",
      angka: "text-red-600",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logbook Kegiatan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Catat setiap kegiatan KKM Anda secara rutin
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={belumAda}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(220,38,38,0.25)] transition-colors hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          <Plus size={16} />
          Tambah Logbook
        </button>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="space-y-6" aria-busy="true" aria-label="Memuat logbook">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      )}

      {/* BELUM ADA KELOMPOK (404) */}
      {!isLoading && belumAda && (
        <section className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <UserX size={26} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Kelompok Anda belum ditetapkan
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Logbook KKM baru bisa diisi setelah penempatan kelompok oleh
            panitia. Silakan hubungi panitia/LPPM bila Anda merasa sudah
            seharusnya memiliki kelompok.
          </p>
        </section>
      )}

      {/* ERROR */}
      {!isLoading && loadError && (
        <section className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
          <RefreshCw size={24} className="text-red-500" />
          <p className="mt-3 text-sm font-medium text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer"
          >
            <RefreshCw size={15} />
            Coba Lagi
          </button>
        </section>
      )}

      {/* KONTEN */}
      {!isLoading && !belumAda && !loadError && (
        <>
          {/* KARTU STATISTIK */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statistik.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl p-5 text-center shadow-sm ${item.card}`}
              >
                <p className={`text-3xl font-bold ${item.angka}`}>{item.nilai}</p>
                <p className="mt-1 text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* TABEL LOGBOOK */}
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-6 font-semibold">Tanggal</th>
                    <th className="py-4 px-6 font-semibold">Aktivitas</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-sm">
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 px-6 text-center text-sm text-gray-400">
                        Belum ada logbook. Klik{" "}
                        <span className="font-semibold text-gray-600">Tambah Logbook</span>{" "}
                        untuk mencatat kegiatan pertama Anda.
                      </td>
                    </tr>
                  )}

                  {entries.map((row) => {
                    const config = STATUS_CONFIG[row.status];
                    const StatusIcon = config.icon;

                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-gray-50/60"
                      >
                        <td className="py-5 px-6 whitespace-nowrap text-gray-600">
                          {formatTanggal(row.tanggal)}
                        </td>

                        <td className="py-5 px-6">
                          <p className="font-bold text-gray-900">{row.judul}</p>
                          <p className="mt-0.5 max-w-xl truncate text-xs text-gray-400">
                            {row.deskripsi}
                          </p>
                        </td>

                        <td className="py-5 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
                          >
                            <StatusIcon size={13} className="shrink-0" />
                            {KKM_LOGBOOK_STATUS_LABEL[row.status]}
                          </span>
                        </td>

                        <td className="py-5 px-6 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDetail(row)}
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* MODAL DETAIL LOGBOOK */}
          {detail && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setDetail(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Detail logbook"
            >
              <div
                className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{detail.judul}</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatTanggal(detail.tanggal)}
                      {detail.lokasi_kegiatan ? ` • ${detail.lokasi_kegiatan}` : ""}
                    </p>
                  </div>

                  {(() => {
                    const config = STATUS_CONFIG[detail.status];
                    const StatusIcon = config.icon;
                    return (
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
                      >
                        <StatusIcon size={13} className="shrink-0" />
                        {KKM_LOGBOOK_STATUS_LABEL[detail.status]}
                      </span>
                    );
                  })()}
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {detail.deskripsi}
                </p>

                {detail.status === "REVISI" && detail.catatan_revisi && (
                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3.5">
                    <p className="text-xs font-semibold text-red-600">
                      Catatan Reviewer
                    </p>
                    <p className="mt-1 text-sm text-red-700">{detail.catatan_revisi}</p>
                  </div>
                )}

                {detail.file_url && (
                  <a
                    href={detail.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <FileText size={15} />
                    Lihat File Logbook (PDF)
                    <span className="text-xs font-normal text-gray-400">
                      {formatLogbookFileSize(detail.file_size)}
                    </span>
                  </a>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDetail(null)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL TAMBAH LOGBOOK */}
          <TambahLogbookModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            kelompokId={kelompokId}
            onSaved={() => void load()}
          />
        </>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarRange,
  CheckCircle2,
  Eye,
  FileText,
  Lock,
  RefreshCw,
  Upload,
  UserX,
} from "lucide-react";
import UploadPdfModal from "@/features/mahasiswa/components/UploadPdfModal";
import { getLogbookKelompokSaya, uploadLogbookKelompok } from "@/features/kkm/kkmLogbookKelompok.api";
import {
  formatBerkasSize,
  KKM_LOGBOOK_KELOMPOK_STATUS_LABEL,
  type KkmLogbookKelompokMinggu,
  type KkmLogbookKelompokStatusMinggu,
} from "@/features/kkm/kkmLogbookKelompok.types";

// =====================================================================
// Halaman "Logbook Kelompok" mahasiswa.
// 1 PDF per minggu, hanya Ketua & Sekretaris yang boleh mengunggah.
// Minggu ke-1 mulai pada tgl_pelaksanaan, minggu terakhir berakhir di
// tgl_penarikan; setiap minggu terkunci permanen setelah deadline-nya.
// =====================================================================

const STATUS_BADGE: Record<
  KkmLogbookKelompokStatusMinggu,
  { badge: string; icon: typeof CheckCircle2 }
> = {
  TERBUKA: { badge: "bg-green-100 text-green-700", icon: CheckCircle2 },
  BELUM_DIBUKA: { badge: "bg-gray-100 text-gray-500", icon: CalendarRange },
  TERKUNCI: { badge: "bg-red-100 text-red-600", icon: Lock },
};

const formatTanggal = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function LogbookKelompokMahasiswa() {
  const [data, setData] = useState<
    Awaited<ReturnType<typeof getLogbookKelompokSaya>>["data"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [belumAda, setBelumAda] = useState(false);

  const [target, setTarget] = useState<KkmLogbookKelompokMinggu | null>(null);
  const [detail, setDetail] = useState<KkmLogbookKelompokMinggu | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setBelumAda(false);
    try {
      const res = await getLogbookKelompokSaya();
      setData(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setBelumAda(true);
      } else {
        const body = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)
          : undefined;
        setLoadError(body?.message || "Gagal memuat logbook kelompok.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleUpload = async (file: File) => {
    if (!target || !data) return;
    setIsUploading(true);
    try {
      const res = await uploadLogbookKelompok(data.kelompok.id, target.minggu_ke, file);
      setToast({ type: "success", text: res.message });
      setTarget(null);
      await load();
    } catch (err) {
      const body = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)
        : undefined;
      setToast({
        type: "error",
        text: body?.message || "Gagal mengunggah logbook kelompok.",
      });
      setTarget(null);
    } finally {
      setIsUploading(false);
    }
  };

  const bolehUnggah = data?.boleh_unggah ?? false;
  const anggota = data?.jabatan === "ANGGOTA";
  const belumTeratur = data && !data.pengaturan.teratur;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logbook Kelompok</h1>
          <p className="text-sm text-gray-500 mt-1">
            Satu file PDF per minggu — diunggah oleh Ketua &amp; Sekretaris kelompok
          </p>
        </div>

        {data && (
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Jabatan Anda: {data.jabatan_label}
            </span>
            <span className="text-xs text-gray-500">{data.pengaturan.tampilan}</span>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* LOADING */}
      {isLoading && (
        <div className="space-y-4" aria-busy="true" aria-label="Memuat logbook kelompok">
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
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
            Logbook kelompok baru bisa diakses setelah penempatan kelompok oleh
            panitia.
          </p>
        </section>
      )}

      {/* ERROR */}
      {!isLoading && loadError && !belumAda && (
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
      {!isLoading && !belumAda && !loadError && data && (
        <>
          {/* GEMBOK — anggota biasa */}
          {anggota && (
            <section className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <Lock size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-700">
                  Halaman ini hanya bisa diakses Ketua dan Sekretaris
                </p>
                <p className="mt-0.5 text-xs text-amber-600">
                  {data.alasan_tidak_boleh_unggah} Anda saat ini terdaftar sebagai{" "}
                  <span className="font-semibold">{data.jabatan_label}</span>.
                </p>
              </div>
            </section>
          )}

          {/* PENGATURAN BELUM DIATUR ADMIN */}
          {belumTeratur && (
            <section className="mb-6 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <CalendarRange size={18} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-700">
                  Jadwal upload logbook kelompok belum diatur
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Admin LPPM belum menentukan hari &amp; jam deadline mingguan.
                  Silakan hubungi admin LPPM.
                </p>
              </div>
            </section>
          )}

          {/* STATISTIK */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                nilai: data.stats.total_minggu,
                label: "Total Minggu",
                card: "bg-white border border-gray-100",
                angka: "text-gray-900",
              },
              {
                nilai: data.stats.sudah_unggah,
                label: "Sudah Diunggah",
                card: "bg-green-50 border border-green-100",
                angka: "text-green-600",
              },
              {
                nilai: data.stats.belum_unggah,
                label: "Belum Diunggah",
                card: "bg-amber-50 border border-amber-100",
                angka: "text-amber-600",
              },
              {
                nilai: data.stats.minggu_terbuka,
                label: "Minggu Terbuka",
                card: "bg-blue-50 border border-blue-100",
                angka: "text-blue-600",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl p-5 text-center shadow-sm ${item.card}`}
              >
                <p className={`text-3xl font-bold ${item.angka}`}>{item.nilai}</p>
                <p className="mt-1 text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* TABEL MINGGUAN */}
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-6 font-semibold">Minggu</th>
                    <th className="py-4 px-6 font-semibold">Rentang</th>
                    <th className="py-4 px-6 font-semibold">Deadline</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-sm">
                  {data.minggu.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 px-6 text-center text-sm text-gray-400">
                        Jadwal logbook kelompok belum tersedia.
                      </td>
                    </tr>
                  )}

                  {data.minggu.map((row) => {
                    const config = STATUS_BADGE[row.status];
                    const StatusIcon = config.icon;

                    return (
                      <tr key={row.minggu_ke} className="transition-colors hover:bg-gray-50/60">
                        <td className="py-5 px-6 whitespace-nowrap">
                          <span className="font-bold text-gray-900">
                            Minggu ke-{row.minggu_ke}
                          </span>
                        </td>

                        <td className="py-5 px-6 whitespace-nowrap text-gray-600">
                          {formatTanggal(row.tanggal_mulai)} — {formatTanggal(row.tanggal_batas)}
                        </td>

                        <td className="py-5 px-6 whitespace-nowrap text-gray-600">
                          {row.deadline_tampil}
                        </td>

                        <td className="py-5 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
                          >
                            <StatusIcon size={13} className="shrink-0" />
                            {KKM_LOGBOOK_KELOMPOK_STATUS_LABEL[row.status]}
                          </span>
                          {row.sudah_unggah && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                              <FileText size={11} /> Ada File
                            </span>
                          )}
                        </td>

                        <td className="py-5 px-6 text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-2">
                            {row.berkas && (
                              <button
                                type="button"
                                onClick={() => setDetail(row)}
                                className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                                title="Lihat File"
                              >
                                <Eye size={17} />
                              </button>
                            )}

                            {bolehUnggah && row.bisa_unggah && (
                              <button
                                type="button"
                                onClick={() => setTarget(row)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer"
                              >
                                <Upload size={13} />
                                {row.sudah_unggah ? "Ganti File" : "Unggah"}
                              </button>
                            )}

                            {bolehUnggah && row.status === "TERKUNCI" && (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-500"
                                title="Deadline minggu ini sudah lewat dan terkunci permanen"
                              >
                                <Lock size={13} /> Terkunci
                              </span>
                            )}

                            {!bolehUnggah && (
                              <Lock size={15} className="text-gray-300" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* MODAL DETAIL BERKAS */}
          {detail?.berkas && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setDetail(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Detail logbook kelompok"
            >
              <div
                className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-gray-900">
                  Logbook Minggu ke-{detail.minggu_ke}
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  {formatTanggal(detail.tanggal_mulai)} — {formatTanggal(detail.tanggal_batas)}
                  {" • "}Deadline: {detail.deadline_tampil}
                </p>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Nama File</dt>
                    <dd className="text-right font-medium text-gray-800">
                      {detail.berkas.nama}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Ukuran</dt>
                    <dd className="text-right font-medium text-gray-800">
                      {formatBerkasSize(detail.berkas.ukuran)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Diunggah oleh</dt>
                    <dd className="text-right font-medium text-gray-800">
                      {detail.berkas.diunggah_oleh}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Waktu Unggah</dt>
                    <dd className="text-right font-medium text-gray-800">
                      {new Date(detail.berkas.diunggah_pada).toLocaleString("id-ID")}
                    </dd>
                  </div>
                </dl>

                <a
                  href={detail.berkas.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <FileText size={15} />
                  Buka File (PDF)
                </a>

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

          {/* MODAL UNGGAH */}
          <UploadPdfModal
            open={Boolean(target)}
            onOpenChange={(open) => {
              if (!open) setTarget(null);
            }}
            title={`Unggah Logbook Minggu ke-${target?.minggu_ke ?? "-"}`}
            subtitle={
              target
                ? `${formatTanggal(target.tanggal_mulai)} — ${formatTanggal(target.tanggal_batas)}`
                : null
            }
            info={target ? `Deadline: ${target.deadline_tampil}` : null}
            isLoading={isUploading}
            onSubmit={handleUpload}
          />
        </>
      )}
    </div>
  );
}

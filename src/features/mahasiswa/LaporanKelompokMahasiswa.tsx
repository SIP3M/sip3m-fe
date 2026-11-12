import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  RefreshCw,
  RotateCcw,
  Upload,
  UserX,
  Users,
} from "lucide-react";
import UploadPdfModal from "@/features/mahasiswa/components/UploadPdfModal";
import { getLaporanKelompok, uploadLaporanKelompok } from "@/features/kkm/kkmLaporan.api";
import type {
  GetLaporanKelompokResponse,
  JenisLaporan,
  KkmLaporanKelompokItem,
  StatusLaporan,
} from "@/features/kkm/kkmLaporan.types";
import { formatBerkasSize } from "@/features/kkm/kkmLogbookKelompok.types";

// =====================================================================
// Halaman "Laporan Kelompok" mahasiswa.
// 3 jenis laporan (Awal / Mingguan / Akhir) — masing-masing punya jendela
// unggah, status review (Menunggu Review / Disetujui / Revisi), dan catatan
// revisi dari reviewer. Upload ulang setelah revisi → status kembali
// MENUNGGU_REVIEW. Hanya Ketua & Sekretaris yang boleh mengunggah;
// anggota biasa melihat state terkunci (gembok + feedback).
// =====================================================================

type LaporanData = GetLaporanKelompokResponse["data"];

const STATUS_META: Record<
  StatusLaporan,
  { label: string; className: string; Icon: typeof Clock }
> = {
  BELUM_UPLOAD: { label: "Belum Upload", className: "bg-gray-100 text-gray-600", Icon: Clock },
  MENUNGGU_REVIEW: { label: "Menunggu Review", className: "bg-yellow-50 text-yellow-700", Icon: Clock },
  DISETUJUI: { label: "Disetujui", className: "bg-green-50 text-green-700", Icon: CheckCircle2 },
  REVISI: { label: "Perlu Revisi", className: "bg-red-50 text-red-600", Icon: RotateCcw },
  TERLAMBAT: { label: "Terlambat", className: "bg-orange-50 text-orange-600", Icon: AlertTriangle },
};

function StatusBadge({ status }: { status: StatusLaporan }) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

export default function LaporanKelompokMahasiswa() {
  const [data, setData] = useState<LaporanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [belumAda, setBelumAda] = useState(false);

  const [activeJenis, setActiveJenis] = useState<JenisLaporan | null>(null);
  const [uploadJenis, setUploadJenis] = useState<JenisLaporan | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success"; text: string } | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setBelumAda(false);
    try {
      const res = await getLaporanKelompok();
      setData(res.data);
      // Default tab = jenis pertama yang belum diunggah, kalau semua sudah → yang pertama
      const daftar = res.data.daftar ?? [];
      if (daftar.length > 0) {
        setActiveJenis((prev) => {
          if (prev && daftar.some((d) => d.jenis === prev)) return prev;
          return (daftar.find((d) => !d.laporan) ?? daftar[0]).jenis;
        });
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setBelumAda(true);
      } else {
        const body = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)
          : undefined;
        setLoadError(body?.message || "Gagal memuat laporan kelompok.");
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
    if (!data || !uploadJenis) return;
    setIsUploading(true);
    try {
      const res = await uploadLaporanKelompok(data.kelompok.id, file, uploadJenis);
      setToast({ type: "success", text: res.message });
      setUploadJenis(null);
      await load();
    } catch (err) {
      const body = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)
        : undefined;
      setErrorToast(body?.message || "Gagal mengunggah laporan kelompok.");
      setUploadJenis(null);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!errorToast) return;
    const timer = window.setTimeout(() => setErrorToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [errorToast]);

  const anggota = data?.jabatan === "ANGGOTA";
  const daftar = data?.daftar ?? [];
  const active: KkmLaporanKelompokItem | undefined =
    daftar.find((d) => d.jenis === activeJenis) ?? daftar[0];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Kelompok</h1>
          <p className="text-sm text-gray-500 mt-1">
            Laporan Awal, Mingguan, dan Akhir untuk seluruh kelompok
          </p>
        </div>

        {data && (
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Jabatan Anda: {data.jabatan_label}
            </span>
            <span className="text-xs text-gray-500">{data.kelompok.nama}</span>
          </div>
        )}
      </div>

      {/* TOAST */}
      {(toast || errorToast) && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            toast && !errorToast
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {errorToast ?? toast?.text}
        </div>
      )}

      {/* LOADING */}
      {isLoading && (
        <div className="space-y-4" aria-busy="true" aria-label="Memuat laporan kelompok">
          <div className="h-14 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      )}

      {/* BELUM PUNYA KELOMPOK (404) */}
      {!isLoading && belumAda && (
        <section className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <UserX size={26} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Kelompok Anda belum ditetapkan
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Laporan kelompok baru bisa diakses setelah penempatan kelompok oleh
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

          {/* PEJABAT */}
          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users size={16} className="text-gray-400" />
              Pejabat Kelompok
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Ketua
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {data.ketua.length
                    ? data.ketua.map((k) => `${k.nama}${k.nim ? ` (${k.nim})` : ""}`).join(", ")
                    : "Belum ditetapkan"}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Sekretaris
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {data.sekretaris.length
                    ? data.sekretaris
                        .map((s) => `${s.nama}${s.nim ? ` (${s.nim})` : ""}`)
                        .join(", ")
                    : "Belum ditetapkan"}
                </p>
              </div>
            </div>
          </section>

          {/* KARTU LAPORAN — tab per jenis */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {/* Tab jenis */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
              {daftar.map((item) => {
                const isActive = active?.jenis === item.jenis;
                return (
                  <button
                    key={item.jenis}
                    type="button"
                    onClick={() => setActiveJenis(item.jenis)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_META[item.status].label}
                    </span>
                  </button>
                );
              })}
            </div>

            {active && (
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      active.laporan ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <FileText size={22} />
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold text-gray-900">{active.label}</p>
                      <StatusBadge status={active.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {data.kelompok.nama} • {data.periode.nama_periode} (
                      {data.periode.tahun_akademik})
                    </p>

                    {/* Jendela unggah */}
                    <p
                      className={`mt-2 text-xs ${
                        active.jendela.terbuka ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {active.jendela.terbuka
                        ? active.jendela.tanpa_batas
                          ? "Unggahan terbuka — belum ada batas waktu dari admin LPPM."
                          : `Batas unggah: ${active.jendela.deadline_tampil}`
                        : (active.jendela.alasan ?? "Unggahan belum terbuka.")}
                    </p>

                    {active.laporan ? (
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <p className="font-medium text-gray-800">{active.laporan.nama}</p>
                        <p className="text-xs text-gray-500">
                          {formatBerkasSize(active.laporan.ukuran)} • diunggah oleh{" "}
                          {active.laporan.diunggah_oleh} pada{" "}
                          {new Date(active.laporan.diunggah_pada).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock size={14} /> Belum ada file yang diunggah.
                      </p>
                    )}

                    {/* Catatan revisi */}
                    {active.status === "REVISI" && active.catatan_revisi && (
                      <div className="mt-3 max-w-lg rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="text-xs font-bold text-red-600">Catatan Revisi</p>
                        <p className="mt-1 text-sm text-red-700">{active.catatan_revisi}</p>
                        {active.reviewed_at && (
                          <p className="mt-1 text-[11px] text-red-400">
                            Direview pada{" "}
                            {new Date(active.reviewed_at).toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>
                    )}

                    {active.status === "MENUNGGU_REVIEW" && (
                      <p className="mt-3 text-xs text-yellow-600">
                        File sedang menunggu review dari DPL / LPPM.
                      </p>
                    )}
                    {active.status === "DISETUJUI" && active.reviewed_at && (
                      <p className="mt-3 text-xs text-green-600">
                        Disetujui pada{" "}
                        {new Date(active.reviewed_at).toLocaleString("id-ID")}.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  {active.laporan && (
                    <a
                      href={active.laporan.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <FileText size={15} />
                      Lihat File (PDF)
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setUploadJenis(active.jenis)}
                    disabled={!data.boleh_unggah || !active.bisa_unggah}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(220,38,38,0.25)] transition-colors hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    title={
                      data.boleh_unggah && active.bisa_unggah
                        ? undefined
                        : (data.alasan_tidak_boleh_unggah ??
                          active.jendela.alasan ??
                          undefined)
                    }
                  >
                    {data.boleh_unggah && active.bisa_unggah ? (
                      <Upload size={16} />
                    ) : (
                      <Lock size={16} />
                    )}
                    {active.laporan ? "Ganti File" : "Unggah Laporan"}
                  </button>

                  {(!data.boleh_unggah || !active.bisa_unggah) && (
                    <p className="max-w-xs text-right text-xs text-amber-600">
                      {data.alasan_tidak_boleh_unggah ?? active.jendela.alasan}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          <p className="mt-4 text-xs text-gray-400">
            Setiap file masuk antrean review DPL/LPPM. Upload ulang (misalnya
            setelah revisi) menggantikan file lama dan status kembali menjadi
            Menunggu Review selama jendela unggah masih terbuka.
          </p>

          {/* MODAL UNGGAH */}
          <UploadPdfModal
            open={Boolean(uploadJenis)}
            onOpenChange={(open) => {
              if (!open) setUploadJenis(null);
            }}
            title={
              daftar.find((d) => d.jenis === uploadJenis)?.laporan
                ? "Ganti Laporan Kelompok"
                : "Unggah Laporan Kelompok"
            }
            subtitle={`${daftar.find((d) => d.jenis === uploadJenis)?.label ?? ""} — ${data.kelompok.nama} · ${data.periode.nama_periode}`}
            info={
              (() => {
                const item = daftar.find((d) => d.jenis === uploadJenis);
                if (!item) return undefined;
                return item.jendela.tanpa_batas
                  ? "Belum ada batas waktu yang ditetapkan admin LPPM."
                  : `Batas unggah: ${item.jendela.deadline_tampil}`;
              })()
            }
            isLoading={isUploading}
            onSubmit={handleUpload}
          />
        </>
      )}
    </div>
  );
}

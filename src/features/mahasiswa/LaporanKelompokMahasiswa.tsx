import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  RefreshCw,
  Upload,
  UserX,
  Users,
} from "lucide-react";
import UploadPdfModal from "@/features/mahasiswa/components/UploadPdfModal";
import { getLaporanKelompok, uploadLaporanKelompok } from "@/features/kkm/kkmLaporan.api";
import type { GetLaporanKelompokResponse } from "@/features/kkm/kkmLaporan.types";
import { formatBerkasSize } from "@/features/kkm/kkmLogbookKelompok.types";

// =====================================================================
// Halaman "Laporan Kelompok" mahasiswa.
// Dokumen LAPORAN_AKHIR — terbuka setelah tgl_penarikan lewat, ditutup
// pada batas yang diatur admin LPPM. Hanya Ketua & Sekretaris yang boleh
// mengunggah; anggota biasa melihat state terkunci (gembok + feedback).
// =====================================================================

type LaporanData = GetLaporanKelompokResponse["data"];

export default function LaporanKelompokMahasiswa() {
  const [data, setData] = useState<LaporanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [belumAda, setBelumAda] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
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
    if (!data) return;
    setIsUploading(true);
    try {
      const res = await uploadLaporanKelompok(data.kelompok.id, file);
      setToast({ type: "success", text: res.message });
      setIsModalOpen(false);
      await load();
    } catch (err) {
      const body = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)
        : undefined;
      setErrorToast(body?.message || "Gagal mengunggah laporan kelompok.");
      setIsModalOpen(false);
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
  const sudahUnggah = Boolean(data?.laporan);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Kelompok</h1>
          <p className="text-sm text-gray-500 mt-1">
            Satu file PDF laporan akhir untuk seluruh kelompok
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
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
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

          {/* STATUS JENDELA */}
          <section
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-5 py-4 ${
              data.jendela.terbuka
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            {data.jendela.terbuka ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />
            ) : (
              <Lock size={18} className="mt-0.5 shrink-0 text-amber-600" />
            )}

            <div className="flex-1">
              <p
                className={`text-sm font-bold ${
                  data.jendela.terbuka ? "text-green-700" : "text-amber-700"
                }`}
              >
                {data.jendela.terbuka
                  ? "Unggahan laporan kelompok sedang dibuka"
                  : "Unggahan laporan kelompok belum terbuka"}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  data.jendela.terbuka ? "text-green-600" : "text-amber-600"
                }`}
              >
                {data.jendela.terbuka
                  ? data.jendela.tanpa_batas
                    ? "Belum ada batas waktu yang ditetapkan admin LPPM."
                    : `Batas unggah: ${data.jendela.deadline_tampil}`
                  : data.jendela.alasan}
              </p>
            </div>
          </section>

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

          {/* KARTU STATUS */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    sudahUnggah ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <FileText size={22} />
                </span>

                <div>
                  <p className="text-base font-bold text-gray-900">Laporan Akhir Kelompok</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {data.kelompok.nama} • {data.periode.nama_periode} (
                    {data.periode.tahun_akademik})
                  </p>

                  {data.laporan ? (
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p className="font-medium text-gray-800">{data.laporan.nama}</p>
                      <p className="text-xs text-gray-500">
                        {formatBerkasSize(data.laporan.ukuran)} • diunggah oleh{" "}
                        {data.laporan.diunggah_oleh} pada{" "}
                        {new Date(data.laporan.diunggah_pada).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock size={14} /> Belum ada file yang diunggah.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                {data.laporan && (
                  <a
                    href={data.laporan.url}
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
                  onClick={() => setIsModalOpen(true)}
                  disabled={!data.bisa_unggah}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(220,38,38,0.25)] transition-colors hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  title={
                    data.bisa_unggah
                      ? undefined
                      : (data.alasan_tidak_boleh_unggah ?? data.jendela.alasan ?? undefined)
                  }
                >
                  {data.bisa_unggah ? <Upload size={16} /> : <Lock size={16} />}
                  {sudahUnggah ? "Ganti File" : "Unggah Laporan"}
                </button>

                {!data.bisa_unggah && (
                  <p className="max-w-xs text-right text-xs text-amber-600">
                    {data.alasan_tidak_boleh_unggah ?? data.jendela.alasan}
                  </p>
                )}
              </div>
            </div>
          </section>

          <p className="mt-4 text-xs text-gray-400">
            Laporan kelompok tersimpan langsung tanpa proses review. Upload ulang
            menggantikan file sebelumnya selama jendela unggah masih terbuka.
          </p>

          {/* MODAL UNGGAH */}
          <UploadPdfModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            title={sudahUnggah ? "Ganti Laporan Kelompok" : "Unggah Laporan Kelompok"}
            subtitle={`${data.kelompok.nama} — ${data.periode.nama_periode}`}
            info={
              data.jendela.tanpa_batas
                ? "Belum ada batas waktu yang ditetapkan admin LPPM."
                : `Batas unggah: ${data.jendela.deadline_tampil}`
            }
            isLoading={isUploading}
            onSubmit={handleUpload}
          />
        </>
      )}
    </div>
  );
}

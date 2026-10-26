import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  BookOpen,
  FileText,
  GraduationCap,
  MapPin,
  Phone,
  RefreshCw,
  UserX,
  Users,
} from "lucide-react";
import { getKelompokSaya } from "@/features/kkm/kkmKelompok.api";
import { getKkmErrorMessage } from "@/features/kkm/kkmKelompok.ui";
import type {
  KelompokSayaData,
  KelompokSayaStatus,
} from "@/features/kkm/kkmKelompok.types";

// =====================================================================
// Halaman "Kelompok Saya" — terhubung ke GET /kkm/kelompok/me (BE).
// =====================================================================

const STATUS_KELOMPOK: Record<KelompokSayaStatus, { label: string; dot: string }> = {
  AKTIF: { label: "Aktif", dot: "bg-green-400" },
  BELUM_LENGKAP: { label: "Belum Lengkap", dot: "bg-yellow-400" },
  BERMASALAH: { label: "Bermasalah", dot: "bg-red-300" },
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-amber-100 text-amber-600",
  "bg-indigo-100 text-indigo-600",
];

const initialsOf = (nama: string): string =>
  nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "?";

/** Warna avatar deterministik dari nama (konsisten antar render). */
const avatarOf = (nama: string): string => {
  let h = 0;
  for (const ch of nama) h = (h * 31 + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
};

/** Normalisasi nomor HP Indonesia ke format tautan wa.me (62…). */
const waLink = (nomor: string): string => {
  let digits = nomor.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return `https://wa.me/${digits}`;
};

export default function KelompokSaya() {
  const [data, setData] = useState<KelompokSayaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [belumAda, setBelumAda] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setBelumAda(false);
    try {
      const res = await getKelompokSaya();
      setData(res.data);
    } catch (err) {
      // 404 = mahasiswa belum tergabung kelompok mana pun → empty-state khusus.
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setBelumAda(true);
      } else {
        setLoadError(getKkmErrorMessage(err, "Gagal memuat data kelompok Anda."));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const kelompok = data?.kelompok;
  const dpl = data?.dpl;
  const statusInfo = kelompok ? STATUS_KELOMPOK[kelompok.status] ?? STATUS_KELOMPOK.AKTIF : null;
  const dplProdiFakultas = dpl
    ? [dpl.prodi, dpl.fakultas].filter(Boolean).join(" — ")
    : "";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelompok Saya</h1>
        <p className="text-sm text-gray-500 mt-1">
          Informasi kelompok KKM Anda
        </p>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="space-y-6" aria-busy="true" aria-label="Memuat data kelompok">
          <div className="h-36 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="h-72 animate-pulse rounded-2xl bg-gray-200 lg:col-span-7" />
            <div className="space-y-6 lg:col-span-5">
              <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />
              <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />
            </div>
          </div>
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
            Penempatan kelompok KKM dilakukan oleh panitia setelah pendaftaran
            Anda terverifikasi. Silakan hubungi panitia/LPPM bila Anda merasa
            sudah seharusnya memiliki kelompok.
          </p>
        </section>
      )}

      {/* ERROR */}
      {!isLoading && loadError && (
        <section className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
          <AlertTriangle size={26} className="text-red-500" />
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
      {!isLoading && !belumAda && !loadError && data && kelompok && (
        <>
          {/* HERO KELOMPOK */}
          <section className="mb-6 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              {/* NAMA KELOMPOK */}
              <div>
                <h2 className="text-2xl font-bold text-white">{kelompok.nama}</h2>
                <p className="text-sm text-white/80 mt-1">
                  {kelompok.periode.nama_periode}
                  {kelompok.periode.tahun_akademik
                    ? ` • TA ${kelompok.periode.tahun_akademik}`
                    : ""}
                </p>

                {statusInfo && (
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                    <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                    {statusInfo.label}
                  </span>
                )}
              </div>

              {/* INFO RINGKAS */}
              <div className="space-y-2.5 md:text-right">
                <p className="flex items-center gap-2 text-sm text-white/90 md:justify-end">
                  <GraduationCap size={16} className="shrink-0" />
                  {dpl?.nama ?? "DPL belum ditetapkan"}
                </p>
                <p className="flex items-center gap-2 text-sm text-white/90 md:justify-end">
                  <MapPin size={16} className="shrink-0" />
                  Desa {kelompok.lokasi.desa}
                </p>
                <p className="flex items-center gap-2 text-sm text-white/90 md:justify-end">
                  <Users size={16} className="shrink-0" />
                  {data.jumlah_anggota} Mahasiswa
                </p>
              </div>
            </div>
          </section>

          {/* DPL PEMBIMBING */}
          <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
                <GraduationCap size={22} />
              </span>

              <div>
                <p className="text-xs text-gray-500">
                  Dosen Pembimbing Lapangan (DPL)
                </p>
                <p className="mt-0.5 font-bold text-gray-900">
                  {dpl?.nama ?? "Belum ditetapkan"}
                </p>
                {dplProdiFakultas && (
                  <p className="text-xs text-gray-400 mt-0.5">{dplProdiFakultas}</p>
                )}
              </div>
            </div>

            {dpl?.nomor_hp ? (
              <a
                href={waLink(dpl.nomor_hp)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 cursor-pointer sm:self-auto"
              >
                <Phone size={15} />
                Hubungi
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="Nomor HP DPL belum tersedia"
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400 sm:self-auto"
              >
                <Phone size={15} />
                Hubungi
              </button>
            )}
          </section>

          {/* DAFTAR ANGGOTA + STATISTIK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* DAFTAR ANGGOTA */}
            <section className="lg:col-span-7 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  Daftar Anggota
                </h3>
                <span className="text-xs text-gray-400">
                  {data.jumlah_anggota} mahasiswa
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {data.anggota.map((a) => (
                  <div
                    key={a.peserta_id}
                    className={`flex items-center gap-3 px-5 py-3.5 ${
                      a.is_saya ? "bg-red-50/60" : ""
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarOf(a.nama)}`}
                    >
                      {initialsOf(a.nama)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-800">
                        {a.nama}
                        {a.is_saya && (
                          <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Saya
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-gray-400 mt-0.5">
                        {a.prodi ?? a.fakultas ?? "-"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                      Anggota
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* STATISTIK */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-green-50 p-5 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <BookOpen size={18} />
                </span>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {data.stats.logbook_minggu_ini}
                </p>
                <p className="mt-1 text-xs text-gray-500">Logbook Minggu Ini</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FileText size={18} />
                </span>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {data.stats.dokumen_kelompok}
                </p>
                <p className="mt-1 text-xs text-gray-500">Dokumen Kelompok</p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  Proposal, logbook, laporan akhir
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Eye,
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getKkmKelompokById } from "./kkmKelompok.api";
import type { KkmKelompokAnggota, KkmKelompokDetail } from "./kkmKelompok.types";

/** Urutan tahap monitoring dari BE (semakin besar = semakin maju). */
const TAHAPAN_RANK: Record<string, number> = {
  MONITORING_DPL: 0,
  PROGRAM_KERJA: 1,
  LOGBOOK_AKTIF: 2,
  LAPORAN_AKHIR: 3,
  SELESAI: 4,
};

type TahapanItem = { label: string; done: boolean; active: boolean };

/**
 * Tahapan KKM untuk halaman ini (3 baris, tanpa Program Kerja):
 * - Pembekalan  → tanggal `progress.stages` PEMBEKALAN sudah lewat
 * - Logbook Aktif → tahap monitoring >= LOGBOOK_AKTIF
 * - Laporan Akhir  → tahap monitoring >= LAPORAN_AKHIR
 * Item pertama yang belum selesai ditandai merah (tahap aktif).
 */
const buildTahapan = (detail: KkmKelompokDetail | null): TahapanItem[] => {
  if (!detail) return [];

  const stageDone = (key: string) =>
    detail.progress.stages.find((stage) => stage.key === key)?.done ?? false;

  const rank = TAHAPAN_RANK[detail.monitoring?.tahapan ?? "MONITORING_DPL"] ?? 0;

  const items = [
    { label: "Pembekalan", done: stageDone("PEMBEKALAN") },
    { label: "Logbook Aktif", done: rank >= TAHAPAN_RANK.LOGBOOK_AKTIF },
    { label: "Laporan Akhir", done: rank >= TAHAPAN_RANK.LAPORAN_AKHIR },
  ];

  const activeIndex = items.findIndex((item) => !item.done);
  return items.map((item, index) => ({
    ...item,
    active: !item.done && index === activeIndex,
  }));
};

const getProgressColor = (progress: number) => {
  if (progress >= 75) return "bg-green-500";
  return "bg-red-600";
};

const getApiErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  fallback;

export default function DetailKelompokBimbingan() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Validasi id di-render (bukan di effect) agar tidak ada setState sinkron.
  const validId = Boolean(id) && !Number.isNaN(Number(id));

  const [detail, setDetail] = useState<KkmKelompokDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnggota, setSelectedAnggota] = useState<KkmKelompokAnggota | null>(null);

  useEffect(() => {
    if (!validId || !id) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getKkmKelompokById(id);
        if (!cancelled) setDetail(res.data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Gagal memuat detail kelompok."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, validId]);

  const tahapan = buildTahapan(detail);
  const progress = detail?.monitoring?.progress ?? 0;

  if (!validId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-6">
          <AlertTriangle size={18} className="shrink-0" />
          ID kelompok tidak valid.
        </div>
        <button
          type="button"
          onClick={() => navigate("/dosen-dashboard/kkm/kelompok-bimbingan")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelompok Bimbingan
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <Loader2 size={18} className="animate-spin text-red-600" />
        Memuat detail kelompok...
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-6">
          <AlertTriangle size={18} className="shrink-0" />
          {error || "Kelompok tidak ditemukan."}
        </div>
        <button
          type="button"
          onClick={() => navigate("/dosen-dashboard/kkm/kelompok-bimbingan")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelompok Bimbingan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => navigate("/dosen-dashboard/kkm/kelompok-bimbingan")}
          className="mt-1 p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          title="Kembali ke Kelompok Bimbingan"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{detail.nama}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelompok Bimbingan DPL — {detail.periode.nama_periode}
          </p>
        </div>
      </div>

      {/* Grid Utama: Kolom Kiri & Kolom Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ==================== KOLOM KIRI ==================== */}
        <div className="space-y-6">
          {/* Card: Informasi Kelompok */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Informasi Kelompok
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">Desa</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {detail.lokasi.desa}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">Kecamatan</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {detail.lokasi.kecamatan}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">Jumlah Anggota</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {detail.jumlah_anggota} Mahasiswa
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-400 font-medium">Progress</span>
                <span className="text-gray-900 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                    progress,
                  )}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card: Tahapan KKM */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5">Tahapan KKM</h2>

            <div className="space-y-4">
              {tahapan.map((item) => (
                <div key={item.label} className="flex items-center gap-3.5">
                  {item.done ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : item.active ? (
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0" />
                  )}

                  <span
                    className={`text-sm ${
                      item.done
                        ? "font-medium text-green-600"
                        : item.active
                          ? "font-semibold text-red-600"
                          : "font-medium text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== KOLOM KANAN ==================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Daftar Anggota */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Daftar Anggota</h2>
              <span className="text-xs text-gray-400 font-medium">
                {detail.anggota.length} mahasiswa
              </span>
            </div>

            {/* Tabel Anggota */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold tracking-wider">
                    <th className="pb-3 font-semibold uppercase">NAMA</th>
                    <th className="pb-3 font-semibold uppercase">NIM</th>
                    <th className="pb-3 font-semibold uppercase">PROGRAM STUDI</th>
                    <th className="pb-3 font-semibold uppercase text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {detail.anggota.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400">
                        Belum ada anggota.
                      </td>
                    </tr>
                  )}
                  {detail.anggota.map((mhs) => (
                    <tr
                      key={mhs.peserta_id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-3.5 font-medium text-gray-900">{mhs.nama}</td>
                      <td className="py-3.5 text-gray-500 font-mono">{mhs.nim}</td>
                      <td className="py-3.5 text-gray-600">{mhs.prodi ?? "-"}</td>
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedAnggota(mhs)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100 cursor-pointer inline-flex items-center justify-center"
                          title="Lihat Detail Anggota"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail Anggota (Aksi Eye Icon) */}
      {selectedAnggota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User size={18} className="text-red-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Profil Mahasiswa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnggota(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="text-base font-bold text-gray-900">
                  {selectedAnggota.nama}
                </h4>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  NIM: {selectedAnggota.nim}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                  <GraduationCap size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Program Studi</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {selectedAnggota.prodi ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Email Kampus</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {selectedAnggota.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-400">Nomor WhatsApp</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {selectedAnggota.nomor_hp || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAnggota(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

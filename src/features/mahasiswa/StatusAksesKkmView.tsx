import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hourglass,
  Minus,
  ShieldCheck,
  SlidersHorizontal,
  Calendar,
  Check,
  RotateCw,
  HelpCircle,
  BookOpen,
  ClipboardList,
  Info,
  Headphones,
  Mail,
  MessageSquare,
  X,
  Phone,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { useKkmMahasiswaAccessStore } from "@/features/kkm/kkmMahasiswaAccess.store";

export default function StatusAksesKkmView() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const checkAccess = useKkmMahasiswaAccessStore((state) => state.checkAccess);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const userName = user?.name || "Andi Pratama";
  const userNim =
    (user as { nim?: string })?.nim || user?.username || "210511042";

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      await checkAccess();
      setRefreshMessage("Pengecekan status selesai. Berkas Anda masih dalam antrean verifikasi.");
    } catch {
      setRefreshMessage("Gagal memeriksa status terkini.");
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb / Header Row ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Portal Mahasiswa</span>
          <span className="text-gray-400 font-semibold">&gt;</span>
          <span className="font-bold text-gray-900">Status Akses KKM</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-white border border-gray-100 rounded-full px-3.5 py-1.5 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-amber-600" />
          <span>Semester Gasal 2024/2025</span>
        </div>
      </div>

      {refreshMessage && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 flex items-center justify-between">
          <span>{refreshMessage}</span>
          <button
            onClick={() => setRefreshMessage(null)}
            className="text-blue-500 hover:text-blue-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Main Verification Pending Card (Matches Screenshot 2026-10-22 103009.png) ── */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm text-center relative overflow-hidden">
        {/* Hourglass Icon */}
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100 shadow-2xs">
          <Hourglass size={30} className="text-red-500" />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-amber-300 text-amber-600 shadow-xs">
            <Minus size={12} className="stroke-[3]" />
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="mt-4 inline-block rounded-full bg-amber-100 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
          TAHAP VERIFIKASI BERKAS
        </div>

        {/* Heading */}
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Akses Modul KKM Sedang Dalam Proses Verifikasi
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-gray-500">
          Akun institusi Anda (
          <strong className="font-semibold text-gray-800">{userName}</strong> •
          NIM <strong className="font-semibold text-gray-800">{userNim}</strong>
          ) telah aktif. Saat ini panitia LPPM UMC sedang meninjau syarat
          akademik dan kelayakan berkas pendaftaran KKM Anda.
        </p>

        {/* 3 Information Cards */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 text-left">
          {/* Card 1: Status SSO */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-blue-100/60 bg-[#f0f4f9] p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-2xs">
              <ShieldCheck size={22} className="text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                STATUS SSO UMC
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <p className="text-sm font-bold text-gray-900">
                  Aktif &amp; Terhubung
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Pemeriksaan Berkas */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-blue-100/60 bg-[#f0f4f9] p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-2xs">
              <SlidersHorizontal size={22} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                PEMERIKSAAN BERKAS
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <p className="text-sm font-bold text-gray-900">
                  Menunggu Verifikasi
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Jadwal Ploting */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-blue-100/60 bg-[#f0f4f9] p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-500 shadow-2xs">
              <Calendar size={22} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                JADWAL PLOTING
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-gray-800" />
                <p className="text-sm font-bold text-gray-900">
                  Gelombang 1 (Reguler)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper (3 Steps Progress) */}
        <div className="mx-auto mt-10 max-w-3xl px-2">
          <div className="flex items-center justify-between">
            {/* Step 1: Akun Terdaftar */}
            <div className="flex flex-col items-center text-center w-28">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-xs">
                <Check size={16} className="stroke-[3]" />
              </div>
              <p className="mt-2 text-xs font-bold text-gray-900">
                Akun Terdaftar
              </p>
              <p className="text-[11px] text-gray-400 font-medium">Tervalidasi</p>
            </div>

            {/* Red Connecting Line */}
            <div className="h-0.5 flex-1 bg-red-500 -mt-8 mx-2" />

            {/* Step 2: Verifikasi Berkas (In Progress) */}
            <div className="flex flex-col items-center text-center w-28">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-white text-red-500 shadow-2xs">
                <RotateCw size={14} className="stroke-[2.5]" />
              </div>
              <p className="mt-2 text-xs font-bold text-red-600">
                Verifikasi Berkas
              </p>
              <p className="text-[11px] text-gray-400 font-medium">
                Sedang Ditinjau
              </p>
            </div>

            {/* Gray Connecting Line */}
            <div className="h-0.5 flex-1 bg-gray-200 -mt-8 mx-2" />

            {/* Step 3: Akun Aktif (Pending) */}
            <div className="flex flex-col items-center text-center w-28">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-bold text-gray-400">
                3
              </div>
              <p className="mt-2 text-xs font-bold text-gray-400">Akun Aktif</p>
              <p className="text-[11px] text-gray-400 font-medium">Selesai</p>
            </div>
          </div>
        </div>

        {/* 3 Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/mahasiswa-dashboard/pilih-skema")}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
          >
            <ClipboardList size={15} />
            Pilih Skema KKM
          </button>

          <button
            type="button"
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-700 shadow-xs hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-75"
          >
            <RotateCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Memeriksa..." : "Refresh Status"}
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200/60 bg-[#eef4fb] px-5 py-2.5 text-sm font-semibold text-blue-900 hover:bg-[#e2eefa] transition-colors cursor-pointer"
          >
            <HelpCircle size={15} />
            Bantuan / Kontak LPPM
          </button>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            <BookOpen size={15} />
            Buku Panduan KKM
          </button>
        </div>

        {/* Notice Box */}
        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-blue-100/80 bg-[#f4f8fd] p-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-gray-600">
              <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <strong className="font-bold text-gray-900">
                  Petunjuk Bagi Mahasiswa:
                </strong>{" "}
                Pastikan nomor WhatsApp dan email di{" "}
                <button
                  type="button"
                  onClick={() => navigate("/mahasiswa-dashboard/profile")}
                  className="font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Profil Saya
                </button>{" "}
                selalu aktif. Pengumuman kelompok akan disampaikan serentak
                melalui portal ini.
              </div>
            </div>
            <div className="shrink-0 font-medium text-gray-500 sm:text-right">
              Estimasi Verifikasi: 1-2 Hari Kerja
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-gray-200/60 pt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Headphones size={15} className="text-red-500 shrink-0" />
          <span>
            Layanan Bantuan Panitia KKM LPPM UMC Gedung Djuanda Lt. 1 | Ruang LPPM
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-gray-500">
          <a
            href="mailto:lppm@umc.ac.id"
            className="inline-flex items-center gap-1.5 hover:text-red-600 transition-colors"
          >
            <Mail size={14} />
            <span>lppm@umc.ac.id</span>
          </a>
          <span>•</span>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-green-600 transition-colors"
          >
            <MessageSquare size={14} />
            <span>WhatsApp Helpdesk KKM</span>
          </a>
        </div>
      </div>

      {/* ── Modal Bantuan / Kontak LPPM ── */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                <HelpCircle size={18} className="text-blue-600" />
                <span>Bantuan &amp; Kontak LPPM</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Jika Anda memerlukan verifikasi segera atau memiliki kendala
              persyaratan akademik KKM, silakan hubungi kontak panitia KKM
              berikut:
            </p>

            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1">
                <p className="font-bold text-gray-800">Sekretariat Panitia KKM</p>
                <p className="text-gray-500 flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400 shrink-0" />
                  Gedung Djuanda Lt. 1, Kampus 1 UMC
                </p>
                <p className="text-gray-500 flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400 shrink-0" />
                  Jam Operasional: Senin – Jumat (08.00 – 16.00 WIB)
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <div>
                  <p className="font-bold text-blue-950">Helpdesk WhatsApp</p>
                  <p className="text-gray-500">+62 812-3456-7890</p>
                </div>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                >
                  Chat WA
                </a>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Buku Panduan KKM ── */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                <BookOpen size={18} className="text-red-600" />
                <span>Buku Panduan KKM UMC</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Buku Panduan Pelaksanaan Kuliah Kerja Mahasiswa (KKM) memuat
              informasi mengenai alur pelaksanaan, pembuatan logbook, format
              laporan mingguan &amp; akhir, serta pedoman penilaian.
            </p>

            <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-xs space-y-2">
              <p className="font-bold text-red-950">
                Panduan KKM Reguler &amp; Tematik 2024/2025
              </p>
              <p className="text-gray-500">Format: Dokumen PDF resmi LPPM UMC</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                Tutup
              </button>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Dokumen Buku Panduan KKM dapat diunduh setelah berkas diverifikasi.");
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Unduh Panduan (PDF)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ChevronDown,
  CalendarDays,
  Users,
  CalendarClock,
  Info,
} from "lucide-react";

import { getKkmSkema } from "./kkmSkema.api";
import type {
  GetKkmSkemaResponse,
  SkemaJenis,
} from "./kkmSkema.types";
import { getPendaftaranMe } from "./kkmPendaftaran.api";
import type { PendaftaranStatus } from "./kkmPendaftaran.api";
import { useAuthStore } from "@/features/auth/auth.store";

// ==================== HELPERS ====================

const FMT_TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const FMT_BULAN = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});

/** ISO → "31 Okt 2026" (null bila kosong/tidak valid) */
const fmtTanggal = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return FMT_TANGGAL.format(d);
};

/** Rentang bulan pelaksanaan → penarikan: "Nov 2026 – Des 2026" */
const fmtRangeBulan = (mulai?: string | null, selesai?: string | null): string | null => {
  if (!mulai || !selesai) return null;
  const a = new Date(mulai);
  const b = new Date(selesai);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return `${FMT_BULAN.format(a)} – ${FMT_BULAN.format(b)}`;
};

const JENIS_LABEL: Record<string, string> = {
  REGULER: "Reguler",
  TEMATIK: "Tematik",
};

const jenisLabel = (jenis: string): string =>
  JENIS_LABEL[jenis] ?? jenis.charAt(0) + jenis.slice(1).toLowerCase();

/** Gaya badge kartu + warna bar kuota per jenis (fallback biru) */
const jenisStyle = (jenis: string) => {
  if (jenis === "REGULER") return { badge: "bg-red-50 text-red-600", bar: "bg-green-500" };
  if (jenis === "TEMATIK") return { badge: "bg-amber-50 text-amber-700", bar: "bg-amber-500" };
  return { badge: "bg-blue-50 text-blue-600", bar: "bg-blue-500" };
};

// ==================== SUB COMPONENTS ====================

// ==================== MAIN ====================

export default function PilihSkemaKKM() {
  const { search } = useOutletContext<{ search: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isMahasiswa = user?.roles?.roles === "MAHASISWA";

  // base = fetch TANPA jenis (untuk angka tab), view = fetch DENGAN jenis (kartu)
  const [base, setBase] = useState<GetKkmSkemaResponse | null>(null);
  const [view, setView] = useState<GetKkmSkemaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [jenisFilter, setJenisFilter] = useState<SkemaJenis | "">("");
  const [wilayahFilter, setWilayahFilter] = useState("");

  // Status pendaftaran saya per periode — menentukan label/tombol kartu.
  const [pendaftaranByPeriode, setPendaftaranByPeriode] = useState<
    Map<number, PendaftaranStatus>
  >(new Map());

  useEffect(() => {
    if (!isMahasiswa) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await getPendaftaranMe();
        if (cancelled) return;
        const m = new Map<number, PendaftaranStatus>();
        rows.forEach((r) => m.set(r.periode_id, r.status));
        setPendaftaranByPeriode(m);
      } catch {
        // abaikan — tombol tetap memakai label default
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isMahasiswa]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const wilayah = wilayahFilter || undefined;
        const baseP = getKkmSkema({ wilayah });
        const viewP = jenisFilter
          ? getKkmSkema({ jenis: jenisFilter, wilayah })
          : baseP;
        const [baseRes, viewRes] = await Promise.all([baseP, viewP]);
        if (cancelled) return;
        setBase(baseRes);
        setView(viewRes);
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };
        const status = e.response?.status;
        setError(
          status === 401
            ? "Sesi berakhir, silakan login ulang."
            : status === 403
              ? "Akses ditolak — halaman ini untuk mahasiswa (admin/staff untuk preview)."
              : e.response?.data?.message ||
                e.message ||
                "Gagal memuat daftar skema KKM.",
        );
        setBase(null);
        setView(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [jenisFilter, wilayahFilter]);

  /* ---------------- Turunan (tampilan saja; logika kartu ada di BE) ---------------- */

  const stats = view?.stats;
  const periode = view?.periode_aktif;
  const filters = view?.filters;

  const sisaHari = useMemo(() => {
    if (!stats?.batas_akhir) return null;
    const diff = new Date(stats.batas_akhir).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }, [stats?.batas_akhir]);

  /** Angka tab dihitung dari fetch dasar (tanpa jenis) — stats tidak punya per-jenis count */
  const tabCounts = useMemo(() => {
    const list = base?.skema ?? [];
    const byJenis = new Map<string, number>();
    list.forEach((s) => byJenis.set(s.jenis, (byJenis.get(s.jenis) ?? 0) + 1));
    return { semua: list.length, byJenis };
  }, [base]);

  /** Filter pencarian client-side (topbar) — BE tidak punya param search */
  const q = search.trim().toLowerCase();
  const cards = useMemo(() => {
    const list = view?.skema ?? [];
    if (!q) return list;
    return list.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        (s.deskripsi ?? "").toLowerCase().includes(q) ||
        s.wilayah.some((w) => w.toLowerCase().includes(q)),
    );
  }, [view, q]);

  const jenisOptions = (filters?.jenis ?? []) as string[];
  const wilayahOptions = filters?.wilayah ?? [];

  const isEmpty = Boolean(view) && cards.length === 0;
  const emptyText = q
    ? "Tidak ada skema yang cocok dengan pencarian."
    : jenisFilter || wilayahFilter
      ? "Tidak ada skema yang cocok dengan filter."
      : "Belum ada skema KKM yang terbuka pendaftarannya.";

  const steps = [
    {
      n: 1,
      title: "Pilih Skema KKM",
      desc: "Tahap saat ini. Menentukan fokus pengabdian sesuai prodi dan kuota.",
      active: true,
    },
    {
      n: 2,
      title: "Formulir & Lokasi",
      desc: "Pengisian identitas, kesehatan, kontak ortu, dan preferensi desa.",
    },
    {
      n: 3,
      title: "Unggah Berkas",
      desc: "Unggah transkrip nilai, bukti SPP, surat izin orang tua & pakta integritas.",
    },
    {
      n: 4,
      title: "Verifikasi Panitia",
      desc: "Review kelayakan oleh panitia LPPM, penentuan SK, dan penetapan DPL.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb + Semester */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400">
          <span>Portal Mahasiswa</span>
          <span>›</span>
          <span>Pendaftaran KKM</span>
          <span>›</span>
          <span className="text-red-600 font-semibold">Pilih Skema KKM</span>
        </nav>
        {periode && (
          <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Semester {periode.tahun_akademik}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* HERO */}
      <div className="rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white p-6 sm:p-8 shadow-sm">
        <span className="inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          PENDAFTARAN DIBUKA
          {stats?.batas_akhir && fmtTanggal(stats.batas_akhir)
            ? ` · s.d. ${fmtTanggal(stats.batas_akhir)}`
            : ""}
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold">
          Pilih Skema Kuliah Kerja Mahasiswa (KKM)
        </h1>
        <p className="mt-2 text-sm sm:text-base text-white/90 max-w-3xl leading-relaxed">
          Silakan pilih salah satu skema pengabdian masyarakat di bawah ini yang
          sesuai dengan minat, program studi, dan kompetensi Anda, lalu tekan
          tombol pendaftaran untuk mengisi formulir daring. Pendaftaran terbuka
          untuk mahasiswa semester 7.
        </p>
      </div>

      {/* STAT CARDS — 3 kartu (Prasyarat SKS disembunyikan, belum ada field di BE) */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <CalendarDays size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Total Skema Terbuka</p>
            <p className="text-lg font-bold text-gray-800">
              {isLoading && !view ? "…" : `${stats?.total_skema ?? 0} Skema Pilihan`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Akumulasi Kuota</p>
            <p className="text-lg font-bold text-gray-800">
              {isLoading && !view ? (
                "…"
              ) : (
                <>
                  {(stats?.akumulasi_terisi ?? 0).toLocaleString("id-ID")} /{" "}
                  {(stats?.akumulasi_kuota ?? 0).toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-medium text-gray-400">Terisi</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <CalendarClock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Batas Akhir Pendaftaran</p>
            <p className="text-lg font-bold text-gray-800">
              {isLoading && !view ? "…" : (fmtTanggal(stats?.batas_akhir) ?? "-")}
            </p>
            {sisaHari !== null && !isLoading && (
              <p className="text-xs font-semibold text-red-500">
                {sisaHari > 0 ? `(Sisa ${sisaHari} Hari)` : "(Berakhir hari ini)"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* TABS + WILAYAH */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setJenisFilter("")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              jenisFilter === ""
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Semua Skema ({tabCounts.semua})
          </button>
          {jenisOptions.map((j) => (
            <button
              key={j}
              onClick={() => setJenisFilter(j as SkemaJenis)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                jenisFilter === j
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Skema {jenisLabel(j)} ({tabCounts.byJenis.get(j) ?? 0})
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={wilayahFilter}
            onChange={(e) => setWilayahFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
          >
            <option value="">Semua Wilayah Penempatan</option>
            {wilayahOptions.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* GRID KARTU */}
      {isLoading && !view ? (
        <div className="grid lg:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center text-sm text-gray-400">
          {emptyText}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {cards.map((skema) => {
            const style = jenisStyle(skema.jenis);
            const range = fmtRangeBulan(skema.tanggal.pelaksanaan, skema.tanggal.penarikan);
            const batas = fmtTanggal(skema.batas_daftar);
            const buka = fmtTanggal(skema.tanggal.buka_daftar);
            const myStatus = pendaftaranByPeriode.get(skema.id);
            /** DIJADWAKAN: tampil lengkap tapi tombol daftar nonaktif ("segera dibuka"). */
            const comingSoon = skema.status === "DIJADWALKAN";
            return (
              <div
                key={skema.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
              >
                {/* Badge jenis + indikasi segera dibuka */}
                <div className="inline-flex self-start items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}
                  >
                    {jenisLabel(skema.jenis)}
                  </span>
                  {comingSoon && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                      SEGERA DIBUKA
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold text-gray-900">{skema.nama}</h3>
                {skema.deskripsi && (
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                    {skema.deskripsi}
                  </p>
                )}

                {/* Detail: hanya baris yang tersedia di BE */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Durasi Pengabdian</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {skema.durasi_hari ?? "-"} Hari
                      {range ? <span className="font-normal text-gray-500"> ({range})</span> : null}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Lokasi Penempatan</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {skema.wilayah.length > 0 ? skema.wilayah.join(", ") : "-"}
                    </p>
                  </div>
                </div>

                {/* Kuota */}
                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between text-sm mb-1.5 gap-2">
                    <span className="font-semibold text-gray-800">
                      Sisa Kuota:{" "}
                      <span className="text-gray-600">
                        {skema.sisa.toLocaleString("id-ID")} Mahasiswa
                      </span>
                    </span>
                    <span className="text-gray-500">
                      <span className="font-semibold text-gray-800">
                        {skema.terisi.toLocaleString("id-ID")}
                      </span>{" "}
                      / {skema.kuota.toLocaleString("id-ID")} Terisi
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${style.bar}`}
                      style={{ width: `${Math.max(0, Math.min(100, skema.persentase_terisi))}%` }}
                    />
                  </div>
                  {skema.menunggu > 0 && (
                    <p className="mt-1.5 text-xs text-gray-400">
                      {skema.menunggu.toLocaleString("id-ID")} mahasiswa menunggu verifikasi
                    </p>
                  )}
                </div>

                {/* Aksi pendaftaran — mengikuti status pendaftaran saya */}
                {!isMahasiswa ? (
                  <button
                    type="button"
                    disabled
                    title="Pendaftaran khusus mahasiswa (semester 7)"
                    className="mt-4 w-full py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold opacity-50 cursor-not-allowed"
                  >
                    Khusus Mahasiswa
                  </button>
                ) : myStatus === "VERIFIED" ? (
                  <button
                    type="button"
                    disabled
                    title="Pendaftaran Anda pada periode ini sudah terverifikasi"
                    className="mt-4 w-full py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-semibold cursor-not-allowed"
                  >
                    ✓ Sudah Terdaftar
                  </button>
                ) : myStatus === "PENDING" ? (
                  <button
                    type="button"
                    disabled
                    title="Pendaftaran sudah dikirim — menunggu verifikasi admin LPPM"
                    className="mt-4 w-full py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold cursor-not-allowed"
                  >
                    ⏳ Menunggu Verifikasi
                  </button>
                ) : comingSoon ? (
                  <button
                    type="button"
                    disabled
                    title={
                      myStatus === "DRAFT" || myStatus === "REJECTED"
                        ? "Pendaftaran sementara dikunci — draft Anda tersimpan, lanjutkan setelah periode diaktifkan panitia"
                        : buka
                          ? `Pendaftaran dijadwalkan dibuka ${buka}`
                          : "Pendaftaran belum dibuka — segera dibuka"
                    }
                    className="mt-4 w-full py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 text-sm font-semibold cursor-not-allowed"
                  >
                    ⏰ Segera Dibuka
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/mahasiswa-dashboard/pendaftaran/${skema.id}`)
                    }
                    className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      myStatus === "DRAFT"
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : myStatus === "REJECTED"
                          ? "bg-red-50 border border-red-300 text-red-700 hover:bg-red-100"
                          : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {myStatus === "DRAFT"
                      ? "Lanjutkan Pendaftaran →"
                      : myStatus === "REJECTED"
                        ? "Ajukan Ulang Pendaftaran →"
                        : "Daftar Skema Ini →"}
                  </button>
                )}
                <p className="mt-2 text-center text-xs text-gray-400">
                  {comingSoon
                    ? buka
                      ? `Pendaftaran dibuka ${buka}${batas ? ` • Batas akhir ${batas}` : ""}`
                      : "Pendaftaran segera dibuka"
                    : batas
                      ? `Batas akhir pendaftaran: ${batas}`
                      : "Pendaftaran dibuka terbatas"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ALUR PENDAFTARAN */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800">
            Alur Pendaftaran KKM
            {periode ? ` Periode ${periode.tahun_akademik}` : ""}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Tahapan wajib yang harus diselesaikan setiap mahasiswa pendaftar KKM
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className={`rounded-xl border p-4 ${
                step.active
                  ? "border-red-300 bg-red-50/60"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                    step.active ? "bg-red-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.n}
                </span>
                <p
                  className={`text-sm font-semibold ${
                    step.active ? "text-red-700" : "text-gray-700"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              {step.active && (
                <span className="mt-3 inline-block text-[11px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  Sedang Aktif
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KETENTUAN (teks statis — aturan panitia, tidak ada field BE) */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 flex gap-3">
        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
          <Info size={14} />
        </span>
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Ketentuan Pemilihan Skema:</span> Setiap
          mahasiswa hanya diperkenankan mendaftar pada{" "}
          <span className="font-semibold">1 (satu) skema KKM</span> per periode
          semester. Apabila Anda telah menyelesaikan formulir pendaftaran,
          perubahan skema hanya dapat dilakukan dengan mengajukan pembatalan ke
          Helpdesk LPPM sebelum masa verifikasi berakhir.
        </p>
      </div>

      {/* FOOTER (info kontak statis) */}
      <footer className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-4 text-xs text-gray-400">
        <span>
          Layanan Bantuan Panitia KKM LPPM UMC — Gedung Djuanda Lt. 1 | Ruang LPPM
        </span>
        <span>lppm@umc.ac.id · WhatsApp Helpdesk KKM</span>
      </footer>
    </div>
  );
}

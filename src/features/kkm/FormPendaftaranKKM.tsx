import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Hourglass,
  Info,
  Loader2,
  Send,
  Trash2,
  UploadCloud,
  User as UserIcon,
  XCircle,
} from "lucide-react";

import { getCurrentUser } from "@/features/auth/auth.api";
import type { User } from "@/features/auth/auth.types";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  getFakultasList,
  getProgramStudiList,
} from "@/features/master/fakultas.api";
import type {
  FakultasItem,
  ProgramStudiItem,
} from "@/features/master/fakultas.api";
import { getKkmPeriodById } from "./kkmPeriod.api";
import { getKkmSkema } from "./kkmSkema.api";
import {
  getPendaftaranMe,
  upsertPendaftaran,
  UKURAN_JAKET_OPTIONS,
} from "./kkmPendaftaran.api";
import type { PendaftaranItem } from "./kkmPendaftaran.api";

// ==================== HELPERS ====================

const FMT_TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const fmtTanggal = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return FMT_TANGGAL.format(d);
};

/** Syarat BE: hanya mahasiswa semester ini yang boleh mendaftar. */
const SYARAT_SEMESTER = 7;

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const isValidPhone = (v: string): boolean =>
  /^\+?\d{9,15}$/.test(v.replace(/[\s-]/g, ""));

type Notice = { type: "ok" | "err"; msg: string } | null;

interface FormState {
  no_wa: string;
  ukuran_jaket: string;
  nama_kontak_darurat: string;
  no_hp_kontak_darurat: string;
  alamat_domisili: string;
}

const EMPTY_FORM: FormState = {
  no_wa: "",
  ukuran_jaket: "",
  nama_kontak_darurat: "",
  no_hp_kontak_darurat: "",
  alamat_domisili: "",
};

/**
 * Info periode ringkas untuk tampilan form. Sumber berjenjang:
 * 1) GET /kkm/periods/:id (lengkap), 2) ref periode pada baris pendaftaran
 * saya, 3) kartu GET /kkm/skema (fallback — endpoint detail dahulu 403 utk
 * mahasiswa sehingga form gagal memuat periode).
 */
interface PeriodeInfo {
  id: number;
  nama_periode: string;
  tahun_akademik: string;
  jenis: string;
  status: string;
  tgl_buka_daftar?: string | null;
  tgl_tutup_daftar?: string | null;
}

// ==================== MAIN ====================

/**
 * Formulir pendaftaran KKM mandiri (mahasiswa semester 7).
 * Aksi: Simpan Draft (setengah jalan, tanpa berkas) / Kirim Pendaftaran
 * (seluruh data wajib + bukti UKT + pernyataan → status PENDING, menunggu
 * verifikasi admin LPPM).
 */
export default function FormPendaftaranKKM() {
  const { periodeId } = useParams<{ periodeId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [me, setMe] = useState<User | null>(null);
  const [periode, setPeriode] = useState<PeriodeInfo | null>(null);
  const [row, setRow] = useState<PendaftaranItem | null>(null);
  const [fakultasList, setFakultasList] = useState<FakultasItem[]>([]);
  const [prodiList, setProdiList] = useState<ProgramStudiItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [pernyataan, setPernyataan] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"draft" | "kirim" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const fakultasId = useMemo(() => {
    const n = Number(me?.fakultas);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [me?.fakultas]);
  const prodiId = useMemo(() => {
    const n = Number(me?.program_studi);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [me?.program_studi]);

  /* ---------- Muat data awal: /auth/me, periode, pendaftaran saya, master ---------- */
  useEffect(() => {
    if (!periodeId) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [meRes, periodRes, rows, fakRes] = await Promise.all([
          getCurrentUser().catch(() => null),
          getKkmPeriodById(periodeId).catch(() => null),
          getPendaftaranMe(Number(periodeId)).catch(() => [] as PendaftaranItem[]),
          getFakultasList().catch(() => ({ data: [] as FakultasItem[] })),
        ]);
        if (cancelled) return;

        const meData = meRes?.data ?? null;
        setMe(meData);
        setFakultasList(fakRes.data ?? []);

        const mine = rows[0] ?? null;
        setRow(mine);
        setForm({
          no_wa: mine?.no_wa ?? meData?.nomor_hp ?? "",
          ukuran_jaket: mine?.ukuran_jaket ?? "",
          nama_kontak_darurat: mine?.nama_kontak_darurat ?? "",
          no_hp_kontak_darurat: mine?.no_hp_kontak_darurat ?? "",
          alamat_domisili: mine?.alamat_domisili ?? "",
        });

        // Info periode berjenjang: endpoint detail → ref pada baris saya →
        // kartu portal /kkm/skema (endpoint detail dahulu 403 utk mahasiswa,
        // sehingga form gagal memuat nama periode & jendela pendaftaran).
        let periodeInfo: PeriodeInfo | null = periodRes?.data ?? null;
        if (!periodeInfo && mine?.periode) periodeInfo = mine.periode;
        if (!periodeInfo) {
          const skemaRes = await getKkmSkema().catch(() => null);
          const card = skemaRes?.skema.find(
            (s) => String(s.id) === String(periodeId),
          );
          if (card) {
            periodeInfo = {
              id: card.id,
              nama_periode: card.nama,
              tahun_akademik:
                skemaRes?.periode_aktif?.id === card.id
                  ? skemaRes.periode_aktif.tahun_akademik
                  : "",
              jenis: card.jenis,
              status: card.status,
              tgl_buka_daftar: card.tanggal.buka_daftar,
              tgl_tutup_daftar: card.tanggal.tutup_daftar,
            };
          }
        }
        if (!cancelled) setPeriode(periodeInfo);
        if (!periodeInfo) {
          setLoadError(
            "Periode KKM tidak dapat dimuat. Kembali ke Pilih Skema dan pastikan periode yang dibuka masih menerima pendaftaran.",
          );
        }

        // Daftar prodi untuk fakultas pada data akun (dropdown tampilan)
        const n = Number(meData?.fakultas);
        if (Number.isFinite(n) && n > 0) {
          const prodiRes = await getProgramStudiList(n).catch(() => ({
            data: [] as ProgramStudiItem[],
          }));
          if (!cancelled) setProdiList(prodiRes.data ?? []);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [periodeId]);

  /* ---------- Kelayakan & status ---------- */

  const semester = me?.semester ?? null;
  const semesterOk = semester === SYARAT_SEMESTER;
  const status = row?.status ?? null;
  /** Periode menerima pendaftaran (hanya AKTIF — DIJADWAKAN/non-AKTIF dikunci). */
  const periodeOpen = periode?.status === "AKTIF";
  /** Boleh mengubah & mengirim: semester 7 + belum PENDING/VERIFIED + periode AKTIF. */
  const editable =
    !isLoading &&
    semesterOk &&
    status !== "PENDING" &&
    status !== "VERIFIED" &&
    periodeOpen;

  const requiredFilled = useMemo(() => {
    const f = form;
    return Boolean(
      f.no_wa.trim() &&
        f.ukuran_jaket &&
        f.nama_kontak_darurat.trim() &&
        f.no_hp_kontak_darurat.trim() &&
        f.alamat_domisili.trim() &&
        (file || row?.bukti_ukt_url) &&
        pernyataan,
    );
  }, [form, file, row?.bukti_ukt_url, pernyataan]);

  /* ---------- Berkas bukti UKT ---------- */

  const acceptFile = (f: File): string | null => {
    const extOk = /\.(pdf|jpe?g|png)$/i.test(f.name);
    if (!ALLOWED_MIME.includes(f.type) && !extOk) {
      return "Berkas harus berformat PDF, JPG, atau PNG.";
    }
    if (f.size > MAX_FILE_BYTES) {
      return `Ukuran berkas maksimal 5 MB (${(f.size / (1024 * 1024)).toFixed(1)} MB).`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    const err = acceptFile(f);
    if (err) {
      setNotice({ type: "err", msg: err });
      return;
    }
    setNotice(null);
    setFile(f);
  };

  /* ---------- Simpan ---------- */

  const buildFormData = (aksi: "draft" | "kirim"): FormData => {
    const fd = new FormData();
    fd.append("periode_id", String(periodeId));
    fd.append("aksi", aksi);
    if (form.no_wa.trim()) fd.append("no_wa", form.no_wa.trim());
    if (form.ukuran_jaket) fd.append("ukuran_jaket", form.ukuran_jaket);
    if (form.nama_kontak_darurat.trim())
      fd.append("nama_kontak_darurat", form.nama_kontak_darurat.trim());
    if (form.no_hp_kontak_darurat.trim())
      fd.append("no_hp_kontak_darurat", form.no_hp_kontak_darurat.trim());
    if (form.alamat_domisili.trim())
      fd.append("alamat_domisili", form.alamat_domisili.trim());
    fd.append("pernyataan", pernyataan ? "true" : "false");
    if (file) fd.append("bukti_ukt", file);
    return fd;
  };

  const validateKirim = (): string[] => {
    const missing: string[] = [];
    if (!form.no_wa.trim()) missing.push("No. WhatsApp Aktif");
    else if (!isValidPhone(form.no_wa))
      missing.push("No. WhatsApp Aktif (format tidak valid)");
    if (!form.ukuran_jaket) missing.push("Ukuran Jaket");
    if (!form.nama_kontak_darurat.trim()) missing.push("Nama Kontak Darurat");
    if (!form.no_hp_kontak_darurat.trim()) missing.push("No. HP Kontak Darurat");
    else if (!isValidPhone(form.no_hp_kontak_darurat))
      missing.push("No. HP Kontak Darurat (format tidak valid)");
    if (!form.alamat_domisili.trim()) missing.push("Alamat Domisili");
    if (!file && !row?.bukti_ukt_url) missing.push("Bukti Pembayaran UKT");
    return missing;
  };

  const submit = async (aksi: "draft" | "kirim") => {
    if (saving || !editable) return;

    if (aksi === "kirim") {
      const missing = validateKirim();
      if (missing.length > 0) {
        setNotice({
          type: "err",
          msg: `Lengkapi data wajib: ${missing.join(", ")}.`,
        });
        return;
      }
      if (!pernyataan) {
        setNotice({
          type: "err",
          msg: "Centang pernyataan kebenaran data & kelunasan UKT.",
        });
        return;
      }
    }

    setSaving(aksi);
    setNotice(null);
    try {
      const res = await upsertPendaftaran(buildFormData(aksi));
      setRow(res.data);
      if (aksi === "kirim") setFile(null);
      setNotice({ type: "ok", msg: res.message });
    } catch (err: unknown) {
      const e = err as {
        response?: {
          status?: number;
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const status = e.response?.status;
      const fieldErrors = e.response?.data?.errors;
      const firstField =
        fieldErrors && Object.values(fieldErrors)[0]?.[0]
          ? `${Object.values(fieldErrors)[0][0]}`
          : null;
      setNotice({
        type: "err",
        msg:
          status === 401
            ? "Sesi berakhir, silakan login ulang."
            : firstField || e.response?.data?.message || "Gagal menyimpan pendaftaran.",
      });
    } finally {
      setSaving(null);
    }
  };

  /* ---------- Banner status ---------- */

  const statusBanner = (() => {
    if (!isLoading && !me) {
      return {
        cls: "border-red-200 bg-red-50 text-red-800",
        icon: XCircle,
        text: "Gagal memuat data akun Anda. Muat ulang halaman, atau hubungi admin LPPM bila berlanjut.",
      };
    }
    if (!semesterOk && me && !isLoading) {
      return {
        cls: "border-red-200 bg-red-50 text-red-800",
        icon: XCircle,
        text: `Hanya mahasiswa semester ${SYARAT_SEMESTER} yang dapat mendaftar KKM. Data Anda tercatat semester ${semester ?? "-"}. Hubungi admin LPPM bila data semester Anda keliru.`,
      };
    }
    if (status === "VERIFIED") {
      return {
        cls: "border-green-200 bg-green-50 text-green-800",
        icon: CheckCircle2,
        text: "Pendaftaran Anda sudah terverifikasi — menu KKM (Kelompok Saya, Logbook, Laporan, Nilai) telah terbuka. Formulir ini dikunci.",
      };
    }
    if (status === "PENDING") {
      return {
        cls: "border-amber-200 bg-amber-50 text-amber-800",
        icon: Hourglass,
        text: "Pendaftaran sudah dikirim dan sedang menunggu verifikasi admin LPPM (estimasi 1–2 hari kerja). Formulir dikunci sampai keputusan verifikasi.",
      };
    }
    if (periode && periode.status !== "AKTIF") {
      return {
        cls: "border-amber-200 bg-amber-50 text-amber-800",
        icon: CalendarDays,
        text:
          periode.status === "DIJADWALKAN"
            ? "Pendaftaran pada periode ini belum dibuka (masih dijadwalkan). Formulir terkunci sampai panitia mengaktifkan periode — cek tanggal pembukaan di halaman Pilih Skema."
            : "Periode ini tidak dalam masa pendaftaran — formulir dikunci.",
      };
    }
    if (status === "REJECTED") {
      return {
        cls: "border-red-200 bg-red-50 text-red-800",
        icon: XCircle,
        text: "Pendaftaran Anda ditolak admin LPPM. Silakan perbaiki data di bawah ini lalu ajukan ulang.",
      };
    }
    if (status === "DRAFT") {
      return {
        cls: "border-blue-200 bg-blue-50 text-blue-800",
        icon: ClipboardList,
        text: "Draft pendaftaran tersimpan. Lengkapi seluruh data wajib dan unggah bukti UKT, lalu tekan “Kirim Pendaftaran KKM”.",
      };
    }
    return null;
  })();

  const renderNotice = (n: Notice) =>
    n ? (
      <div
        className={`rounded-xl border px-4 py-3 text-sm flex items-start justify-between gap-3 ${
          n.type === "ok"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        <span>{n.msg}</span>
        <button
          type="button"
          onClick={() => setNotice(null)}
          className="shrink-0 opacity-60 hover:opacity-100"
          aria-label="Tutup notifikasi"
        >
          <XCircle size={15} />
        </button>
      </div>
    ) : null;

  /* ---------- Render ---------- */

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400";
  const readonlyCls =
    "w-full rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed";
  const labelCls =
    "block text-xs font-semibold text-gray-600 mb-1.5";

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-6 w-64 animate-pulse rounded bg-gray-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb + badge tahun akademik */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate("/mahasiswa-dashboard/pilih-skema")}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            Pilih Skema
          </button>
          <span className="text-gray-400 font-semibold">&gt;</span>
          <span className="font-bold text-gray-900">Formulir Pendaftaran KKM</span>
        </div>
        {periode && periode.tahun_akademik && (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Tahun Akademik {periode.tahun_akademik}
          </span>
        )}
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {renderNotice(notice)}
      {statusBanner && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-2.5 ${statusBanner.cls}`}
        >
          <statusBanner.icon size={17} className="mt-0.5 shrink-0" />
          <span>{statusBanner.text}</span>
        </div>
      )}

      {/* Header ringkas */}
      <div className="rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">
              <ClipboardList size={12} />
              PENDAFTARAN KKM {periode?.jenis === "TEMATIK" ? "TEMATIK" : "REGULER"}
            </span>
            <h1 className="mt-2.5 text-xl sm:text-2xl font-bold">
              {periode?.nama_periode ?? "Formulir Pendaftaran Mandiri"}
            </h1>
            <p className="mt-1.5 text-sm text-white/90">
              Isi data diri Anda dengan benar, unggah bukti pembayaran UKT, lalu
              kirim pendaftaran untuk diverifikasi panitia LPPM.
            </p>
          </div>
          {periode && (periode.tgl_buka_daftar || periode.tgl_tutup_daftar) && (
            <div className="bg-white/15 border border-white/25 rounded-xl px-3.5 py-2.5 text-xs">
              <p className="flex items-center gap-1.5 font-semibold">
                <CalendarDays size={13} />
                Periode Pendaftaran
              </p>
              <p className="mt-1 text-white/90">
                {fmtTanggal(periode.tgl_buka_daftar) ?? "—"} s.d.{" "}
                {fmtTanggal(periode.tgl_tutup_daftar) ?? "—"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── DATA MAHASISWA ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <UserIcon size={17} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Data Mahasiswa <span className="font-medium text-gray-400">(Input Mandiri)</span>
            </h2>
            <p className="text-xs text-gray-400">
              Kolom bertanda kunci mengikuti data akun Anda.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="f-nim">NIM</label>
            <input
              id="f-nim"
              className={readonlyCls}
              value={me?.nim || me?.username || ""}
              readOnly
              placeholder="-"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="f-nama">Nama Lengkap</label>
            <input
              id="f-nama"
              className={readonlyCls}
              value={me?.name || user?.name || ""}
              readOnly
              placeholder="-"
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="f-fak">Fakultas</label>
            <div className="relative">
              <select
                id="f-fak"
                value={fakultasId ? String(fakultasId) : ""}
                disabled
                className={`${readonlyCls} appearance-none pr-9 cursor-not-allowed`}
              >
                <option value="">
                  {fakultasList.length > 0 ? "Pilih Fakultas" : "—"}
                </option>
                {fakultasList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nama}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="f-prodi">Program Studi</label>
            <div className="relative">
              <select
                id="f-prodi"
                value={prodiId ? String(prodiId) : ""}
                disabled
                className={`${readonlyCls} appearance-none pr-9 cursor-not-allowed`}
              >
                <option value="">
                  {prodiList.length > 0 ? "Pilih Program Studi" : "—"}
                </option>
                {prodiList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="text-[11px] text-gray-400 -mt-1 mb-1">
              Fakultas &amp; program studi mengikuti data akun — hubungi admin
              LPPM bila ingin mengubahnya.
            </p>
          </div>

          <div>
            <label className={labelCls} htmlFor="f-wa">
              No. WhatsApp Aktif <span className="text-red-500">*</span>
            </label>
            <input
              id="f-wa"
              type="tel"
              inputMode="tel"
              disabled={!editable}
              className={editable ? inputCls : `${readonlyCls} cursor-not-allowed`}
              placeholder="08xxxxxxxxxx"
              value={form.no_wa}
              onChange={(e) => setForm({ ...form, no_wa: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="f-email">Email</label>
            <input
              id="f-email"
              className={readonlyCls}
              value={me?.email || user?.email || ""}
              readOnly
              placeholder="-"
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="f-jaket">
              Ukuran Jaket <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="f-jaket"
                disabled={!editable}
                value={form.ukuran_jaket}
                onChange={(e) => setForm({ ...form, ukuran_jaket: e.target.value })}
                className={`${editable ? inputCls : readonlyCls} appearance-none pr-9 ${
                  editable ? "" : "cursor-not-allowed"
                }`}
              >
                <option value="">Pilih Ukuran</option>
                {UKURAN_JAKET_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="f-kontak">
              Nama Kontak Darurat <span className="text-red-500">*</span>
            </label>
            <input
              id="f-kontak"
              disabled={!editable}
              className={editable ? inputCls : `${readonlyCls} cursor-not-allowed`}
              placeholder="Nama & hubungan (mis. Budi Santoso — Ayah)"
              value={form.nama_kontak_darurat}
              onChange={(e) =>
                setForm({ ...form, nama_kontak_darurat: e.target.value })
              }
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="f-hpkontak">
              No. HP Kontak Darurat <span className="text-red-500">*</span>
            </label>
            <input
              id="f-hpkontak"
              type="tel"
              inputMode="tel"
              disabled={!editable}
              className={editable ? inputCls : `${readonlyCls} cursor-not-allowed`}
              placeholder="08xxxxxxxxxx"
              value={form.no_hp_kontak_darurat}
              onChange={(e) =>
                setForm({ ...form, no_hp_kontak_darurat: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="f-alamat">
              Alamat Domisili <span className="text-red-500">*</span>
            </label>
            <textarea
              id="f-alamat"
              rows={3}
              disabled={!editable}
              className={`${editable ? inputCls : readonlyCls} resize-none ${
                editable ? "" : "cursor-not-allowed"
              }`}
              placeholder="Alamat tempat tinggal selama menjalankan KKM"
              value={form.alamat_domisili}
              onChange={(e) =>
                setForm({ ...form, alamat_domisili: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* ── BUKTI PEMBAYARAN UKT ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <FileText size={17} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Bukti Pembayaran UKT{" "}
              <span className="font-medium text-gray-400">(Wajib saat kirim)</span>
            </h2>
            <p className="text-xs text-gray-400">
              Format PDF/JPG/PNG, maksimal 5 MB.
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-white text-green-600 flex items-center justify-center shrink-0 shadow-xs">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(0)} KB — siap diunggah
                </p>
              </div>
            </div>
            {editable && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 size={13} />
                  Hapus
                </button>
              </div>
            )}
          </div>
        ) : row?.bukti_ukt_url ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Berkas bukti UKT sudah terunggah
                </p>
                <a
                  href={row.bukti_ukt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-700 underline break-all"
                >
                  Lihat berkas
                </a>
              </div>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                Ganti Berkas
              </button>
            )}
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              if (!editable) return;
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              if (!editable) return;
              e.preventDefault();
              setIsDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => editable && fileInputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
              isDragOver
                ? "border-red-400 bg-red-50/60"
                : "border-gray-200 bg-gray-50/60"
            } ${editable ? "cursor-pointer hover:border-red-300" : "opacity-70"}`}
          >
            <UploadCloud
              size={30}
              className={`mx-auto ${isDragOver ? "text-red-500" : "text-gray-400"}`}
            />
            <p className="mt-2.5 text-sm font-semibold text-gray-700">
              Seret &amp; letakkan berkas di sini, atau{" "}
              <span className="text-red-600 underline">pilih berkas</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Bukti transfer/cetakan UKT — PDF, JPG, atau PNG (maks. 5 MB)
            </p>
          </div>
        )}
      </section>

      {/* ── PERNYATAAN ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <label
          className={`flex items-start gap-3 text-sm text-gray-700 ${
            editable ? "cursor-pointer" : "cursor-not-allowed opacity-70"
          }`}
        >
          <input
            type="checkbox"
            checked={pernyataan}
            disabled={!editable}
            onChange={(e) => setPernyataan(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="leading-relaxed">
            Saya <strong>menyatakan</strong> seluruh data yang saya isi benar,
            saya telah <strong>melunasi pembayaran UKT</strong> semester
            berjalan, dan saya bersedia mengikuti seluruh ketentuan Kuliah Kerja
            Mahasiswa (KKM) sesuai ketentuan LPPM UMC.{" "}
            <span className="text-red-500 font-semibold">(Wajib)</span>
          </span>
        </label>
      </section>

      {/* ── AKSI ── */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
        <button
          type="button"
          onClick={() => navigate("/mahasiswa-dashboard/pilih-skema")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          Kembali
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={!editable || saving !== null}
            onClick={() => submit("draft")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving === "draft" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Info size={15} />
            )}
            Simpan Draft
          </button>
          <button
            type="button"
            disabled={!editable || !requiredFilled || saving !== null}
            onClick={() => submit("kirim")}
            title={
              !requiredFilled
                ? "Lengkapi seluruh data wajib, unggah bukti UKT, dan centang pernyataan"
                : undefined
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving === "kirim" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            Kirim Pendaftaran KKM
          </button>
        </div>
      </div>
    </div>
  );
}

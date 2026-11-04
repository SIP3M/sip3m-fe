import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Loader2,
  Megaphone,
  Send,
  Upload,
  X,
} from "lucide-react";

import { getReferensiAktif } from "@/features/master/referensi.api";
import { getFakultasList } from "@/features/master/fakultas.api";
import { getKkmPeriods } from "./kkmPeriod.api";
import { getKkmLocations } from "./kkmLocation.api";
import { getKkmKelompokList } from "./kkmKelompok.api";
import { createPengumuman } from "./pengumuman.api";
import type {
  PengumumanPrioritas,
  PengumumanTargetType,
} from "./pengumuman.types";
import { formatUkuranFile } from "@/utils/pengumuman";

const LIST_PATH = "/admin-dashboard/kkm/pengumuman";

const TARGET_OPTIONS: { type: PengumumanTargetType; label: string }[] = [
  { type: "PESERTA", label: "Semua Peserta KKM" },
  { type: "DPL", label: "Semua DPL" },
  { type: "KELOMPOK", label: "Kelompok Tertentu" },
  { type: "DESA", label: "Desa Tertentu" },
  { type: "PERIODE", label: "Periode KKM Tertentu" },
  { type: "FAKULTAS", label: "Fakultas Tertentu" },
];

const PRIORITAS_OPTIONS: {
  value: PengumumanPrioritas;
  label: string;
  hint: string;
}[] = [
  { value: "PENTING", label: "Penting", hint: "Sorot merah, tampil paling atas" },
  { value: "SEDANG", label: "Sedang", hint: "Penanda kuning pada daftar" },
  { value: "INFORMASI", label: "Informasi", hint: "Informasi biasa" },
];

const LAMPIRAN_ALLOWED = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const LAMPIRAN_MAX_BYTES = 10 * 1024 * 1024;
/** batas pengambilan halaman saat menggabungkan pilihan kelompok/desa */
const MAX_PAGE_LOOPS = 30;

interface OpsiLabel {
  id: number;
  nama: string;
}

export default function BuatPengumumanKKM() {
  const navigate = useNavigate();

  // ── form ──
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [kategori, setKategori] = useState("");
  const [prioritas, setPrioritas] = useState<PengumumanPrioritas>("SEDANG");
  const [targets, setTargets] = useState<PengumumanTargetType[]>([]);
  const [periodeId, setPeriodeId] = useState<number | "">("");
  const [kelompokId, setKelompokId] = useState<number | "">("");
  const [desaId, setDesaId] = useState<number | "">("");
  const [fakultasId, setFakultasId] = useState<number | "">("");
  const [lampiran, setLampiran] = useState<File | null>(null);
  const [lampiranError, setLampiranError] = useState<string | null>(null);
  const [publishSekarang, setPublishSekarang] = useState(true);
  const [scheduledAt, setScheduledAt] = useState("");

  // ── opsi dropdown ──
  const [kategoriOptions, setKategoriOptions] = useState<OpsiLabel[]>([]);
  const [periodeOptions, setPeriodeOptions] = useState<OpsiLabel[]>([]);
  const [fakultasOptions, setFakultasOptions] = useState<OpsiLabel[]>([]);
  const [kelompokOptions, setKelompokOptions] = useState<
    { id: number; nama: string; deskripsi: string }[]
  >([]);
  const [desaOptions, setDesaOptions] = useState<OpsiLabel[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // ── status ──
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOpsi, setLoadingOpsi] = useState(true);

  // Opsi statis: kategori (master), periode, fakultas
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [kat, periode, fakultas] = await Promise.all([
          getReferensiAktif("KATEGORI_PENGUMUMAN"),
          getKkmPeriods({ page: 1, limit: 50 }),
          getFakultasList(),
        ]);
        if (!alive) return;
        setKategoriOptions(kat.map((k) => ({ id: k.id, nama: k.nama })));
        setPeriodeOptions(
          periode.data.map((p) => ({
            id: p.id,
            nama: `${p.nama_periode} (${p.tahun_akademik})`,
          })),
        );
        setFakultasOptions(fakultas.data.map((f) => ({ id: f.id, nama: f.nama })));
        if (kat.length > 0) setKategori((prev) => prev || kat[0].nama);
      } catch {
        if (alive) setOptionsError("Gagal memuat opsi form pengumuman.");
      } finally {
        if (alive) setLoadingOpsi(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Opsi kelompok & desa mengikuti periode terpilih
  useEffect(() => {
    if (!periodeId) {
      setKelompokOptions([]);
      setDesaOptions([]);
      setKelompokId("");
      setDesaId("");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const [lokasi, kelompok] = await Promise.all([
          loadSemuaLokasi(periodeId),
          loadSemuaKelompok(periodeId),
        ]);
        if (!alive) return;
        setDesaOptions(
          lokasi.map((l) => ({
            id: l.id,
            nama: `${l.desa}, Kec. ${l.kecamatan} (${l.kabupaten})`,
          })),
        );
        setKelompokOptions(
          kelompok.map((k) => ({
            id: k.id,
            nama: k.nama,
            deskripsi: `${k.lokasi.desa} • ${k.jumlah_anggota} anggota${
              k.dpl_name ? ` • DPL ${k.dpl_name}` : ""
            }`,
          })),
        );
      } catch {
        if (alive) setOptionsError("Gagal memuat kelompok/desa pada periode ini.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [periodeId]);

  const toggleTarget = (type: PengumumanTargetType) => {
    setTargets((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setErrors((prev) => ({ ...prev, targets: "" }));
  };

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!LAMPIRAN_ALLOWED.includes(file.type)) {
      setLampiranError("Lampiran harus berformat PDF, JPG, PNG, atau DOCX.");
      setLampiran(null);
      return;
    }
    if (file.size > LAMPIRAN_MAX_BYTES) {
      setLampiranError("Lampiran maksimal 10 MB.");
      setLampiran(null);
      return;
    }
    setLampiranError(null);
    setLampiran(file);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!judul.trim()) next.judul = "Judul wajib diisi.";
    else if (judul.trim().length > 255) next.judul = "Judul maksimal 255 karakter.";

    if (!isi.trim()) next.isi = "Isi pengumuman wajib diisi.";

    if (!kategori) next.kategori = "Kategori wajib dipilih.";

    if (targets.length === 0) {
      next.targets = "Pilih minimal satu target penerima.";
    } else {
      if (targets.includes("KELOMPOK") && kelompokId === "") {
        next.targets = "Pilih kelompok untuk target Kelompok Tertentu.";
      } else if (targets.includes("DESA") && desaId === "") {
        next.targets = "Pilih desa untuk target Desa Tertentu.";
      } else if (targets.includes("PERIODE") && periodeId === "") {
        next.targets =
          "Pilih Periode KKM terlebih dahulu untuk target Periode KKM Tertentu.";
      } else if (targets.includes("FAKULTAS") && fakultasId === "") {
        next.targets = "Pilih fakultas untuk target Fakultas Tertentu.";
      }
    }

    if (!publishSekarang) {
      if (!scheduledAt) {
        next.scheduled_at = "Isi waktu publikasi terjadwal.";
      } else if (new Date(scheduledAt).getTime() <= Date.now() + 60_000) {
        next.scheduled_at = "Waktu jadwal harus lebih lambat dari sekarang.";
      }
    }

    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    const builtTargets = targets.map((type) => ({
      type,
      ref_id:
        type === "KELOMPOK"
          ? Number(kelompokId)
          : type === "DESA"
            ? Number(desaId)
            : type === "PERIODE"
              ? Number(periodeId)
              : type === "FAKULTAS"
                ? Number(fakultasId)
                : null,
    }));

    setSubmitting(true);
    try {
      const res = await createPengumuman({
        judul: judul.trim(),
        isi: isi.trim(),
        kategori,
        prioritas,
        targets: builtTargets,
        publish_mode: publishSekarang ? "now" : "scheduled",
        scheduled_at:
          !publishSekarang && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
        lampiran,
      });
      navigate(LIST_PATH, { state: { flash: res.message } });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as
          | { message?: string; errors?: Record<string, string[]> }
          | undefined;
        if (err.response?.status === 400 && body?.errors) {
          const mapped: Record<string, string> = {};
          for (const [field, msgs] of Object.entries(body.errors)) {
            if (msgs?.length) mapped[field] = msgs[0];
          }
          setErrors(mapped);
          setServerError(
            Object.keys(mapped).length === 0 ? body?.message ?? null : null,
          );
        } else {
          setServerError(body?.message || "Gagal menyimpan pengumuman.");
        }
      } else {
        setServerError("Terjadi kesalahan pada server.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white outline-none transition-colors ${
      errors[field]
        ? "border-red-400 focus:ring-2 focus:ring-red-200"
        : "border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
    }`;

  if (loadingOpsi) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-sm text-gray-500">
        <Loader2 size={18} className="animate-spin text-red-600" />
        Memuat form pengumuman...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-4xl">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => navigate(LIST_PATH)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors mb-4"
      >
        <ArrowLeft size={15} />
        Kembali ke Pengumuman KKM
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengumuman KKM</h1>
          <p className="text-sm text-gray-500 mt-1">
            Buat pengumuman dan kirimkan ke seluruh civitas KKM
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Megaphone size={20} />
        </span>
      </div>

      {optionsError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={15} />
          {optionsError}
        </div>
      )}

      {serverError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={15} />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* DETAIL */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Detail Pengumuman
          </h2>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Judul Pengumuman*
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => {
              setJudul(e.target.value);
              setErrors((p) => ({ ...p, judul: "" }));
            }}
            maxLength={255}
            placeholder="Judul pengumuman"
            className={inputClass("judul")}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-red-500">{errors.judul}</span>
            <span className="text-xs text-gray-400">
              {judul.length}/255 Karakter
            </span>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1.5 mt-4">
            Deskripsi / Isi Pengumuman*
          </label>
          <textarea
            value={isi}
            onChange={(e) => {
              setIsi(e.target.value);
              setErrors((p) => ({ ...p, isi: "" }));
            }}
            rows={7}
            maxLength={20000}
            placeholder="Tulis isi pengumuman di sini..."
            className={`${inputClass("isi")} resize-none`}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-red-500">{errors.isi}</span>
            <span className="text-xs text-gray-400">
              {isi.length}/20000 Karakter
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Gunakan <span className="font-semibold text-gray-600">**teks**</span>{" "}
            untuk bold.
          </p>
        </section>

        {/* LAMPIRAN */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Lampiran (Opsional)
          </h2>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`rounded-lg border border-dashed px-4 py-8 text-center ${
              lampiranError ? "border-red-300 bg-red-50/40" : "border-gray-300"
            }`}
          >
            {lampiran ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {lampiran.name} ({formatUkuranFile(lampiran.size)})
                </span>
                <button
                  type="button"
                  onClick={() => setLampiran(null)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Hapus lampiran"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Tarik &amp; letakkan file di sini atau
                </p>
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload size={15} />
                  Unggah File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </label>
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            PDF, JPG, PNG atau DOCX — Maksimal 10 MB
          </p>
          {lampiranError && (
            <p className="mt-1 text-xs text-red-500">{lampiranError}</p>
          )}
        </section>

        {/* KATEGORI & AUDIENS */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Kategori &amp; Audiens
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kategori*
              </label>
              <select
                value={kategori}
                onChange={(e) => {
                  setKategori(e.target.value);
                  setErrors((p) => ({ ...p, kategori: "" }));
                }}
                className={inputClass("kategori")}
              >
                <option value="">Pilih kategori</option>
                {kategoriOptions.map((k) => (
                  <option key={k.id} value={k.nama}>
                    {k.nama}
                  </option>
                ))}
              </select>
              {errors.kategori && (
                <p className="mt-1.5 text-xs text-red-500">{errors.kategori}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Periode KKM
              </label>
              <select
                value={periodeId}
                onChange={(e) =>
                  setPeriodeId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua periode</option>
                {periodeOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-400">
                Menentukan pilihan kelompok/desa &amp; target Periode KKM.
              </p>
            </div>
          </div>

          {/* PRIORITAS */}
          <div className="mt-5">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Prioritas
            </span>
            <div className="flex flex-wrap gap-4">
              {PRIORITAS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                    prioritas === opt.value
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="prioritas"
                    value={opt.value}
                    checked={prioritas === opt.value}
                    onChange={() => setPrioritas(opt.value)}
                    className="mt-0.5 accent-red-600"
                  />
                  <span>
                    <span className="block font-medium text-gray-800">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-gray-400">
                      {opt.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* TARGET PENERIMA */}
          <div className="mt-5">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Target Penerima*
            </span>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {TARGET_OPTIONS.map((opt) => {
                const checked = targets.includes(opt.type);
                return (
                  <label
                    key={opt.type}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                      checked
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTarget(opt.type)}
                      className="accent-red-600"
                    />
                    <span className="font-medium text-gray-800">
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.targets && (
              <p className="mt-2 text-xs text-red-500">{errors.targets}</p>
            )}

            {/* pemilih turunan */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {targets.includes("KELOMPOK") && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Kelompok
                  </label>
                  <select
                    value={kelompokId}
                    onChange={(e) => setKelompokId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">
                      {periodeId
                        ? kelompokOptions.length
                          ? "Pilih kelompok"
                          : "Tidak ada kelompok"
                        : "Pilih Periode KKM dulu"}
                    </option>
                    {kelompokOptions.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama} — {k.deskripsi}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targets.includes("DESA") && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Desa
                  </label>
                  <select
                    value={desaId}
                    onChange={(e) => setDesaId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">
                      {periodeId
                        ? desaOptions.length
                          ? "Pilih desa"
                          : "Tidak ada desa"
                        : "Pilih Periode KKM dulu"}
                    </option>
                    {desaOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targets.includes("FAKULTAS") && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fakultas
                  </label>
                  <select
                    value={fakultasId}
                    onChange={(e) => setFakultasId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Pilih fakultas</option>
                    {fakultasOptions.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targets.includes("PERIODE") && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Periode KKM
                  </label>
                  <select
                    value={periodeId}
                    onChange={(e) =>
                      setPeriodeId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Pilih periode</option>
                    {periodeOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* WAKTU PUBLIKASI */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Waktu Publikasi
          </h2>

          <div className="flex flex-wrap gap-4">
            <label
              className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                publishSekarang
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="waktu"
                checked={publishSekarang}
                onChange={() => setPublishSekarang(true)}
                className="mt-0.5 accent-red-600"
              />
              <span>
                <span className="block font-medium text-gray-800">
                  Publish Sekarang
                </span>
                <span className="block text-xs text-gray-400">
                  Notifikasi langsung terkirim
                </span>
              </span>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                !publishSekarang
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="waktu"
                checked={!publishSekarang}
                onChange={() => setPublishSekarang(false)}
                className="mt-0.5 accent-red-600"
              />
              <span>
                <span className="block font-medium text-gray-800">
                  Jadwalkan
                </span>
                <span className="block text-xs text-gray-400">
                  Terbit otomatis sesuai waktu
                </span>
              </span>
            </label>
          </div>

          {!publishSekarang && (
            <div className="mt-4 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Waktu Publikasi
              </label>
              <div className="relative">
                <CalendarClock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    setErrors((p) => ({ ...p, scheduled_at: "" }));
                  }}
                  className={`${inputClass("scheduled_at")} pl-9`}
                />
              </div>
              {errors.scheduled_at && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.scheduled_at}
                </p>
              )}
            </div>
          )}
        </section>

        {/* AKSI */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate(LIST_PATH)}
            className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {publishSekarang ? "Publikasikan Sekarang" : "Jadwalkan Pengumuman"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── pengambilan seluruh halaman (BE memakai paginasi tetap) ────────────────

async function loadSemuaKelompok(periodeId: number) {
  const first = await getKkmKelompokList({ periode_id: periodeId, page: 1 });
  const items = [...first.data];
  const maxPage = Math.min(first.meta.totalPages, MAX_PAGE_LOOPS);
  for (let page = 2; page <= maxPage; page += 1) {
    const next = await getKkmKelompokList({ periode_id: periodeId, page });
    items.push(...next.data);
  }
  return items;
}

async function loadSemuaLokasi(periodeId: number) {
  const first = await getKkmLocations({ periode_id: periodeId, page: 1 });
  const items = [...first.data];
  const maxPage = Math.min(first.meta.totalPages, MAX_PAGE_LOOPS);
  for (let page = 2; page <= maxPage; page += 1) {
    const next = await getKkmLocations({ periode_id: periodeId, page });
    items.push(...next.data);
  }
  return items;
}

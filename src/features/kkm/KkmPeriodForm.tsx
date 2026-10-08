import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { createKkmPeriod, getKkmPeriodById, updateKkmPeriod } from "./kkmPeriod.api";
import type { KkmPeriodPayload, KkmJenis, KkmStatus } from "./kkmPeriod.types";
import { KKM_JENIS_OPTIONS, TAHUN_AKADEMIK_OPTIONS } from "./kkmPeriod.types";
import { validateKkmPeriodPayload, validateTahunAkademik } from "./kkmPeriod.validation";

type Mode = "create" | "edit";

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string>; error?: string } | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first[0]) return first[0];
      if (typeof first === "string") return first;
    }
    return data?.message || data?.error || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function KkmPeriodForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";
  const periodId = isEdit ? Number(id) : null;

  // Section A - Informasi Umum
  const [namaPeriode, setNamaPeriode] = useState("");
  const [tahunAkademik, setTahunAkademik] = useState("");
  const [tahun, setTahun] = useState<string>("");
  const [jenis, setJenis] = useState<KkmJenis>("REGULER");
  const [deskripsi, setDeskripsi] = useState("");

  // Section B - Jadwal
  const [tglBukaDaftar, setTglBukaDaftar] = useState("");
  const [tglTutupDaftar, setTglTutupDaftar] = useState("");
  const [tglPembekalan, setTglPembekalan] = useState("");
  const [tglPelaksanaan, setTglPelaksanaan] = useState("");
  const [tglPenarikan, setTglPenarikan] = useState("");
  const [deadlineLaporan, setDeadlineLaporan] = useState("");

  // Section C - Peserta
  const [targetPeserta, setTargetPeserta] = useState<string>("0");
  const [minimalSemester, setMinimalSemester] = useState<string>("");
  const [maksAnggotaKelompok, setMaksAnggotaKelompok] = useState<string>("10");
  const [bolehLintasFakultas, setBolehLintasFakultas] = useState(false);
  const [wajibCampurProdi, setWajibCampurProdi] = useState(false);

  // Section D - DPL
  const [assignDplOtomatis, setAssignDplOtomatis] = useState(false);
  const [maksKelompokPerDosen, setMaksKelompokPerDosen] = useState<string>("");

  // Section E - Status
  const [status, setStatus] = useState<KkmStatus>("DRAFT");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(isEdit);

  // Date order hint live
  const dateOrderHint = useMemo(() => {
    const order = [
      { key: "tgl_buka_daftar", label: "Buka Daftar", value: tglBukaDaftar },
      { key: "tgl_tutup_daftar", label: "Tutup Daftar", value: tglTutupDaftar },
      { key: "tgl_pembekalan", label: "Pembekalan", value: tglPembekalan },
      { key: "tgl_pelaksanaan", label: "Pelaksanaan", value: tglPelaksanaan },
      { key: "tgl_penarikan", label: "Penarikan", value: tglPenarikan },
      { key: "deadline_laporan", label: "Deadline Laporan", value: deadlineLaporan },
    ];
    const filled = order.filter((o) => o.value);
    for (let i = 1; i < filled.length; i++) {
      const prev = new Date(filled[i - 1].value);
      const cur = new Date(filled[i].value);
      if (!Number.isNaN(prev.getTime()) && !Number.isNaN(cur.getTime()) && cur <= prev) {
        return `Urutan tanggal salah: ${filled[i].label} (${filled[i].value}) harus setelah ${filled[i - 1].label} (${filled[i - 1].value})`;
      }
    }
    return null;
  }, [tglBukaDaftar, tglTutupDaftar, tglPembekalan, tglPelaksanaan, tglPenarikan, deadlineLaporan]);

  useEffect(() => {
    if (!isEdit || !periodId) {
      setLoadingDetail(false);
      return;
    }
    let cancelled = false;
    const fetch = async () => {
      setLoadingDetail(true);
      setGeneralError(null);
      try {
        const res = await getKkmPeriodById(periodId);
        if (cancelled) return;
        const p = res.data;
        setNamaPeriode(p.nama_periode || "");
        setTahunAkademik(p.tahun_akademik || "");
        setTahun(String(p.tahun ?? ""));
        setJenis((p.jenis as KkmJenis) || "REGULER");
        setDeskripsi(p.deskripsi || "");
        setTglBukaDaftar(p.tgl_buka_daftar ? p.tgl_buka_daftar.slice(0, 10) : "");
        setTglTutupDaftar(p.tgl_tutup_daftar ? p.tgl_tutup_daftar.slice(0, 10) : "");
        setTglPembekalan(p.tgl_pembekalan ? p.tgl_pembekalan.slice(0, 10) : "");
        setTglPelaksanaan(p.tgl_pelaksanaan ? p.tgl_pelaksanaan.slice(0, 10) : "");
        setTglPenarikan(p.tgl_penarikan ? p.tgl_penarikan.slice(0, 10) : "");
        setDeadlineLaporan(p.deadline_laporan ? p.deadline_laporan.slice(0, 10) : "");
        setTargetPeserta(String(p.target_peserta ?? 0));
        setMinimalSemester(p.minimal_semester != null ? String(p.minimal_semester) : "");
        setMaksAnggotaKelompok(String(p.maks_anggota_kelompok ?? 10));
        setBolehLintasFakultas(Boolean(p.boleh_lintas_fakultas));
        setWajibCampurProdi(Boolean(p.wajib_campur_prodi));
        setAssignDplOtomatis(Boolean(p.assign_dpl_otomatis));
        setMaksKelompokPerDosen(p.maks_kelompok_per_dosen != null ? String(p.maks_kelompok_per_dosen) : "");
        setStatus((p.status as KkmStatus) || "DRAFT");
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setGeneralError("Periode tidak ditemukan.");
        } else {
          setGeneralError(getErrorMessage(err, "Gagal memuat periode."));
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [isEdit, periodId]);

  const buildPayload = (overrideStatus?: KkmStatus): KkmPeriodPayload => {
    const payload: KkmPeriodPayload = {
      nama_periode: namaPeriode.trim(),
      tahun_akademik: tahunAkademik.trim(),
      tahun: Number(tahun),
      jenis,
      deskripsi: deskripsi.trim() || null,
      tgl_buka_daftar: tglBukaDaftar || null,
      tgl_tutup_daftar: tglTutupDaftar || null,
      tgl_pembekalan: tglPembekalan || null,
      tgl_pelaksanaan: tglPelaksanaan || null,
      tgl_penarikan: tglPenarikan || null,
      deadline_laporan: deadlineLaporan || null,
      target_peserta: targetPeserta === "" ? 0 : Number(targetPeserta),
      minimal_semester: minimalSemester === "" ? null : Number(minimalSemester),
      maks_anggota_kelompok: maksAnggotaKelompok === "" ? 10 : Number(maksAnggotaKelompok),
      boleh_lintas_fakultas: bolehLintasFakultas,
      wajib_campur_prodi: wajibCampurProdi,
      assign_dpl_otomatis: assignDplOtomatis,
      maks_kelompok_per_dosen: maksKelompokPerDosen === "" ? null : Number(maksKelompokPerDosen),
      status: overrideStatus ?? status,
    };
    return payload;
  };

  const validateAndSetErrors = (payload: KkmPeriodPayload): boolean => {
    const errs = validateKkmPeriodPayload(payload);
    // Also surface tahun_akademik live error if empty
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setGeneralError(Object.values(errs)[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = async (overrideStatus?: KkmStatus) => {
    setGeneralError(null);
    setSuccessMsg(null);
    const payload = buildPayload(overrideStatus);
    if (!validateAndSetErrors(payload)) return;

    setLoading(true);
    try {
      if (isEdit && periodId) {
        const res = await updateKkmPeriod(periodId, payload);
        setSuccessMsg(res.message || "Periode berhasil diperbarui.");
        // FE cukup refresh list: navigate ke list
        setTimeout(() => navigate("/admin-dashboard/kkm/periode"), 800);
      } else {
        const res = await createKkmPeriod(payload);
        setSuccessMsg(res.message || "Periode berhasil dibuat.");
        setTimeout(() => navigate("/admin-dashboard/kkm/periode"), 800);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
        if (err.response?.status === 401) {
          setGeneralError("Sesi habis. Silakan login ulang.");
          // ProtectedRoute will handle redirect, but also give hint
          setTimeout(() => navigate("/login"), 1200);
          return;
        }
        if (err.response?.status === 403) {
          setGeneralError("Hanya ADMIN_LPPM yang boleh membuat/mengubah periode.");
          return;
        }
        if (err.response?.status === 409) {
          setGeneralError(data?.message || "Duplikat: nama_periode + tahun_akademik sudah ada.");
          return;
        }
        if (data?.errors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.errors)) {
            mapped[k] = Array.isArray(v) ? v[0] : String(v);
          }
          setFieldErrors(mapped);
          const first = Object.values(mapped)[0];
          setGeneralError(first || data.message || "Validasi gagal. Periksa field.");
          return;
        }
        setGeneralError(data?.message || getErrorMessage(err, "Gagal menyimpan periode."));
      } else {
        setGeneralError(getErrorMessage(err, "Gagal menyimpan periode."));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingDetail) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen max-w-5xl mx-auto">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200 mb-6" />
        <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  const titleText = isEdit ? "Edit Periode KKM" : "Tambah Periode KKM";
  const subtitle = isEdit
    ? "Perbarui data periode KKM. Perubahan status menjadi AKTIF akan otomatis mengubah periode AKTIF lain menjadi DIJADWALKAN."
    : "Buat periode pelaksanaan KKM baru untuk kebutuhan pengelolaan mahasiswa, kelompok, dan lokasi.";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <h1 className="text-xl font-bold text-gray-800">{titleText}</h1>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

        {generalError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{generalError}</div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMsg}</div>
        )}
        {dateOrderHint && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{dateOrderHint}</div>
        )}

        <div className="space-y-6">
          {/* Section A - Informasi Periode */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">A</span>
              Informasi Periode
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nama Periode <span className="text-red-500">*</span></label>
                <input
                  value={namaPeriode}
                  onChange={(e) => setNamaPeriode(e.target.value)}
                  placeholder="KKM Reguler 2026"
                  maxLength={150}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.nama_periode ? "border-red-300 bg-red-50/40" : "border-gray-300"}`}
                />
                {fieldErrors.nama_periode && <p className="text-xs text-red-600 mt-1">{fieldErrors.nama_periode}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tahun Akademik <span className="text-red-500">*</span></label>
                  <select
                    value={tahunAkademik}
                    onChange={(e) => {
                      setTahunAkademik(e.target.value);
                      if (e.target.value) {
                        const err = validateTahunAkademik(e.target.value);
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          if (err) next.tahun_akademik = err;
                          else delete next.tahun_akademik;
                          return next;
                        });
                      }
                    }}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.tahun_akademik ? "border-red-300 bg-red-50/40" : "border-gray-300"}`}
                  >
                    <option value="">Pilih tahun akademik</option>
                    {TAHUN_AKADEMIK_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {/* Also allow manual typing if needed: free text fallback */}
                  <p className="text-xs text-gray-400 mt-1">Format WAJIB YYYY/YYYY (contoh 2025/2026) dan berurutan</p>
                  {fieldErrors.tahun_akademik && <p className="text-xs text-red-600 mt-1">{fieldErrors.tahun_akademik}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tahun <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    placeholder="2026"
                    min={2000}
                    max={2100}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.tahun ? "border-red-300 bg-red-50/40" : "border-gray-300"}`}
                  />
                  <p className="text-xs text-gray-400 mt-1">2000-2100 (kirim bersama tahun_akademik)</p>
                  {fieldErrors.tahun && <p className="text-xs text-red-600 mt-1">{fieldErrors.tahun}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Jenis KKM <span className="text-red-500">*</span></label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as KkmJenis)}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.jenis ? "border-red-300" : "border-gray-300"}`}
                  >
                    {KKM_JENIS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt === "REGULER" ? "Reguler" : "Tematik"}</option>
                    ))}
                  </select>
                  {fieldErrors.jenis && <p className="text-xs text-red-600 mt-1">{fieldErrors.jenis}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Deskripsi KKM</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Deskripsi singkat mengenai periode KKM ini..."
                  maxLength={2000}
                  rows={3}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.deskripsi ? "border-red-300 bg-red-50/40" : "border-gray-300"}`}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Maks 2000 karakter</span>
                  <span className={`text-xs ${deskripsi.length > 2000 ? "text-red-600" : "text-gray-400"}`}>{deskripsi.length}/2000</span>
                </div>
                {fieldErrors.deskripsi && <p className="text-xs text-red-600 mt-1">{fieldErrors.deskripsi}</p>}
              </div>
            </div>
          </div>

          {/* Section B - Pengaturan Pelaksanaan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">B</span>
              Pengaturan Pelaksanaan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tanggal Buka Pendaftaran</label>
                <input type="date" value={tglBukaDaftar} onChange={(e) => setTglBukaDaftar(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.tgl_buka_daftar ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                {fieldErrors.tgl_buka_daftar && <p className="text-xs text-red-600 mt-1">{fieldErrors.tgl_buka_daftar}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tanggal Tutup Pendaftaran</label>
                <input type="date" value={tglTutupDaftar} onChange={(e) => setTglTutupDaftar(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.tgl_tutup_daftar ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                {fieldErrors.tgl_tutup_daftar && <p className="text-xs text-red-600 mt-1">{fieldErrors.tgl_tutup_daftar}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tanggal Pembekalan</label>
                <input type="date" value={tglPembekalan} onChange={(e) => setTglPembekalan(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.tgl_pembekalan ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                {fieldErrors.tgl_pembekalan && <p className="text-xs text-red-600 mt-1">{fieldErrors.tgl_pembekalan}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tanggal Pelaksanaan</label>
                <input type="date" value={tglPelaksanaan} onChange={(e) => setTglPelaksanaan(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.tgl_pelaksanaan ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                {fieldErrors.tgl_pelaksanaan && <p className="text-xs text-red-600 mt-1">{fieldErrors.tgl_pelaksanaan}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tanggal Penarikan</label>
                <input type="date" value={tglPenarikan} onChange={(e) => setTglPenarikan(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.tgl_penarikan ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                {fieldErrors.tgl_penarikan && <p className="text-xs text-red-600 mt-1">{fieldErrors.tgl_penarikan}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Deadline Laporan Akhir</label>
                <input type="date" value={deadlineLaporan} onChange={(e) => setDeadlineLaporan(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.deadline_laporan ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                {fieldErrors.deadline_laporan && <p className="text-xs text-red-600 mt-1">{fieldErrors.deadline_laporan}</p>}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Jika diisi harus urut: Buka Daftar &lt; Tutup Daftar &lt; Pembekalan &lt; Pelaksanaan &lt; Penarikan &lt; Deadline Laporan</p>
          </div>

          {/* Section C - Pengaturan Peserta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">C</span>
              Pengaturan Peserta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Target Peserta</label>
                <input type="number" min={0} value={targetPeserta} onChange={(e) => setTargetPeserta(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.target_peserta ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                <p className="text-xs text-amber-600 mt-1">Jika penuh, pendaftaran peserta akan diblok</p>
                {fieldErrors.target_peserta && <p className="text-xs text-red-600 mt-1">{fieldErrors.target_peserta}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Minimal Semester</label>
                <select value={minimalSemester} onChange={(e) => setMinimalSemester(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.minimal_semester ? "border-red-300 bg-red-50/40" : "border-gray-300"}`}>
                  <option value="">Tidak ada batas</option>
                  {Array.from({ length: 14 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={String(s)}>Semester {s}</option>
                  ))}
                </select>
                {fieldErrors.minimal_semester && <p className="text-xs text-red-600 mt-1">{fieldErrors.minimal_semester}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Maks. Anggota / Kelompok</label>
                <input type="number" min={1} max={50} value={maksAnggotaKelompok} onChange={(e) => setMaksAnggotaKelompok(e.target.value)} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.maks_anggota_kelompok ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                {fieldErrors.maks_anggota_kelompok && <p className="text-xs text-red-600 mt-1">{fieldErrors.maks_anggota_kelompok}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={bolehLintasFakultas} onChange={(e) => setBolehLintasFakultas(e.target.checked)} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700">Boleh lintas fakultas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={wajibCampurProdi} onChange={(e) => setWajibCampurProdi(e.target.checked)} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700">Wajib campur prodi</span>
              </label>
            </div>
          </div>

          {/* Section D - Pengaturan DPL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">D</span>
              Pengaturan DPL
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={assignDplOtomatis} onChange={(e) => setAssignDplOtomatis(e.target.checked)} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700">Assign DPL otomatis</span>
              </label>
              <div>
                <label className="text-sm font-medium text-gray-700">Maks. Kelompok per Dosen</label>
                <input type="number" min={1} max={20} value={maksKelompokPerDosen} onChange={(e) => setMaksKelompokPerDosen(e.target.value)} placeholder="Kosongkan jika tidak dibatasi" className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.maks_kelompok_per_dosen ? "border-red-300 bg-red-50/40" : "border-gray-300"}`} />
                {fieldErrors.maks_kelompok_per_dosen && <p className="text-xs text-red-600 mt-1">{fieldErrors.maks_kelompok_per_dosen}</p>}
              </div>
            </div>
          </div>

          {/* Section E - Status Periode */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">E</span>
              Status Periode
            </h2>
            <div className="flex gap-4">
              {(["DRAFT", "AKTIF", "DIJADWALKAN", "SELESAI"] as KkmStatus[]).map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value={opt} checked={status === opt} onChange={() => setStatus(opt)} className="text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">{opt === "DRAFT" ? "Draft" : opt === "AKTIF" ? "Aktif" : opt === "DIJADWALKAN" ? "Dijadwalkan" : "Selesai"}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Hanya satu periode dapat aktif dalam satu waktu. Jika mengirim AKTIF, periode AKTIF lain otomatis menjadi DIJADWALKAN.</p>
            {fieldErrors.status && <p className="text-xs text-red-600 mt-1">{fieldErrors.status}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard/kkm/periode")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit("DRAFT")}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Draft"}
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit("AKTIF")}
              disabled={loading}
              title={dateOrderHint || undefined}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan & Aktifkan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

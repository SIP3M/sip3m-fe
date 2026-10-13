import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shuffle,
  Loader2,
  Users,
  MapPin,
  Eye,
} from "lucide-react";
import { getKkmPeriodActive, getKkmPeriods } from "./kkmPeriod.api";
import { getKkmGenerateStats, getKkmGenerateValidasi, postKkmGeneratePreview, executeKkmGenerate } from "./kkmGenerate.api";
import type { KkmPeriod } from "./kkmPeriod.types";
import type {
  KkmGeneratePayload,
  KkmGeneratePreviewData,
  KkmGenerateStats,
  KkmGenerateValidasi,
  PolaProdi,
  LokasiMode,
  MetodeDpl,
} from "./kkmGenerate.types";

const POLA_OPTIONS: Array<{ value: PolaProdi; label: string }> = [
  { value: "CAMPUR", label: "Campur Semua Prodi" },
  { value: "MIN_3_PRODI", label: "Minimal 3 Prodi Berbeda" },
  { value: "FAKULTAS", label: "Berdasarkan Fakultas" },
  { value: "RANDOM", label: "Bebas / Random" },
];

const LOKASI_OPTIONS: Array<{ value: LokasiMode; label: string }> = [
  { value: "RANDOM", label: "Random" },
  { value: "KUOTA", label: "Berdasarkan Kuota Desa" },
];

const METODE_DPL_OPTIONS: Array<{ value: MetodeDpl; label: string }> = [
  { value: "RANDOM", label: "Random" },
  { value: "FAKULTAS", label: "Berdasarkan Fakultas" },
  { value: "BEBAN_SEIMBANG", label: "Beban DPL Seimbang" },
];

function SectionTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <h3 className="text-base font-semibold text-gray-800">{children}</h3>
    </div>
  );
}

function ValidasiIcon({ type }: { type: "ok" | "warning" | "error" }) {
  if (type === "ok") return <CheckCircle size={16} className="text-green-500 flex-shrink-0" />;
  if (type === "warning") return <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />;
  return <XCircle size={16} className="text-red-500 flex-shrink-0" />;
}

export default function GenerateKelompok() {
  const navigate = useNavigate();

  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);

  const [stats, setStats] = useState<KkmGenerateStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [anggotaPerKelompok, setAnggotaPerKelompok] = useState(10);
  const [polaProdi, setPolaProdi] = useState<PolaProdi>("CAMPUR");
  const [genderBalance, setGenderBalance] = useState(false);
  const [lokasiMode, setLokasiMode] = useState<LokasiMode>("RANDOM");
  const [assignDpl, setAssignDpl] = useState(false);
  const [metodeDpl, setMetodeDpl] = useState<MetodeDpl>("RANDOM");
  const [maxKelompokPerDpl, setMaxKelompokPerDpl] = useState(2);
  const [ikutiKuota, setIkutiKuota] = useState(true);

  const [validasi, setValidasi] = useState<KkmGenerateValidasi | null>(null);
  const [validasiLoading, setValidasiLoading] = useState(false);
  const [validasiError, setValidasiError] = useState<string | null>(null);

  const [preview, setPreview] = useState<KkmGeneratePreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [executeSuccess, setExecuteSuccess] = useState<string | null>(null);

  // Load periodes
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const [activeRes, listRes] = await Promise.allSettled([getKkmPeriodActive(), getKkmPeriods({ page: 1, limit: 50 })]);
        if (cancelled) return;
        if (listRes.status === "fulfilled") setPeriodes(listRes.value.data || []);
        if (activeRes.status === "fulfilled") {
          const wrapped = activeRes.value as { data: KkmPeriod | null };
          const active = wrapped.data;
          if (active?.id) {
            setSelectedPeriodeId(active.id);
            return;
          }
        }
        if (listRes.status === "fulfilled" && listRes.value.data.length > 0) {
          // fallback to periode_id=2 for demo if exists, else first
          const demo = listRes.value.data.find((p) => p.id === 2) || listRes.value.data[0];
          if (demo) setSelectedPeriodeId(demo.id);
        }
      } catch {
        // ignore
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchStats = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getKkmGenerateStats(selectedPeriodeId);
      setStats(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) setStatsError("Sesi habis. Silakan login ulang.");
        else setStatsError((err.response?.data as { message?: string })?.message || err.message);
      } else setStatsError(err instanceof Error ? err.message : "Gagal memuat stats.");
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedPeriodeId]);

  const fetchValidasi = useCallback(async () => {
    if (selectedPeriodeId == null) {
      setValidasi(null);
      return;
    }
    setValidasiLoading(true);
    setValidasiError(null);
    try {
      const res = await getKkmGenerateValidasi({ periode_id: selectedPeriodeId, jumlah_anggota_per_kelompok: anggotaPerKelompok });
      setValidasi(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string })?.message || err.message;
        setValidasiError(msg);
      } else setValidasiError(err instanceof Error ? err.message : "Gagal validasi.");
      setValidasi(null);
    } finally {
      setValidasiLoading(false);
    }
  }, [selectedPeriodeId, anggotaPerKelompok]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    void fetchValidasi();
  }, [fetchValidasi]);

  // Derive display values from stats with fallbacks
  const displayStats = useMemo(() => {
    if (!stats) return null;
    const totalPeserta = (stats.total_peserta ?? stats.total ?? stats.totalPeserta ?? 0) as number;
    const sudahVerified = (stats.sudah_verified ?? stats.verified ?? 0) as number;
    const belumVerifikasi = (stats.belum_verifikasi ?? Math.max(0, totalPeserta - sudahVerified - ((stats as unknown as { rejected?: number })?.rejected ?? 0))) as number;
    const belumKelompok = (stats.belum_kelompok ?? 0) as number;
    const belumSyarat = (stats.belum_syarat_semester ?? (stats as unknown as { belum_syarat?: number })?.belum_syarat ?? 0) as number;
    const totalDesa = (stats.total_desa ?? stats.total_kelompok ?? 0) as number;
    const siap = Math.max(0, sudahVerified - belumSyarat);
    return { totalPeserta, sudahVerified, belumVerifikasi, belumKelompok, belumSyarat, totalDesa, siap };
  }, [stats]);

  const hasErrors = useMemo(() => {
    if (!validasi) return false;
    if (validasi.errors && validasi.errors.length > 0) return true;
    if (validasi.checks) return validasi.checks.some((c) => c.type === "error");
    return false;
  }, [validasi]);

  const validasiChecks = useMemo(() => {
    if (!validasi) return [];
    if (validasi.checks && validasi.checks.length > 0) return validasi.checks;
    const ds = displayStats;
    const siap = validasi.siap_diproses ?? ds?.siap ?? 0;
    const totalDesa = validasi.total_desa ?? validasi.total_kelompok ?? ds?.totalDesa ?? 0;
    const desaHampir = validasi.desa_hampir_penuh ?? stats?.desa_hampir_penuh ?? 0;
    const dplTersedia = validasi.dpl_tersedia ?? stats?.dpl_tersedia ?? 0;
    const belumSyarat = validasi.belum_syarat ?? validasi.belum_syarat_semester ?? ds?.belumSyarat ?? 0;
    const prodiTak = validasi.prodi_tidak_seimbang ?? stats?.prodi_tidak_seimbang ?? 0;
    const checks: Array<{ text: string; type: "ok" | "warning" | "error" }> = [
      { text: `${siap} mahasiswa terverifikasi siap diproses`, type: siap > 0 ? "ok" : "error" },
      { text: `${totalDesa} desa tersedia untuk penempatan`, type: totalDesa > 0 ? "ok" : "error" },
      { text: `${desaHampir} desa hampir mencapai kuota penuh`, type: desaHampir > 0 ? "warning" : "ok" },
      { text: `${dplTersedia} DPL tersedia`, type: dplTersedia > 0 ? "ok" : "error" },
      { text: `${belumSyarat} mahasiswa belum memenuhi syarat semester`, type: belumSyarat > 0 ? "error" : "ok" },
      { text: `${prodiTak} prodi memiliki distribusi tidak seimbang`, type: prodiTak > 0 ? "warning" : "ok" },
    ];
    return checks;
  }, [validasi, displayStats, stats]);

  const estimasiText = useMemo(() => {
    if (!displayStats) return "—";
    const { totalDesa, siap } = displayStats;
    if (!totalDesa) return "Belum ada desa / kelompok di periode ini.";
    const avg = totalDesa > 0 ? (siap / totalDesa).toFixed(1) : "0";
    return `Estimasi: ${totalDesa} kelompok tersedia, ±${avg} orang/kelompok (${siap}/${totalDesa})`;
  }, [displayStats]);

  const warningJumlah = useMemo(() => {
    if (!displayStats) return null;
    const { siap, totalDesa } = displayStats;
    if (!totalDesa) return null;
    const capacityWithConfig = totalDesa * anggotaPerKelompok;
    if (siap > capacityWithConfig) {
      return `Kapasitas dengan ${anggotaPerKelompok} orang/kelompok (${capacityWithConfig}) kurang untuk ${siap} peserta siap. ${validasi?.rekomendasi || "Kurangi anggota/kelompok atau tambah desa."}`;
    }
    if (ikutiKuota && displayStats.totalDesa > 0) {
      // generic hint if small kuota might block — BE will 400, show warn if anggota > typical kuota
      return null;
    }
    return null;
  }, [displayStats, anggotaPerKelompok, validasi?.rekomendasi, ikutiKuota]);

  const buildPayload = useCallback((): KkmGeneratePayload | null => {
    if (selectedPeriodeId == null) return null;
    return {
      periode_id: selectedPeriodeId,
      jumlah_anggota_per_kelompok: anggotaPerKelompok,
      pola_prodi: polaProdi,
      gender_balance: genderBalance,
      lokasi_mode: lokasiMode,
      assign_dpl_otomatis: assignDpl,
      metode_dpl: assignDpl ? (metodeDpl as MetodeDpl) : undefined,
      maks_kelompok_per_dpl: assignDpl ? maxKelompokPerDpl : undefined,
      ikuti_kuota_desa: ikutiKuota,
    };
  }, [selectedPeriodeId, anggotaPerKelompok, polaProdi, genderBalance, lokasiMode, assignDpl, metodeDpl, maxKelompokPerDpl, ikutiKuota]);

  const handlePreview = async () => {
    const payload = buildPayload();
    if (!payload) {
      setPreviewError("Pilih periode dulu.");
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    setExecuteError(null);
    setExecuteSuccess(null);
    try {
      const res = await postKkmGeneratePreview(payload);
      setPreview(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string })?.message || err.message;
        if (err.response?.status === 401) setPreviewError("Sesi habis. Silakan login ulang.");
        else if (err.response?.status === 403) setPreviewError("Hanya ADMIN/STAFF LPPM.");
        else setPreviewError(msg);
      } else setPreviewError(err instanceof Error ? err.message : "Gagal preview.");
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecute = async () => {
    const payload = buildPayload();
    if (!payload) {
      setExecuteError("Pilih periode dulu.");
      return;
    }
    if (hasErrors) {
      setExecuteError("Perbaiki validasi yang error sebelum generate.");
      return;
    }
    if (!displayStats?.totalDesa) {
      setExecuteError("Belum ada kelompok (desa) di periode ini. Tambah lokasi dulu.");
      return;
    }
    setExecuteLoading(true);
    setExecuteError(null);
    setExecuteSuccess(null);
    try {
      const res = await executeKkmGenerate(payload);
      const msg = res.message || `Berhasil generate: ${res.data.updated ?? "?"} peserta didistribusikan ke ${res.data.preview?.total_kelompok ?? displayStats?.totalDesa ?? "?"} kelompok.`;
      setExecuteSuccess(msg);
      // refresh stats after execute
      await fetchStats();
      await fetchValidasi();
      // update preview to executed preview if returned
      const execPreview = res.data.preview as KkmGeneratePreviewData | undefined;
      if (execPreview) setPreview(execPreview);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
        const status = err.response?.status;
        if (status === 401) setExecuteError("Sesi habis. Silakan login ulang.");
        else if (status === 403) setExecuteError("Hanya ADMIN LPPM yang boleh execute.");
        else if (data?.message) setExecuteError(data.message);
        else if (data?.errors) {
          const first = Object.values(data.errors)[0];
          setExecuteError(Array.isArray(first) ? first[0] : String(first));
        } else setExecuteError(err.message);
      } else setExecuteError(err instanceof Error ? err.message : "Gagal execute.");
    } finally {
      setExecuteLoading(false);
    }
  };

  const canGenerate = selectedPeriodeId != null && !hasErrors && (displayStats?.totalDesa ?? 0) > 0 && (displayStats?.siap ?? 0) > 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Generate Kelompok KKM</h1>
        <p className="text-gray-500 text-sm mt-1">Smart grouping engine — buat kelompok mahasiswa otomatis berdasarkan aturan yang ditentukan.</p>
      </div>

      {(executeError || executeSuccess) && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${executeSuccess ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {executeSuccess || executeError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Step 1: Periode KKM */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionTitle number={1}>Periode KKM</SectionTitle>
            <div className="max-w-md">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Periode <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPeriodeId ? String(selectedPeriodeId) : ""}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : null;
                  setSelectedPeriodeId(v);
                  setPreview(null);
                  setPreviewError(null);
                  setExecuteError(null);
                  setExecuteSuccess(null);
                }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Pilih Periode</option>
                {periodes.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nama_periode} • {p.tahun_akademik} {p.status === "AKTIF" ? "(Aktif)" : `(${p.status})`}
                  </option>
                ))}
              </select>
              <p className="flex items-start gap-1.5 text-xs text-gray-400 mt-2">
                <Info size={13} className="flex-shrink-0 mt-0.5" />
                Peserta akan didistribusikan ke kelompok di periode ini. 1 Desa = 1 Kelompok.
              </p>
            </div>
          </div>

          {/* Step 2: Data Peserta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionTitle number={2}>Data Peserta Siap Generate</SectionTitle>
            {selectedPeriodeId == null ? (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-700">Pilih periode dulu untuk melihat statistik.</div>
            ) : statsLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                <Loader2 size={18} className="animate-spin" /> Memuat statistik...
              </div>
            ) : statsError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{statsError}</div>
            ) : displayStats ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Total Peserta</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{displayStats.totalPeserta.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Sudah Verified</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{displayStats.sudahVerified.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Pending Verifikasi</p>
                    <p className="text-2xl font-bold text-orange-500 mt-1">{displayStats.belumVerifikasi.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Belum Punya Kelompok</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{displayStats.belumKelompok.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Tidak Memenuhi Syarat</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{displayStats.belumSyarat.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500">Siap Generate</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{displayStats.siap.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-400">{displayStats.siap} mahasiswa siap generate</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                  <Info size={12} /> Hanya mahasiswa terverifikasi yang akan diproses. {displayStats.siap} mahasiswa siap generate.
                </p>
              </>
            ) : null}
          </div>

          {/* Step 3: Konfigurasi Pembagian */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionTitle number={3}>Konfigurasi Pembagian</SectionTitle>

            <div className="space-y-6">
              {/* Jumlah Anggota */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Anggota per Kelompok</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={anggotaPerKelompok}
                    onChange={(e) => setAnggotaPerKelompok(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-500">mahasiswa</span>
                </div>
                <p className="text-sm text-gray-600 font-medium mt-2">{estimasiText}</p>
                {warningJumlah && (
                  <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 flex items-start gap-2">
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" /> {warningJumlah}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">1-50, default 10</p>
              </div>

              {/* Pola Pembagian Prodi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pola Pembagian Prodi</label>
                <div className="space-y-1.5">
                  {POLA_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPolaProdi(opt.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${polaProdi === opt.value ? "border border-red-400 bg-red-50 text-red-600 font-medium" : "text-gray-600 hover:bg-gray-50 border border-transparent"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Mahasiswa dibagi dengan komposisi lintas program studi.</p>
              </div>

              {/* Gender Balance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender Balance</label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genderBalance}
                    onChange={(e) => setGenderBalance(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Seimbangkan laki-laki dan perempuan
                </label>
                <p className="text-xs text-gray-400 mt-1">Sistem akan mencoba menyeimbangkan komposisi gender.</p>
              </div>

              {/* Lokasi Penempatan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi Penempatan</label>
                <div className="space-y-1.5">
                  {LOKASI_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLokasiMode(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${lokasiMode === opt.value ? "bg-gray-100 text-gray-800 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Berdasarkan Tema Desa sudah dihapus.</p>
              </div>

              {/* Assign DPL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign DPL Otomatis</label>
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setAssignDpl(true)}
                    className={`text-sm ${assignDpl ? "text-gray-800 font-medium" : "text-gray-500"}`}
                  >
                    Ya
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignDpl(false)}
                    className={`text-sm ${!assignDpl ? "text-gray-800 font-medium" : "text-gray-500"}`}
                  >
                    Tidak
                  </button>
                </div>
                {assignDpl && (
                  <div className="mt-4 pl-4 border-l-2 border-red-200 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Assign DPL</label>
                      <div className="space-y-1.5">
                        {METODE_DPL_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMetodeDpl(opt.value)}
                            className={`w-full text-left text-sm py-1 ${metodeDpl === opt.value ? "text-gray-800 font-medium" : "text-gray-600"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Maks. Kelompok per DPL</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={maxKelompokPerDpl}
                        onChange={(e) => setMaxKelompokPerDpl(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">Sistem akan membagi beban dosen secara proporsional. 1-20 default 2</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Kuota Desa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kuota Desa</label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ikutiKuota}
                    onChange={(e) => setIkutiKuota(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Ikuti kapasitas desa
                </label>
                <p className="text-xs text-gray-400 mt-1">Kelompok tidak akan melebihi kuota maksimal desa. Jika ON, kapasitas = min(kuota, jumlah_anggota).</p>
              </div>
            </div>
          </div>

          {/* Step 4: Validasi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionTitle number={4}>Validasi Data</SectionTitle>
            {selectedPeriodeId == null ? (
              <p className="text-sm text-gray-400">Pilih periode dulu.</p>
            ) : validasiLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Memuat validasi...
              </div>
            ) : validasiError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{validasiError}</div>
            ) : validasiChecks.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {validasiChecks.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <ValidasiIcon type={item.type} />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                {validasi?.rekomendasi && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">Rekomendasi</p>
                        <p className="text-sm text-yellow-700">{validasi.rekomendasi}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Tidak ada data validasi.</p>
            )}
          </div>

          {/* Step 5: Actions */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => void handlePreview()}
                disabled={selectedPeriodeId == null || previewLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-40"
              >
                {previewLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                Preview
              </button>
              <button
                onClick={() => void handleExecute()}
                disabled={!canGenerate || executeLoading || previewLoading}
                title={!canGenerate ? "Perbaiki validasi / pilih periode / pastikan desa tersedia" : undefined}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {executeLoading ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />}
                Generate Kelompok Otomatis
              </button>
            </div>
            {!canGenerate && selectedPeriodeId != null && (
              <p className="text-xs text-amber-600 text-center">Tombol Generate disabled jika validasi error atau belum ada desa.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Shuffle size={26} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Preview Hasil Generate</h3>
            <p className="text-xs text-gray-400 mt-1">{preview ? `${preview.total_peserta ?? preview.per_kelompok.length} peserta → ${preview.total_kelompok ?? preview.per_kelompok.length} kelompok` : "Dry-run tanpa simpan — klik Preview"}</p>
          </div>

          {previewError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">{previewError}</div>}

          {previewLoading ? (
            <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">Memuat preview...</span>
            </div>
          ) : preview && preview.per_kelompok.length > 0 ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {preview.per_kelompok.map((k) => (
                <div key={k.kelompok_id} className="border border-gray-100 rounded-xl p-3 hover:border-gray-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {k.nama} {k.desa ? `· ${k.desa}` : ""}
                        {k.kecamatan ? ` (${k.kecamatan})` : ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center gap-1"><Users size={12} /> Kuota {k.kuota ?? "—"} · Efektif {k.kapasitas_efektif ?? k.jumlah_anggota}</span>
                        <span>·</span>
                        <span className="font-medium text-gray-700">{k.jumlah_anggota} anggota</span>
                        {k.gender && <span>· L{(k.gender as { L?: number }).L ?? "-"} / P{(k.gender as { P?: number }).P ?? "-"}</span>}
                      </div>
                      {k.prodi_mix && Object.keys(k.prodi_mix).length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Prodi mix: {Object.entries(k.prodi_mix).map(([id, n]) => `${id}:${n}`).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">{k.jumlah_anggota}</span>
                  </div>
                  {k.anggota_preview && k.anggota_preview.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {k.anggota_preview.slice(0, 5).map((a, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="font-mono text-gray-500">{a.nim}</span>
                          <span className="font-medium text-gray-700">{a.nama}</span>
                          <span className="text-gray-400">{a.prodi?.slice(0, 18)}</span>
                          <span>{a.semester ? `SM ${a.semester}` : ""}</span>
                          <span className="ml-auto text-gray-500">{a.jenis_kelamin === "Laki-laki" ? "L" : a.jenis_kelamin === "Perempuan" ? "P" : a.jenis_kelamin}</span>
                        </div>
                      ))}
                      {k.anggota_preview.length > 5 && <p className="text-xs text-gray-400">+{k.anggota_preview.length - 5} lainnya</p>}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => void handleExecute()}
                  disabled={executeLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg"
                >
                  {executeLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Simpan Kelompok
                </button>
                <button onClick={() => navigate(`/admin-dashboard/kkm/peserta?periode_id=${selectedPeriodeId}`)} className="px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
                  Lihat Peserta
                </button>
              </div>
            </div>
          ) : (
            <ol className="space-y-3.5">
              {[
                "Pilih periode KKM yang akan diproses",
                "Periksa data peserta yang siap generate",
                "Atur konfigurasi pembagian kelompok",
                "Pastikan validasi data sudah OK",
                "Klik tombol Generate Kelompok",
                "Review hasil & simpan kelompok",
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-600">{step}</span>
                </li>
              ))}
              <li className="pt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <MapPin size={12} /> 1 Desa = 1 Kelompok · {displayStats?.totalDesa ?? 0} desa tersedia
              </li>
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

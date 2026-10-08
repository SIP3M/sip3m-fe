import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Users,
  UserCheck,
  MapPin,
  UserPlus,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Download,
  Printer,
  Edit,
  Loader2,
} from "lucide-react";
import { getKkmPeriodById, getKkmPeriodSummary, updateKkmPeriodStatus } from "./kkmPeriod.api";
import type { KkmPeriod } from "./kkmPeriod.types";

export default function DetailPeriodeKKM() {
  const navigate = useNavigate();
  const { id } = useParams();
  const periodId = Number(id);

  const [periode, setPeriode] = useState<KkmPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [closing, setClosing] = useState(false);
  const [closeMsg, setCloseMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!periodId || Number.isNaN(periodId)) {
      setError("ID periode tidak valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getKkmPeriodById(periodId);
      setPeriode(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) setError("Periode tidak ditemukan.");
        else if (status === 401) setError("Sesi habis. Silakan login ulang.");
        else if (status === 403) setError("Akses ditolak.");
        else setError((err.response?.data as { message?: string })?.message || err.message || "Gagal memuat periode.");
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat periode.");
      }
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  const fetchSummary = useCallback(async () => {
    if (!periodId || Number.isNaN(periodId)) return;
    setSummaryLoading(true);
    try {
      const res = await getKkmPeriodSummary(periodId);
      // BE may return { data: {...} } or direct
      const data = (res as { data?: Record<string, unknown> })?.data ?? res;
      setSummary(data as Record<string, unknown> | null);
    } catch {
      // summary belum ada -> tetap pakai placeholder
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [periodId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  const handleTutupPeriode = async () => {
    if (!periode) return;
    const ok = window.confirm(`Tutup periode "${periode.nama_periode}"? Status akan menjadi SELESAI.`);
    if (!ok) return;
    setClosing(true);
    setCloseMsg(null);
    try {
      await updateKkmPeriodStatus(periode.id, "SELESAI");
      setCloseMsg({ type: "success", text: "Periode berhasil ditutup (SELESAI)." });
      await fetchDetail();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 403) setCloseMsg({ type: "error", text: "Hanya ADMIN_LPPM yang boleh menutup periode." });
        else if (status === 401) setCloseMsg({ type: "error", text: "Sesi habis. Silakan login ulang." });
        else setCloseMsg({ type: "error", text: (err.response?.data as { message?: string })?.message || "Gagal menutup periode." });
      } else {
        setCloseMsg({ type: "error", text: err instanceof Error ? err.message : "Gagal menutup periode." });
      }
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200 mb-6" />
        <div className="h-32 animate-pulse rounded-xl bg-white border border-gray-100" />
      </div>
    );
  }

  if (error || !periode) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={18} />
          {error || "Periode tidak ditemukan."}
        </div>
      </div>
    );
  }

  // Stats: placeholder 0 / Belum ada data, jangan hardcode 1248/98/32
  const s = summary as Record<string, number> | null;
  const totalPeserta = s?.total_peserta ?? s?.totalPeserta ?? 0;
  const jumlahKelompok = s?.jumlah_kelompok ?? s?.jumlahKelompok ?? 0;
  const jumlahDesa = s?.jumlah_desa ?? s?.jumlahDesa ?? 0;
  const jumlahDpl = s?.jumlah_dpl ?? s?.jumlahDpl ?? 0;
  const belumDitempatkan = s?.belum_ditempatkan ?? s?.belumDitempatkan ?? 0;
  const laporanMasukRaw = s?.laporan_masuk ?? s?.laporanMasuk;
  const laporanMasuk = typeof laporanMasukRaw === "number" ? `${laporanMasukRaw}%` : "0%";

  const stats: Array<{ title: string; value: string | number; subtitle: string; icon: typeof Users; color: string }> = [
    { title: "Total Peserta", value: totalPeserta, subtitle: "Mahasiswa", icon: Users, color: "from-blue-500 to-blue-600" },
    { title: "Jumlah Kelompok", value: jumlahKelompok, subtitle: "Kelompok", icon: UserCheck, color: "from-green-500 to-green-600" },
    { title: "Jumlah Desa", value: jumlahDesa, subtitle: "Desa", icon: MapPin, color: "from-purple-500 to-purple-600" },
    { title: "Jumlah DPL", value: jumlahDpl, subtitle: "Dosen", icon: UserPlus, color: "from-orange-500 to-orange-600" },
    { title: "Belum Ditempatkan", value: belumDitempatkan, subtitle: "Mahasiswa", icon: AlertCircle, color: "from-red-500 to-red-600" },
    { title: "Laporan Masuk", value: laporanMasuk, subtitle: "dari total laporan", icon: TrendingUp, color: "from-green-500 to-green-600" },
  ];

  const formatDate = (v?: string | null) => (v ? v.slice(0, 10) : "-");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{periode.nama_periode}</h1>
          <p className="text-gray-500 text-sm">Monitoring keseluruhan pelaksanaan periode KKM.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Printer size={16} /> Cetak
          </button>
          <button
            onClick={() => navigate(`/admin-dashboard/kkm/periode/${periode.id}/edit`)}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Edit size={16} /> Edit
          </button>
          <button
            onClick={() => void handleTutupPeriode()}
            disabled={closing || periode.status === "SELESAI"}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={periode.status === "SELESAI" ? "Periode sudah SELESAI" : "Ubah status menjadi SELESAI"}
          >
            {closing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Tutup Periode
          </button>
        </div>
      </div>

      {closeMsg && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${closeMsg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {closeMsg.text}
        </div>
      )}

      {summaryLoading && <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Memuat ringkasan...</p>}

      {/* Stats Grid - 2 rows x 3 columns */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.slice(0, 3).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.subtitle}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-2.5 rounded-lg shadow-sm flex items-center justify-center`}>
                  <span style={{ color: "white", display: "flex" }}>
                    <Icon size={18} />
                  </span>
                </div>
              </div>
              {stat.value === 0 && <p className="text-[11px] text-gray-400 mt-2">Belum ada data</p>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.slice(3, 6).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.subtitle}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-2.5 rounded-lg shadow-sm flex items-center justify-center`}>
                  <span style={{ color: "white", display: "flex" }}>
                    <Icon size={18} />
                  </span>
                </div>
              </div>
              {(stat.value === 0 || stat.value === "0%") && <p className="text-[11px] text-gray-400 mt-2">Belum ada data</p>}
            </div>
          );
        })}
      </div>

      {/* Two Columns: Informasi Periode & Progress */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Informasi Periode: pakai GET /kkm/periods/:id */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 col-span-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" /> Informasi Periode
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Jenis KKM</span>
              <span className="font-medium text-gray-800">{periode.jenis === "REGULER" ? "Reguler" : "Tematik"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tahun Akademik</span>
              <span className="font-medium text-gray-800">{periode.tahun_akademik}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tahun</span>
              <span className="font-medium text-gray-800">{periode.tahun}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-gray-800">{periode.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Buka Pendaftaran</span>
              <span className="font-medium text-gray-800">{formatDate(periode.tgl_buka_daftar)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tutup Pendaftaran</span>
              <span className="font-medium text-gray-800">{formatDate(periode.tgl_tutup_daftar)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pembekalan</span>
              <span className="font-medium text-gray-800">{formatDate(periode.tgl_pembekalan)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pelaksanaan</span>
              <span className="font-medium text-gray-800">{formatDate(periode.tgl_pelaksanaan)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Penarikan</span>
              <span className="font-medium text-gray-800">{formatDate(periode.tgl_penarikan)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Deadline Laporan</span>
              <span className="font-medium text-gray-800">{formatDate(periode.deadline_laporan)}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target Peserta</span>
                <span className="font-medium text-gray-800">{periode.target_peserta}</span>
              </div>
              <p className="text-xs text-amber-600">Jika penuh, pendaftaran peserta akan diblok (limit validasi aktif)</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Minimal Semester</span>
                <span className="font-medium text-gray-800">{periode.minimal_semester ?? "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Maks Anggota/Kelompok</span>
                <span className="font-medium text-gray-800">{periode.maks_anggota_kelompok}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Lintas Fakultas</span>
                <span className="font-medium text-gray-800">{periode.boleh_lintas_fakultas ? "Ya" : "Tidak"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Wajib Campur Prodi</span>
                <span className="font-medium text-gray-800">{periode.wajib_campur_prodi ? "Ya" : "Tidak"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Assign DPL Otomatis</span>
                <span className="font-medium text-gray-800">{periode.assign_dpl_otomatis ? "Ya" : "Tidak"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Maks Kelompok/Dosen</span>
                <span className="font-medium text-gray-800">{periode.maks_kelompok_per_dosen ?? "-"}</span>
              </div>
            </div>
            {periode.deskripsi && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{periode.deskripsi}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Pelaksanaan - placeholder Belum ada data */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 col-span-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" /> Progress Pelaksanaan KKM
          </h3>
          <p className="text-sm text-gray-400 mb-3">Belum ada data — akan terisi dari modul Peserta/Kelompok</p>
          <div className="grid grid-cols-2 gap-4 opacity-60">
            {[
              { label: "Pendaftaran Peserta", value: 0 },
              { label: "Verifikasi Berkas", value: 0 },
              { label: "Pembagian Kelompok", value: 0 },
              { label: "Pembekalan", value: 0 },
              { label: "Pelaksanaan KKM", value: 0 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-gray-300 h-2 rounded-full" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mahasiswa per Fakultas & Distribusi Gender - placeholder */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Mahasiswa per Fakultas</h3>
          <p className="text-sm text-gray-400">Belum ada data</p>
          <p className="text-xs text-gray-400 mt-2">Akan terisi setelah modul Peserta tersedia (GET /kkm/periods/:id/summary)</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users size={16} className="text-gray-400" /> Distribusi Gender
            </h3>
            <p className="text-sm text-gray-400">Belum ada data</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Akses Cepat</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Kelola Peserta", "Kelola Kelompok", "Kelola Lokasi Desa", "Kelola DPL", "Generate Kelompok"].map((item, index) => (
                <button key={index} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors text-center">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Aktivitas - placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={16} className="text-gray-400" /> Timeline Aktivitas
        </h3>
        <p className="text-sm text-gray-400">Belum ada data — akan terisi dari modul Peserta/Kelompok/Lokasi</p>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => navigate(`/admin-dashboard/kkm/periode/${periode.id}/edit`)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          Edit Periode
        </button>
        <button onClick={() => navigate("/admin-dashboard/kkm/periode")} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900">
          Kembali ke Daftar
        </button>
      </div>
    </div>
  );
}

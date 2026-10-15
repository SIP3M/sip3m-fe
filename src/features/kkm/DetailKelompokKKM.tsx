import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Printer,
  Search,
  Trash2,
  Users,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAuthStore } from "@/features/auth/auth.store";
import { getKkmKelompokById, removeKkmKelompokAnggota } from "./kkmKelompok.api";
import {
  formatDate,
  type KkmKelompokAnggota,
  type KkmKelompokDetail,
  type KkmKelompokVerifikasiStatus,
} from "./kkmKelompok.types";
import KkmKelompokDokumenCard from "./KkmKelompokDokumenCard";
import KkmPesertaAssignKelompokModal from "./KkmPesertaAssignKelompokModal";
import {
  FilledProgressBar,
  KelompokStatusBadge,
  KomposisiBadge,
  getKkmErrorMessage,
} from "./kkmKelompok.ui";

const PIE_COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
  "#F97316",
  "#64748B",
];

function AnggotaStatusBadge({ status }: { status: KkmKelompokVerifikasiStatus }) {
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        Verified
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
      Pending
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

export default function DetailKelompokKKM() {
  const { id } = useParams();
  const kelompokId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.roles === "ADMIN_LPPM";

  const [detail, setDetail] = useState<KkmKelompokDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [anggotaSearch, setAnggotaSearch] = useState("");
  const [viewAnggota, setViewAnggota] = useState<KkmKelompokAnggota | null>(null);
  const [moveAnggotaId, setMoveAnggotaId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDetail = useCallback(async () => {
    if (!Number.isInteger(kelompokId) || kelompokId <= 0) {
      setError("ID kelompok tidak valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getKkmKelompokById(kelompokId);
      setDetail(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Sesi habis. Silakan login ulang.");
        setTimeout(() => navigate("/login"), 1200);
        return;
      }
      setError(getKkmErrorMessage(err, "Gagal memuat detail kelompok."));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [kelompokId, navigate]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const periodeSelesai = detail?.periode?.status === "SELESAI";
  const canMutate = isAdmin && !periodeSelesai;

  const handleDeleteAnggota = async (anggota: KkmKelompokAnggota) => {
    const ok = window.confirm(
      `Hapus ${anggota.nama} dari kelompok? Peserta kembali "Belum Ditempatkan" (tidak dihapus).`,
    );
    if (!ok) return;
    setDeletingId(anggota.peserta_id);
    try {
      const res = await removeKkmKelompokAnggota(kelompokId, anggota.peserta_id);
      showToast("success", res.message || "Anggota dihapus dari kelompok.");
      await fetchDetail();
    } catch (err: unknown) {
      showToast("error", getKkmErrorMessage(err, "Gagal menghapus anggota."));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAnggota = useMemo(() => {
    const q = anggotaSearch.trim().toLowerCase();
    if (!q || !detail) return detail?.anggota || [];
    return detail.anggota.filter(
      (a) =>
        a.nama?.toLowerCase().includes(q) ||
        a.nim?.toLowerCase().includes(q) ||
        a.prodi?.toLowerCase().includes(q) ||
        a.fakultas?.toLowerCase().includes(q),
    );
  }, [detail, anggotaSearch]);

  const pieData = useMemo(
    () => (detail?.prodi || []).map((p) => ({ name: p.nama, value: p.jumlah })),
    [detail],
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="px-6 py-12 flex flex-col items-center gap-2 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Memuat detail kelompok...</span>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error || "Kelompok tidak ditemukan."}
        </div>
      </div>
    );
  }

  const progress = detail.progress;
  const currentLabel = progress?.tahap_saat_ini;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            title="Kembali"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{detail.nama}</h1>
              <KelompokStatusBadge status={detail.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Informasi lengkap kelompok mahasiswa KKM — {detail.periode.nama_periode}{" "}
              {detail.periode.tahun_akademik}
            </p>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/admin-dashboard/kkm/kelompok/${detail.id}/edit`)}
            disabled={!canMutate}
            title={!isAdmin ? "Hanya ADMIN LPPM" : periodeSelesai ? "Periode SELESAI" : undefined}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pencil size={15} />
            Edit Kelompok
          </button>
          <button
            onClick={() =>
              navigate(`/admin-dashboard/kkm/kelompok/${detail.id}/edit`, {
                state: { focusDpl: true },
              })
            }
            disabled={!canMutate}
            title={!isAdmin ? "Hanya ADMIN LPPM" : periodeSelesai ? "Periode SELESAI" : undefined}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight size={15} />
            Ganti DPL
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Printer size={15} />
            Cetak Daftar
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {toast.text}
        </div>
      )}

      {periodeSelesai && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Periode ini berstatus SELESAI — perubahan anggota, DPL, dan dokumen dinonaktifkan.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Kolom Kiri ─────────────────────────────────────────── */}
        <div className="space-y-4 lg:col-span-1">
          {/* Informasi Kelompok */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Informasi Kelompok</h3>
            <div className="space-y-3">
              <InfoRow
                label="Periode"
                value={
                  <>
                    {detail.periode.nama_periode}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      {detail.periode.tahun_akademik}
                    </span>
                  </>
                }
              />
              <InfoRow
                label="DPL"
                value={detail.dpl?.name?.trim() ? detail.dpl.name : "Belum ada DPL"}
              />
              <InfoRow label="Desa" value={detail.lokasi.desa || "-"} />
              <InfoRow label="Kecamatan" value={detail.lokasi.kecamatan || "-"} />
              <InfoRow
                label="Jumlah Anggota"
                value={`${detail.jumlah_anggota} / ${detail.kuota} Mahasiswa`}
              />
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Kelengkapan</span>
                  <span className="font-semibold text-gray-700">
                    {Math.round(detail.persentase_terisi || 0)}%
                  </span>
                </div>
                <FilledProgressBar percent={detail.persentase_terisi} />
              </div>
            </div>
          </div>

          {/* Komposisi Kelompok */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Komposisi Kelompok</h3>
            <KomposisiBadge komposisi={detail.komposisi} />
            {pieData.length > 0 ? (
              <div className="mt-3">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        isAnimationActive={false}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {pieData.map((p, i) => (
                    <li key={p.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-gray-600 truncate">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="truncate">{p.name}</span>
                      </span>
                      <span className="font-semibold text-gray-800">{p.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-400">Belum ada data prodi anggota.</p>
            )}
          </div>

          {/* Distribusi Gender */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Distribusi Gender</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-4 text-center">
                <p className="text-xl font-bold text-blue-600">{detail.gender?.laki ?? 0}</p>
                <p className="text-xs text-blue-600 mt-0.5">Laki-laki</p>
              </div>
              <div className="rounded-xl bg-pink-50 border border-pink-100 px-3 py-4 text-center">
                <p className="text-xl font-bold text-pink-600">{detail.gender?.perempuan ?? 0}</p>
                <p className="text-xs text-pink-600 mt-0.5">Perempuan</p>
              </div>
            </div>
            {(detail.gender?.unknown ?? 0) > 0 && (
              <p className="mt-2 text-[11px] text-amber-600">
                {detail.gender.unknown} anggota belum mengisi jenis kelamin.
              </p>
            )}
          </div>

          {/* Dokumen */}
          <KkmKelompokDokumenCard
            kelompokId={detail.id}
            dokumen={detail.dokumen || []}
            disabled={!canMutate}
            onChanged={() => void fetchDetail()}
            onToast={showToast}
          />
        </div>

        {/* ── Kolom Kanan ────────────────────────────────────────── */}
        <div className="space-y-4 lg:col-span-2">
          {/* Kartu verifikasi */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-green-100 bg-green-50/60 p-4">
              <p className="text-xs font-medium text-green-700">Sudah Verifikasi</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {detail.verifikasi?.verified ?? 0}
              </p>
              <p className="text-[11px] text-green-700/70">mahasiswa</p>
            </div>
            <div className="rounded-xl border border-yellow-100 bg-yellow-50/60 p-4">
              <p className="text-xs font-medium text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {detail.verifikasi?.pending ?? 0}
              </p>
              <p className="text-[11px] text-yellow-700/70">mahasiswa</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
              <p className="text-xs font-medium text-red-700">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {detail.verifikasi?.rejected ?? 0}
              </p>
              <p className="text-[11px] text-red-700/70">mahasiswa</p>
            </div>
          </div>

          {/* Progress KKM */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-sm font-bold text-gray-800">Progress KKM</h3>
              <p className="text-xs text-gray-500">
                Tahap saat ini:{" "}
                <span className="font-semibold text-red-600">{currentLabel || "-"}</span>
              </p>
            </div>

            <div className="flex items-start">
              {(progress?.stages || []).map((stage, idx, arr) => {
                const isLast = idx === arr.length - 1;
                const isCurrent = !stage.done && stage.label === currentLabel;
                return (
                  <div key={stage.key} className={`flex ${isLast ? "" : "flex-1"} items-start`}>
                    <div className="flex flex-col items-center gap-1.5 w-20 shrink-0">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          stage.done
                            ? "border-green-500 bg-green-500 text-white"
                            : isCurrent
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {stage.done ? <CheckCircle2 size={16} /> : isCurrent ? "●" : idx + 1}
                      </span>
                      <span
                        className={`text-center text-[11px] leading-tight ${
                          stage.done
                            ? "text-green-600 font-medium"
                            : isCurrent
                              ? "text-red-600 font-semibold"
                              : "text-gray-400"
                        }`}
                      >
                        {stage.label}
                      </span>
                      {stage.date && (
                        <span className="text-[10px] text-gray-400">{formatDate(stage.date)}</span>
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`mt-4 h-0.5 flex-1 rounded ${
                          arr[idx + 1]?.done || stage.done ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Progress berdasarkan tahapan administrasi KKM.
            </p>
          </div>

          {/* Daftar Anggota */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
              <h3 className="text-sm font-bold text-gray-800">Daftar Anggota</h3>
              <div className="no-print relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari anggota..."
                  value={anggotaSearch}
                  onChange={(e) => setAnggotaSearch(e.target.value)}
                  className="w-56 pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-y border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      NIM
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Prodi / Fak.
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="no-print px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAnggota.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="px-6 py-10 text-center text-gray-500">
                          <Users size={28} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-sm font-medium">
                            {anggotaSearch ? "Anggota tidak ditemukan" : "Belum ada anggota"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {anggotaSearch
                              ? "Coba kata kunci lain."
                              : "Tambahkan mahasiswa lewat halaman Edit Kelompok."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAnggota.map((a) => {
                      const isLaki = (a.jenis_kelamin || "").toLowerCase().startsWith("laki");
                      return (
                        <tr key={a.peserta_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-gray-700">{a.nim}</td>
                          <td className="px-5 py-3 font-medium text-gray-800">{a.nama}</td>
                          <td className="px-5 py-3">
                            <p className="text-xs text-gray-700">{a.prodi || "-"}</p>
                            <p className="text-[11px] text-gray-400">{a.fakultas || "-"}</p>
                          </td>
                          <td className="px-5 py-3 text-xs font-semibold">
                            {a.jenis_kelamin ? (
                              <span className={isLaki ? "text-blue-600" : "text-pink-600"}>
                                {isLaki ? "♂ L" : "♀ P"}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <AnggotaStatusBadge status={a.status} />
                          </td>
                          <td className="no-print px-5 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setViewAnggota(a)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                title="Lihat detail"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => setMoveAnggotaId(a.peserta_id)}
                                disabled={!canMutate}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40"
                                title="Pindah kelompok"
                              >
                                <ArrowLeftRight size={15} />
                              </button>
                              <button
                                onClick={() => void handleDeleteAnggota(a)}
                                disabled={!canMutate || deletingId === a.peserta_id}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
                                title="Hapus dari kelompok"
                              >
                                {deletingId === a.peserta_id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal detail anggota (data dari row, tanpa GET tambahan) */}
      {viewAnggota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewAnggota(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Detail Anggota</h2>
                <p className="text-xs text-gray-500">{viewAnggota.nim}</p>
              </div>
              <button
                onClick={() => setViewAnggota(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 px-6 py-5">
              <InfoRow label="Nama" value={viewAnggota.nama} />
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Program Studi" value={viewAnggota.prodi || "-"} />
                <InfoRow label="Fakultas" value={viewAnggota.fakultas || "-"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Jenis Kelamin" value={viewAnggota.jenis_kelamin || "-"} />
                <InfoRow label="Semester" value={viewAnggota.semester ?? "-"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Email" value={viewAnggota.email || "-"} />
                <InfoRow label="No. HP" value={viewAnggota.nomor_hp || "-"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Status Verifikasi
                </span>
                <AnggotaStatusBadge status={viewAnggota.status} />
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setViewAnggota(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pindah kelompok (reuse) */}
      <KkmPesertaAssignKelompokModal
        open={moveAnggotaId != null}
        onClose={() => setMoveAnggotaId(null)}
        onSuccess={() => {
          showToast("success", "Anggota berhasil dipindahkan.");
          setMoveAnggotaId(null);
          void fetchDetail();
        }}
        periodeId={detail.periode?.id ?? null}
        pesertaIds={moveAnggotaId != null ? [moveAnggotaId] : []}
        excludeKelompokId={detail.id}
      />
    </div>
  );
}

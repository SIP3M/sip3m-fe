import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { getKkmKelompokById, removeKkmKelompokAnggota, updateKkmKelompok } from "./kkmKelompok.api";
import { getKkmDplDosen } from "./kkmDpl.api";
import type { KkmDplDosenOption } from "./kkmDpl.types";
import type { KkmKelompokDetail } from "./kkmKelompok.types";
import KkmKelompokAddAnggotaModal from "./KkmKelompokAddAnggotaModal";
import { getKkmErrorMessage } from "./kkmKelompok.ui";

export default function EditKelompokKKM() {
  const { id } = useParams();
  const kelompokId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.roles === "ADMIN_LPPM";
  const focusDpl = Boolean((location.state as { focusDpl?: boolean } | null)?.focusDpl);

  const [detail, setDetail] = useState<KkmKelompokDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // DPL typeahead
  const dplInputRef = useRef<HTMLInputElement | null>(null);
  const [dplQuery, setDplQuery] = useState("");
  const [dplOptions, setDplOptions] = useState<KkmDplDosenOption[]>([]);
  const [dplSearching, setDplSearching] = useState(false);
  const [selectedDosenId, setSelectedDosenId] = useState<number | null>(null);
  const [selectedDosenName, setSelectedDosenName] = useState("");

  const [showAddAnggota, setShowAddAnggota] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDetail = useCallback(async () => {
    if (!Number.isInteger(kelompokId) || kelompokId <= 0) {
      setPageError("ID kelompok tidak valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setPageError(null);
    try {
      const res = await getKkmKelompokById(kelompokId);
      const data = res.data;
      setDetail(data);
      setSelectedDosenId(data.dpl?.id ?? null);
      setSelectedDosenName(data.dpl?.name ?? "");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setPageError("Sesi habis. Silakan login ulang.");
        setTimeout(() => navigate("/login"), 1200);
        return;
      }
      setPageError(getKkmErrorMessage(err, "Gagal memuat detail kelompok."));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [kelompokId, navigate]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  // Fokus field DPL saat datang dari tombol "Ganti DPL"
  useEffect(() => {
    if (focusDpl && !loading) dplInputRef.current?.focus();
  }, [focusDpl, loading]);

  // Typeahead dosen (debounce 300ms)
  useEffect(() => {
    if (!dplQuery.trim()) {
      setDplOptions([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setDplSearching(true);
      try {
        const res = await getKkmDplDosen({ search: dplQuery.trim(), limit: 20 });
        if (!cancelled) setDplOptions(res.data || []);
      } catch {
        if (!cancelled) setDplOptions([]);
      } finally {
        if (!cancelled) setDplSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [dplQuery]);

  const periodeSelesai = detail?.periode?.status === "SELESAI";
  const canMutate = isAdmin && !periodeSelesai;
  const currentDplId = detail?.dpl?.id ?? null;
  const isDirty = selectedDosenId !== currentDplId;

  const handleSave = async () => {
    if (!detail || !isDirty) return;
    setFormError(null);
    setSaving(true);
    try {
      const res = await updateKkmKelompok(detail.id, { dpl_id: selectedDosenId });
      showToast("success", res.message || "Kelompok berhasil diubah.");
      await fetchDetail();
      setDplQuery("");
      setDplOptions([]);
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      let msg = getKkmErrorMessage(err, "Gagal mengubah kelompok.");
      if (status === 409) {
        msg = `${msg} — kelompok sudah punya DPL lain. Gunakan "Ganti DPL" untuk memilih dosen baru.`;
      }
      setFormError(msg);
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCabutDpl = async () => {
    if (!detail) return;
    const ok = window.confirm("Cabut DPL dari kelompok ini?");
    if (!ok) return;
    setFormError(null);
    setSaving(true);
    try {
      const res = await updateKkmKelompok(detail.id, { dpl_id: null });
      showToast("success", res.message || "DPL berhasil dicabut.");
      setSelectedDosenId(null);
      setSelectedDosenName("");
      await fetchDetail();
    } catch (err: unknown) {
      const msg = getKkmErrorMessage(err, "Gagal mencabut DPL.");
      setFormError(msg);
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnggota = async (pesertaId: number, nama: string) => {
    const ok = window.confirm(`Hapus ${nama} dari kelompok? Peserta kembali "Belum Ditempatkan".`);
    if (!ok) return;
    setDeletingId(pesertaId);
    try {
      const res = await removeKkmKelompokAnggota(kelompokId, pesertaId);
      showToast("success", res.message || "Anggota dihapus.");
      await fetchDetail();
    } catch (err: unknown) {
      showToast("error", getKkmErrorMessage(err, "Gagal menghapus anggota."));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Memuat kelompok...</span>
        </div>
      </div>
    );
  }

  if (pageError || !detail) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {pageError || "Kelompok tidak ditemukan."}
        </div>
      </div>
    );
  }

  const anggota = detail.anggota || [];
  const kuota = detail.kuota ?? detail.lokasi?.kuota ?? 0;
  const sisaKuota = Math.max(0, kuota - anggota.length);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit {detail.nama}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ubah konfigurasi kelompok dan komposisi mahasiswa
        </p>
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
          Periode ini berstatus SELESAI — perubahan tidak dapat disimpan.
        </div>
      )}

      {formError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ── Panel kiri: Pengaturan Kelompok ───────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">Pengaturan Kelompok</h2>

          <div className="space-y-5">
            {/* Desa READ-ONLY (1 Desa = 1 Kelompok) */}
            <div>
              <label className="text-sm font-medium text-gray-700">Desa Penempatan</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
                <MapPin size={15} className="text-gray-400 shrink-0" />
                <span className="font-medium">
                  {detail.lokasi.desa || "-"}
                  {detail.lokasi.kecamatan ? ` (${detail.lokasi.kecamatan})` : ""}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                1 Desa = 1 Kelompok — ubah desa lewat menu Lokasi KKM.
              </p>
            </div>

            {/* DPL typeahead */}
            <div>
              <label className="text-sm font-medium text-gray-700">DPL</label>

              {selectedDosenId ? (
                <div className="mt-1.5 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-green-800">
                    <UserRound size={15} className="shrink-0 text-green-600" />
                    <span className="truncate">
                      {selectedDosenName || detail.dpl?.name || "-"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCabutDpl()}
                    disabled={!canMutate || saving}
                    className="shrink-0 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    Cabut DPL
                  </button>
                </div>
              ) : (
                <div className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                  Belum ada DPL — pilih dosen di bawah.
                </div>
              )}

              <div className="relative mt-2">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={dplInputRef}
                  type="text"
                  value={dplQuery}
                  onChange={(e) => setDplQuery(e.target.value)}
                  placeholder="Cari dosen (nama / NIDN)..."
                  disabled={!canMutate}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
                />
              </div>

              {dplQuery.trim() && (
                <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-100">
                  {dplSearching ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                      <Loader2 size={14} className="animate-spin" /> Mencari dosen...
                    </div>
                  ) : dplOptions.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                      Dosen tidak ditemukan.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {dplOptions.map((d) => {
                        const active = selectedDosenId === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setSelectedDosenId(d.id);
                              setSelectedDosenName(d.name);
                              setDplQuery("");
                              setDplOptions([]);
                            }}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 ${
                              active ? "bg-red-50" : "bg-white"
                            }`}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-gray-800">
                                {d.name}
                              </span>
                              <span className="block truncate text-xs text-gray-500">
                                NIDN/NIP {d.nidn_nip || "-"} · {d.fakultas || "-"} ·{" "}
                                {d.prodi || "-"}
                              </span>
                            </span>
                            {active && <Check size={15} className="shrink-0 text-red-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {isDirty && (
                <p className="mt-2 text-xs text-amber-600">
                  Ada perubahan DPL yang belum disimpan — tekan &quot;Simpan Perubahan&quot;.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Panel kanan: Anggota ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-800">
              Anggota ({anggota.length}/{kuota})
            </h2>
            <button
              type="button"
              onClick={() => setShowAddAnggota(true)}
              disabled={!canMutate || sisaKuota <= 0}
              title={
                !canMutate
                  ? "Periode SELESAI / bukan admin"
                  : sisaKuota <= 0
                    ? "Kelompok penuh"
                    : undefined
              }
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Tambah Mahasiswa
            </button>
          </div>

          {sisaKuota <= 0 && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Kelompok penuh ({anggota.length}/{kuota}) — hapus anggota untuk menambah lain.
            </p>
          )}

          {anggota.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-gray-500">
              <Users size={26} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">Belum ada anggota</p>
              <p className="text-xs text-gray-400">Klik &quot;Tambah Mahasiswa&quot;.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {anggota.map((a) => (
                <li
                  key={a.peserta_id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{a.nama}</p>
                    <p className="truncate text-xs text-gray-500">
                      {a.prodi || a.nim}
                      {a.nim ? ` · ${a.nim}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteAnggota(a.peserta_id, a.nama)}
                    disabled={!canMutate || deletingId === a.peserta_id}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    title="Hapus dari kelompok"
                  >
                    {deletingId === a.peserta_id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer aksi */}
      <div className="no-print mt-5 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!canMutate || saving || !isDirty}
          title={
            !canMutate
              ? "Periode SELESAI / bukan admin"
              : !isDirty
                ? "Belum ada perubahan"
                : undefined
          }
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <KkmKelompokAddAnggotaModal
        open={showAddAnggota}
        onClose={() => setShowAddAnggota(false)}
        onSuccess={(msg) => {
          showToast("success", msg);
          void fetchDetail();
        }}
        kelompokId={detail.id}
        periodeId={detail.periode?.id ?? null}
        sisaKuota={sisaKuota}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import { X, Search, MapPin, Users, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { getKkmDplKelompok } from "./kkmDpl.api";
import { assignKkmPesertaKelompok } from "./kkmPeserta.api";
import type { KkmDplKelompokItem } from "./kkmDpl.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  periodeId: number | null;
  pesertaIds: number[];
}

function errorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first[0]) return first[0];
      if (typeof first === "string") return first;
    }
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function KkmPesertaAssignKelompokModal({ open, onClose, onSuccess, periodeId, pesertaIds }: Props) {
  const [search, setSearch] = useState("");
  const [kelompokList, setKelompokList] = useState<KkmDplKelompokItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKelompokId, setSelectedKelompokId] = useState<number | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedKelompokId(null);
    setSearch("");
    setGeneralError(null);
  }, [open, pesertaIds]);

  useEffect(() => {
    if (!open || periodeId == null) return;
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getKkmDplKelompok({ periode_id: periodeId, unassigned_only: false, search: search.trim() || undefined });
        if (!cancelled) setKelompokList(res.data || []);
      } catch {
        if (!cancelled) setKelompokList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(() => void fetch(), search ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, periodeId, search]);

  const handleSubmit = async () => {
    if (!selectedKelompokId) {
      setGeneralError("Pilih kelompok dulu.");
      return;
    }
    if (pesertaIds.length === 0) {
      setGeneralError("Tidak ada peserta dipilih.");
      return;
    }
    setGeneralError(null);
    setSubmitting(true);
    try {
      await assignKkmPesertaKelompok({ peserta_ids: pesertaIds, kelompok_id: selectedKelompokId });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
        if (status === 401) setGeneralError("Sesi habis. Silakan login ulang.");
        else if (status === 403) setGeneralError("Hanya ADMIN LPPM yang boleh assign kelompok.");
        else if (status === 400) {
          if (data?.errors) {
            const first = Object.values(data.errors)[0];
            const msg = Array.isArray(first) ? first[0] : String(first);
            setGeneralError(msg);
          } else setGeneralError(data?.message || "Gagal assign kelompok.");
        } else if (status === 404) setGeneralError(data?.message || "Periode/Peserta/Kelompok tidak ditemukan.");
        else setGeneralError(data?.message || errorMessage(err, "Gagal assign kelompok."));
      } else {
        setGeneralError(errorMessage(err, "Gagal assign kelompok."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const selected = kelompokList.find((k) => k.id === selectedKelompokId) || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Assign Kelompok</h2>
            <p className="text-sm text-gray-500">{pesertaIds.length} peserta dipilih</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {generalError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={14} /> {generalError}</div>}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Kelompok <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Cari kelompok / desa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden max-h-[320px] overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-sm text-gray-400 flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Memuat kelompok...</div>
              ) : kelompokList.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">Tidak ada kelompok di periode ini. Tambah Lokasi dulu.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {kelompokList.map((k) => {
                    const desa = k.lokasi?.desa || k.desa || "-";
                    const kuota = k.lokasi?.kuota ?? k.kuota ?? "-";
                    const isSelected = selectedKelompokId === k.id;
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setSelectedKelompokId(k.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${isSelected ? "bg-red-50" : "bg-white"}`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-red-600 bg-red-600" : "border-gray-300"}`}>
                          {isSelected && <CheckCircle size={10} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{k.nama || `Kelompok ${String(k.id).padStart(2, "0")}`}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate">{desa}{k.lokasi?.kecamatan ? ` (Kec. ${k.lokasi.kecamatan})` : ""}</span>
                            <span>·</span>
                            <Users size={12} className="shrink-0" />
                            <span>Kuota {kuota} / Terisi 0</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {selected && (
              <p className="text-xs text-gray-500 mt-2">
                Terpilih: <span className="font-medium text-gray-800">{selected.nama}</span> — pastikan kuota {selected.lokasi?.kuota ?? selected.kuota} masih cukup untuk {pesertaIds.length} peserta.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} disabled={submitting} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button onClick={() => void handleSubmit()} disabled={submitting || !selectedKelompokId} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40">
            {submitting ? "Menyimpan..." : `Assign ${pesertaIds.length} peserta`}
          </button>
        </div>
      </div>
    </div>
  );
}

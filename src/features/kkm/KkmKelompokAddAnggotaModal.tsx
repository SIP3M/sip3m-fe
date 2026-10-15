import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Search, Users, X } from "lucide-react";
import { getKkmPeserta } from "./kkmPeserta.api";
import { addKkmKelompokAnggota } from "./kkmKelompok.api";
import type { KkmPeserta } from "./kkmPeserta.types";
import { getKkmErrorMessage } from "./kkmKelompok.ui";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  kelompokId: number;
  periodeId: number | null;
  /** Kuota tersisa (kuota - jumlah anggota saat ini) — membatasi pilihan */
  sisaKuota: number;
}

export default function KkmKelompokAddAnggotaModal({
  open,
  onClose,
  onSuccess,
  kelompokId,
  periodeId,
  sisaKuota,
}: Props) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rows, setRows] = useState<KkmPeserta[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedIds([]);
    setError(null);
    setPage(1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [open, searchInput]);

  const fetchList = useCallback(async () => {
    if (!open || periodeId == null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getKkmPeserta({
        periode_id: periodeId,
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        // Ikuti enum Swagger: BelumDitempatkan | SudahDitempatkan
        status_kelompok: "BelumDitempatkan",
      });
      setRows(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: unknown) {
      setRows([]);
      setError(getKkmErrorMessage(err, "Gagal memuat peserta."));
    } finally {
      setLoading(false);
    }
  }, [open, periodeId, page, debouncedSearch]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= sisaKuota) return prev; // batas kuota
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setError("Pilih minimal 1 mahasiswa.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await addKkmKelompokAnggota(kelompokId, { peserta_ids: selectedIds });
      onSuccess(res.message || `Berhasil menambah ${selectedIds.length} anggota.`);
      onClose();
    } catch (err: unknown) {
      setError(getKkmErrorMessage(err, "Gagal menambah anggota."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const penuh = sisaKuota <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Tambah Mahasiswa</h2>
            <p className="text-sm text-gray-500">
              Pilih peserta yang belum ditempatkan · sisa kuota {Math.max(0, sisaKuota)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {penuh ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
              Kelompok sudah penuh. Hapus anggota dulu atau pilih kelompok lain.
            </div>
          ) : (
            <>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari NIM / nama / prodi..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="max-h-[320px] overflow-y-auto rounded-xl border border-gray-100">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" /> Memuat peserta...
                  </div>
                ) : rows.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    Tidak ada peserta &quot;Belum Ditempatkan&quot;.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {rows.map((p) => {
                      const checked = selectedIds.includes(p.id);
                      const locked = !checked && selectedIds.length >= sisaKuota;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggle(p.id)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                            checked ? "bg-red-50" : "bg-white"
                          } ${locked ? "opacity-50" : ""}`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              checked ? "border-red-600 bg-red-600" : "border-gray-300"
                            }`}
                          >
                            {checked && <CheckCircle2 size={11} className="text-white" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-gray-800">
                              {p.nama}
                            </span>
                            <span className="block truncate text-xs text-gray-500">
                              {p.nim} · {p.prodi || "-"} · {p.fakultas || "-"}
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                            {p.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => setPage((x) => Math.max(1, x - 1))}
                    disabled={page <= 1}
                    className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span>
                    Halaman {page} dari {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
                    disabled={page >= totalPages}
                    className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Users size={13} />
            {selectedIds.length} dipilih
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={() => void handleSubmit()}
              disabled={submitting || selectedIds.length === 0}
              className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              {submitting ? "Menyimpan..." : `Tambah ${selectedIds.length} Mahasiswa`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

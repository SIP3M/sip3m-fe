import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  createProgramStudi,
  deleteProgramStudi,
  getProgramStudiList,
  updateProgramStudi,
  type FakultasItem,
  type ProgramStudiItem,
} from "./fakultas.api";

interface Props {
  fakultas: FakultasItem;
  onClose: () => void;
  /** Dipanggil setelah ada perubahan (tambah/ubah/hapus) — parent refresh list. */
  onChanged: (message: string) => void;
}

const readErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || fallback;
  }
  return fallback;
};

/**
 * Modal "Kelola Program Studi" per fakultas (khusus ADMIN_SISTEM):
 * daftar prodi + tambah / ubah / hapus inline.
 */
export default function ProgramStudiModal({ fakultas, onClose, onChanged }: Props) {
  const [items, setItems] = useState<ProgramStudiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nama, setNama] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNama, setEditNama] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProgramStudiList(fakultas.id);
        if (!cancelled) setItems(res.data);
      } catch (err) {
        if (!cancelled) setError(readErrorMessage(err, "Gagal memuat program studi."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [fakultas.id]);

  const refresh = async () => {
    try {
      const res = await getProgramStudiList(fakultas.id);
      setItems(res.data);
    } catch {
      /* daftar lama tetap ditampilkan bila refresh gagal */
    }
  };

  const handleAdd = async () => {
    const trimmed = nama.trim();
    setFormError(null);
    if (trimmed.length < 3) {
      setFormError("Nama minimal 3 karakter.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createProgramStudi(fakultas.id, trimmed);
      setNama("");
      onChanged(res.message);
      await refresh();
    } catch (err) {
      setFormError(readErrorMessage(err, "Gagal menambahkan program studi."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (id: number) => {
    const trimmed = editNama.trim();
    setFormError(null);
    if (trimmed.length < 3) {
      setFormError("Nama minimal 3 karakter.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateProgramStudi(id, trimmed);
      setEditingId(null);
      onChanged(res.message);
      await refresh();
    } catch (err) {
      setFormError(readErrorMessage(err, "Gagal memperbarui program studi."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (prodi: ProgramStudiItem) => {
    const ok = window.confirm(`Hapus program studi "${prodi.nama}"?`);
    if (!ok) return;

    setDeletingId(prodi.id);
    setFormError(null);
    try {
      const res = await deleteProgramStudi(prodi.id);
      onChanged(res.message);
      await refresh();
    } catch (err) {
      setFormError(readErrorMessage(err, "Gagal menghapus program studi."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Kelola Program Studi</h3>
            <p className="text-xs text-gray-500 mt-0.5">{fakultas.nama}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {formError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {formError}
            </div>
          )}

          {/* Tambah */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama program studi baru"
              maxLength={100}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => void handleAdd()}
              disabled={submitting}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Tambah
            </button>
          </div>

          {/* Daftar */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
              <Loader2 size={18} className="animate-spin text-red-600" />
              Memuat program studi...
            </div>
          )}

          {!loading && error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-3">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Belum ada program studi di fakultas ini.
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {items.map((prodi) => (
                <li
                  key={prodi.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  {editingId === prodi.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editNama}
                        onChange={(e) => setEditNama(e.target.value)}
                        maxLength={100}
                        autoFocus
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveEdit(prodi.id)}
                        disabled={submitting}
                        className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg cursor-pointer disabled:opacity-60"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{prodi.nama}</p>
                        {prodi._count && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {prodi._count.users} user terkait
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(prodi.id);
                            setEditNama(prodi.nama);
                            setFormError(null);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Ubah nama"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(prodi)}
                          disabled={deletingId === prodi.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
                          title="Hapus"
                        >
                          {deletingId === prodi.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

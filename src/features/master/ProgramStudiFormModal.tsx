import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import axios from "axios";
import {
  createProgramStudi,
  getFakultasList,
  updateProgramStudi,
  type FakultasItem,
  type ProgramStudiItem,
} from "./fakultas.api";

interface Props {
  mode: "create" | "edit";
  /** Sumber data awal untuk mode edit. */
  prodi?: ProgramStudiItem | null;
  onClose: () => void;
  /** Dipanggil dengan pesan sukses dari BE setelah tersimpan. */
  onSuccess: (message: string) => void;
}

/**
 * Modal tambah / ubah program studi (khusus ADMIN_SISTEM).
 * Mode create: pilih fakultas + isi nama.
 * Mode edit: ubah nama saja (fakultas ditampilkan sebagai info, tidak diubah).
 * Komponen di-mount kondisional oleh parent sehingga form selalu reset.
 */
export default function ProgramStudiFormModal({ mode, prodi, onClose, onSuccess }: Props) {
  const [nama, setNama] = useState(mode === "edit" ? (prodi?.nama ?? "") : "");
  const [fakultasId, setFakultasId] = useState<string>(
    mode === "edit" ? String(prodi?.fakultas_id ?? "") : "",
  );
  const [fakultasList, setFakultasList] = useState<FakultasItem[]>([]);
  const [fakultasLoading, setFakultasLoading] = useState(mode === "create");

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== "create") return;
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await getFakultasList();
        if (!cancelled) setFakultasList(res.data);
      } catch {
        if (!cancelled) setGeneralError("Gagal memuat daftar fakultas.");
      } finally {
        if (!cancelled) setFakultasLoading(false);
      }
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setGeneralError(null);

    const trimmed = nama.trim();
    if (trimmed.length < 3) {
      setFieldError("Nama program studi minimal 3 karakter.");
      return;
    }
    if (mode === "create" && !fakultasId) {
      setFieldError("Pilih fakultas terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const res =
        mode === "create"
          ? await createProgramStudi(Number(fakultasId), trimmed)
          : await updateProgramStudi(prodi!.id, trimmed);
      onSuccess(res.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string; errors?: { nama?: string[]; fakultas_id?: string[] } }
          | undefined;
        const firstFieldError = data?.errors?.nama?.[0] || data?.errors?.fakultas_id?.[0];
        if (firstFieldError) setFieldError(firstFieldError);
        else setGeneralError(data?.message || "Terjadi kesalahan.");
      } else {
        setGeneralError("Terjadi kesalahan.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {mode === "create" ? "Tambah Program Studi" : "Ubah Nama Program Studi"}
          </h3>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {generalError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {generalError}
            </div>
          )}

          {mode === "create" ? (
            <div>
              <label
                htmlFor="prodi-fakultas"
                className="block text-xs font-semibold text-gray-600 mb-1.5"
              >
                Fakultas
              </label>
              <select
                id="prodi-fakultas"
                value={fakultasId}
                onChange={(e) => setFakultasId(e.target.value)}
                disabled={fakultasLoading}
                className={`w-full text-sm border rounded-xl px-3 py-2.5 outline-none transition-colors cursor-pointer bg-white ${
                  fieldError && !fakultasId
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-red-500"
                }`}
              >
                <option value="">
                  {fakultasLoading ? "Memuat fakultas..." : "Pilih fakultas..."}
                </option>
                {fakultasList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nama}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Fakultas
              </label>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                {prodi?.fakultas?.nama || "-"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Fakultas tidak dapat diubah. Ubah nama saja.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="prodi-nama"
              className="block text-xs font-semibold text-gray-600 mb-1.5"
            >
              Nama Program Studi
            </label>
            <input
              id="prodi-nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: S1 Teknik Informatika"
              autoFocus
              maxLength={100}
              className={`w-full text-sm border rounded-xl px-3 py-2.5 outline-none transition-colors ${
                fieldError
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-red-500"
              }`}
            />
            {fieldError && <p className="text-xs text-red-500 mt-1">{fieldError}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {mode === "create" ? "Simpan" : "Perbarui"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

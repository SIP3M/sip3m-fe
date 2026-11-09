import { useState } from "react";
import { api } from "@/services/api";
import { useJabatanMaster } from "./useJabatanMaster";

interface AssignJabatanModalProps {
  kelompokId: number;
  pesertaId: number;
  pesertaNama: string;
  currentJabatan?: string | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function AssignJabatanModal({
  kelompokId,
  pesertaId,
  pesertaNama,
  currentJabatan,
  onSuccess,
  onClose,
}: AssignJabatanModalProps) {
  const { jabatanList, loading: loadingJabatan } = useJabatanMaster();
  const [selectedJabatan, setSelectedJabatan] = useState<string>(
    currentJabatan || "ANGGOTA",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await api.patch(`/kkm/kelompok/${kelompokId}/anggota/${pesertaId}/jabatan`, {
        jabatan: selectedJabatan,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengubah jabatan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Ubah Jabatan: {pesertaNama}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        {loadingJabatan ? (
          <div className="text-center py-6 text-gray-500">Memuat jabatan...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Jabatan
              </label>
              <select
                value={selectedJabatan}
                onChange={(e) => setSelectedJabatan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {jabatanList.map((jabatan) => (
                  <option key={jabatan.id} value={jabatan.nama}>
                    {jabatan.nama}
                    {jabatan.max_per_kelompok
                      ? ` (Maks ${jabatan.max_per_kelompok})`
                      : " (Unlimited)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

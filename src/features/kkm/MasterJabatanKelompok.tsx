import { useEffect, useState } from "react";
import { jabatanMasterAPI } from "./jabatanMaster.api";
import type {
  JabatanKelompokMaster,
  CreateJabatanMasterDTO,
} from "./jabatanMaster.types";

export default function MasterJabatanKelompok() {
  const [jabatanList, setJabatanList] = useState<JabatanKelompokMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateJabatanMasterDTO>({
    nama: "",
    max_per_kelompok: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJabatan();
  }, []);

  const loadJabatan = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jabatanMasterAPI.getAll();
      setJabatanList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat jabatan");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "max_per_kelompok") {
      setFormData({
        ...formData,
        max_per_kelompok: value === "" ? null : parseInt(value, 10),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      setError("Nama jabatan wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (editId) {
        await jabatanMasterAPI.update(editId, formData);
      } else {
        await jabatanMasterAPI.create(formData);
      }
      await loadJabatan();
      setShowForm(false);
      setEditId(null);
      setFormData({ nama: "", max_per_kelompok: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan jabatan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (jabatan: JabatanKelompokMaster) => {
    setEditId(jabatan.id);
    setFormData({
      nama: jabatan.nama,
      max_per_kelompok: jabatan.max_per_kelompok,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus jabatan ini? Anggota akan demote ke ANGGOTA.")) {
      return;
    }
    try {
      setError(null);
      await jabatanMasterAPI.delete(id);
      await loadJabatan();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus jabatan");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ nama: "", max_per_kelompok: null });
    setError(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Jabatan Kelompok KKM</h1>
        <p className="text-gray-600 mt-1">
          Kelola daftar jabatan yang dapat diassign ke anggota kelompok
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Tambah Jabatan
        </button>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editId ? "Edit Jabatan" : "Tambah Jabatan Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Jabatan *
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Contoh: KETUA, BENDAHARA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimal Per Kelompok
              </label>
              <input
                type="number"
                name="max_per_kelompok"
                value={formData.max_per_kelompok ?? ""}
                onChange={handleInputChange}
                placeholder="Kosongkan untuk unlimited"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kosongkan untuk unlimited. Contoh: 1 untuk KETUA (hanya 1 per kelompok)
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat data...</div>
      ) : jabatanList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Belum ada jabatan</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Nama Jabatan
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Maksimal Per Kelompok
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {jabatanList.map((jabatan) => (
                <tr key={jabatan.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {jabatan.nama}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {jabatan.max_per_kelompok ? (
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        Maks {jabatan.max_per_kelompok}
                      </span>
                    ) : (
                      <span className="text-gray-400">Unlimited</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(jabatan)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(jabatan.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

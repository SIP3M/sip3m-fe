import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Check,
  ClipboardList,
  Coins,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
  X,
} from "lucide-react";
import {
  createReferensi,
  deleteReferensi,
  getReferensiAll,
  updateReferensi,
  type JenisReferensi,
  type ReferensiItem,
} from "./referensi.api";

interface ToastMsg {
  type: "success" | "error";
  text: string;
}

/**
 * Kelola Skema Penelitian & Sumber Pendanaan (khusus ADMIN_SISTEM).
 * Satu halaman, dua kartu — opsi dropdown proposal yang dikelola di sini
 * langsung dipakai form buat/edit proposal dosen (GET /referensi/:jenis).
 */
export default function KelolaReferensi() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<ToastMsg | null>(null);

  const handleAuthError = (status?: number) => {
    if (status === 401) {
      navigate("/login");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Skema &amp; Sumber Pendanaan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola opsi dropdown Skema Penelitian dan Sumber Pendanaan pada form
          proposal
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center justify-between gap-3 text-sm border rounded-2xl px-4 py-3 ${
            toast.type === "success"
              ? "text-emerald-700 bg-emerald-50 border-emerald-100"
              : "text-red-600 bg-red-50 border-red-100"
          }`}
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      <ReferensiCard
        jenis="SKEMA"
        title="Skema Penelitian"
        icon={ClipboardList}
        onToast={setToast}
        onAuthError={handleAuthError}
      />
      <ReferensiCard
        jenis="SUMBER_PENDANAAN"
        title="Sumber Pendanaan"
        icon={Coins}
        onToast={setToast}
        onAuthError={handleAuthError}
      />
    </div>
  );
}

// =============================================
// Kartu per jenis
// =============================================

function ReferensiCard({
  jenis,
  title,
  icon: Icon,
  onToast,
  onAuthError,
}: {
  jenis: JenisReferensi;
  title: string;
  icon: typeof ClipboardList;
  onToast: (t: ToastMsg) => void;
  onAuthError: (status?: number) => void;
}) {
  const [rows, setRows] = useState<ReferensiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [namaBaru, setNamaBaru] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNama, setEditNama] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReferensiAll(jenis);
      setRows(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        onAuthError(err.response?.status);
        if (err.response?.status === 403) {
          setError("Akses ditolak — hanya ADMIN SISTEM yang dapat mengelola data ini.");
          return;
        }
        const msg = (err.response?.data as { message?: string } | undefined)
          ?.message;
        setError(msg || `Gagal memuat data ${title.toLowerCase()}.`);
      } else {
        setError(`Gagal memuat data ${title.toLowerCase()}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jenis]);

  const errText = (err: unknown, fallback: string): string =>
    axios.isAxiosError(err)
      ? ((err.response?.data as { message?: string } | undefined)?.message ??
        fallback)
      : fallback;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const nama = namaBaru.trim();
    if (!nama) return;

    setIsAdding(true);
    try {
      const res = await createReferensi(jenis, { nama });
      onToast({ type: "success", text: res.data.message });
      setNamaBaru("");
      await fetchData();
    } catch (err) {
      onToast({ type: "error", text: errText(err, "Gagal menambah opsi.") });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (row: ReferensiItem) => {
    setBusyId(row.id);
    try {
      const res = await updateReferensi(row.id, { is_aktif: !row.is_aktif });
      onToast({ type: "success", text: res.data.message });
      await fetchData();
    } catch (err) {
      onToast({ type: "error", text: errText(err, "Gagal memperbarui opsi.") });
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (row: ReferensiItem) => {
    setEditingId(row.id);
    setEditNama(row.nama);
  };

  const handleSaveEdit = async (row: ReferensiItem) => {
    const nama = editNama.trim();
    if (!nama) return;
    setBusyId(row.id);
    try {
      const res = await updateReferensi(row.id, { nama });
      onToast({ type: "success", text: res.data.message });
      setEditingId(null);
      await fetchData();
    } catch (err) {
      onToast({ type: "error", text: errText(err, "Gagal mengubah nama.") });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row: ReferensiItem) => {
    const ok = window.confirm(
      `Hapus opsi "${row.nama}"?\n\nCatatan: opsi yang sudah dipakai proposal tidak bisa dihapus — nonaktifkan saja.`,
    );
    if (!ok) return;

    setBusyId(row.id);
    try {
      const res = await deleteReferensi(row.id);
      onToast({ type: "success", text: res.data.message });
      await fetchData();
    } catch (err) {
      onToast({ type: "error", text: errText(err, "Gagal menghapus opsi.") });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Kartu header + form tambah */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-4">
          <Icon size={18} className="text-red-600" />
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          <span className="text-xs text-gray-400">({rows.length} opsi)</span>
        </div>

        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder={`Tambah ${title.toLowerCase()} baru...`}
            maxLength={100}
            className="flex-1 max-w-sm text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isAdding || !namaBaru.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            Tambah
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-10">
          <Loader2 size={18} className="animate-spin text-red-600" />
          Memuat data...
        </div>
      )}

      {!loading && error && (
        <div className="text-sm text-red-600 bg-red-50 px-6 py-6">{error}</div>
      )}

      {!loading && !error && (
        <ul className="divide-y divide-gray-50">
          {rows.length === 0 && (
            <li className="px-6 py-8 text-center text-sm text-gray-400">
              Belum ada opsi. Tambahkan lewat form di atas.
            </li>
          )}
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/60 transition-colors"
            >
              {editingId === row.id ? (
                <>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleSaveEdit(row);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    maxLength={100}
                    autoFocus
                    className="flex-1 max-w-xs text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveEdit(row)}
                    disabled={busyId === row.id || !editNama.trim()}
                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    title="Simpan"
                  >
                    {busyId === row.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                    title="Batal"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      row.is_aktif
                        ? "font-medium text-gray-900"
                        : "text-gray-400 line-through"
                    }`}
                  >
                    {row.nama}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      row.is_aktif
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {row.is_aktif ? "Aktif" : "Nonaktif"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Ubah nama"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggle(row)}
                      disabled={busyId === row.id}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50 ${
                        row.is_aktif
                          ? "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                          : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                      }`}
                      title={
                        row.is_aktif
                          ? "Nonaktifkan (hilang dari form proposal)"
                          : "Aktifkan kembali"
                      }
                    >
                      <Power size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(row)}
                      disabled={busyId === row.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  School,
  Search,
  Trash2,
} from "lucide-react";
import FakultasModal from "./FakultasModal";
import ProgramStudiModal from "./ProgramStudiModal";
import { deleteFakultas, getFakultasList, type FakultasItem } from "./fakultas.api";

/**
 * Kelola Fakultas (khusus role ADMIN_SISTEM).
 * Tabel fakultas + jumlah prodi + aksi (ubah, hapus, kelola program studi).
 * Data diambil dari GET /fakultas; tulis lewat endpoint CRUD ADMIN_SISTEM.
 */
export default function KelolaFakultas() {
  const navigate = useNavigate();

  const [data, setData] = useState<FakultasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // null = modal tertutup; {mode, fakultas?} = modal tambah/ubah (di-mount kondisional)
  const [fakultasModal, setFakultasModal] = useState<{
    mode: "create" | "edit";
    fakultas?: FakultasItem;
  } | null>(null);
  const [prodiFakultas, setProdiFakultas] = useState<FakultasItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFakultasList();
      setData(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Sesi Anda berakhir. Silakan login kembali.");
          navigate("/login");
          return;
        }
        if (err.response?.status === 403) {
          setError("Akses ditolak — hanya ADMIN SISTEM yang dapat mengelola data ini.");
          return;
        }
        const msg = (err.response?.data as { message?: string } | undefined)?.message;
        setError(msg || "Gagal memuat data fakultas.");
      } else {
        setError("Gagal memuat data fakultas.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((f) => f.nama.toLowerCase().includes(q));
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const visible = filtered.slice(startIndex, startIndex + perPage);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (fakultas: FakultasItem) => {
    const ok = window.confirm(`Hapus fakultas "${fakultas.nama}"?`);
    if (!ok) return;

    setDeletingId(fakultas.id);
    try {
      const res = await deleteFakultas(fakultas.id);
      setToast({ type: "success", text: res.message });
      await fetchData();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message ??
          "Gagal menghapus fakultas.")
        : "Gagal menghapus fakultas.";
      setToast({ type: "error", text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Fakultas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data fakultas dan program studi yang digunakan dalam sistem SIP3M
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFakultasModal({ mode: "create" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm self-start"
        >
          <Plus size={17} />
          Tambah Fakultas
        </button>
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

      {/* Kartu tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari fakultas..."
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-12">
            <Loader2 size={18} className="animate-spin text-red-600" />
            Memuat data fakultas...
          </div>
        )}

        {!loading && error && (
          <div className="text-sm text-red-600 bg-red-50 border-t border-red-100 px-6 py-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3.5 font-semibold">Nama Fakultas</th>
                    <th className="px-6 py-3.5 font-semibold">Jumlah Program Studi</th>
                    <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                        {search
                          ? `Tidak ada fakultas yang cocok dengan "${search}".`
                          : "Belum ada data fakultas."}
                      </td>
                    </tr>
                  )}
                  {visible.map((fakultas) => (
                    <tr
                      key={fakultas.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <Building2 size={17} className="text-red-600 shrink-0" />
                          <span className="font-medium text-gray-900">
                            {fakultas.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {fakultas._count?.program_studi ?? 0} Program Studi
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setFakultasModal({ mode: "edit", fakultas })
                            }
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Ubah nama"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(fakultas)}
                            disabled={deletingId === fakultas.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
                            title="Hapus"
                          >
                            {deletingId === fakultas.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setProdiFakultas(fakultas)}
                            className="inline-flex items-center gap-1.5 ml-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <School size={14} />
                            Kelola Program Studi
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer: paginasi */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Tampilkan</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-red-500 cursor-pointer"
                >
                  {[5, 10, 25].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>
                  Menampilkan {filtered.length === 0 ? 0 : startIndex + 1} sampai{" "}
                  {Math.min(startIndex + perPage, filtered.length)} dari{" "}
                  {filtered.length} fakultas
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Halaman sebelumnya"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Halaman berikutnya"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal tambah/ubah fakultas (mount kondisional → form selalu reset) */}
      {fakultasModal && (
        <FakultasModal
          mode={fakultasModal.mode}
          fakultas={fakultasModal.fakultas}
          onClose={() => setFakultasModal(null)}
          onSuccess={(message) => {
            setFakultasModal(null);
            setToast({ type: "success", text: message });
            void fetchData();
          }}
        />
      )}

      {/* Modal kelola program studi */}
      {prodiFakultas && (
        <ProgramStudiModal
          fakultas={prodiFakultas}
          onClose={() => setProdiFakultas(null)}
          onChanged={(message) => {
            setToast({ type: "success", text: message });
            void fetchData();
          }}
        />
      )}
    </div>
  );
}

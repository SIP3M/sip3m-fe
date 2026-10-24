import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BookOpen, Loader2, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import Pagination from "@/components/common/Pagination";
import ProgramStudiFormModal from "./ProgramStudiFormModal";
import {
  deleteProgramStudi,
  getAllProgramStudi,
  type ProgramStudiItem,
} from "./fakultas.api";

const ITEMS_PER_PAGE = 5;

/**
 * Master Data — Kelola Program Studi (khusus ADMIN_SISTEM).
 * Daftar datar seluruh prodi lintas fakultas dari GET /program-studi,
 * dengan pencarian + paginasi bernomor + aksi ubah/hapus.
 * Hapus diblokir 409 oleh BE bila masih ada user pada prodi.
 */
export default function KelolaProgramStudi() {
  const navigate = useNavigate();

  const [data, setData] = useState<ProgramStudiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // null = modal tertutup; {mode, prodi?} = modal tambah/ubah (mount kondisional)
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    prodi?: ProgramStudiItem;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProgramStudi();
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
        setError(msg || "Gagal memuat data program studi.");
      } else {
        setError("Gagal memuat data program studi.");
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
    return data.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        (p.fakultas?.nama ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setPage(1);
  };

  const handleDelete = async (prodi: ProgramStudiItem) => {
    const ok = window.confirm(
      `Hapus program studi "${prodi.nama}"?\n\nPenghapusan diblokir jika masih ada user terdaftar pada prodi ini.`,
    );
    if (!ok) return;

    setDeletingId(prodi.id);
    try {
      const res = await deleteProgramStudi(prodi.id);
      setToast({ type: "success", text: res.message });
      await fetchData();
    } catch (err) {
      // 409 (masih ada user) → tampilkan pesan dari BE apa adanya
      const msg = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message ??
          "Gagal menghapus program studi.")
        : "Gagal menghapus program studi.";
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Program Studi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Daftar seluruh program studi lintas fakultas dalam sistem SIP3M
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm self-start"
        >
          <Plus size={17} />
          Tambah Program Studi
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
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari program studi atau fakultas..."
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer self-start"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-12">
            <Loader2 size={18} className="animate-spin text-red-600" />
            Memuat data program studi...
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
                    <th className="px-6 py-3.5 font-semibold">Nama Program Studi</th>
                    <th className="px-6 py-3.5 font-semibold">Fakultas</th>
                    <th className="px-6 py-3.5 font-semibold">Jumlah Pengguna</th>
                    <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                        {search
                          ? `Tidak ada program studi yang cocok dengan "${search}".`
                          : "Belum ada data program studi."}
                      </td>
                    </tr>
                  )}
                  {visible.map((prodi) => (
                    <tr key={prodi.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <BookOpen size={17} className="text-red-600 shrink-0" />
                          <span className="font-medium text-gray-900">{prodi.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {prodi.fakultas?.nama || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {prodi._count?.users ?? 0} pengguna
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setModal({ mode: "edit", prodi })}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Ubah nama"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(prodi)}
                            disabled={deletingId === prodi.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-60"
                            title="Hapus"
                          >
                            {deletingId === prodi.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer: info + paginasi bernomor */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold">
                  {filtered.length === 0 ? 0 : startIndex + 1}
                </span>{" "}
                sampai{" "}
                <span className="font-semibold">
                  {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                dari <span className="font-semibold">{filtered.length}</span> program
                studi
              </p>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal tambah/ubah program studi */}
      {modal && (
        <ProgramStudiFormModal
          mode={modal.mode}
          prodi={modal.prodi}
          onClose={() => setModal(null)}
          onSuccess={(message) => {
            setModal(null);
            setToast({ type: "success", text: message });
            void fetchData();
          }}
        />
      )}
    </div>
  );
}

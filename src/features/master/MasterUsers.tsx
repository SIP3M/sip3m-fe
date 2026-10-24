import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Search,
} from "lucide-react";
import { getUsers, updateUserStatus } from "@/features/users/Users.api";
import type { User } from "@/features/users/users.types";
import type { AppRole } from "@/constant/roles";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const ITEMS_PER_PAGE = 5;

export interface MasterExtraColumn {
  header: string;
  render: (user: User) => ReactNode;
}

interface MasterUsersProps {
  /** Role yang di-list — dikirim sebagai query `roles` ke GET /users. */
  role: AppRole;
  title: string;
  subtitle: string;
  /** Label kolom identitas: "NIDN/NIP" | "NIM" | "NIDN". */
  identityLabel: string;
  searchPlaceholder?: string;
  /** Kolom tambahan setelah Nama/identitas/Prodi (mis. Angkatan, Beban Review). */
  extraColumns?: MasterExtraColumn[];
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "pending", label: "Nonaktif" },
];

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        active
          ? "text-emerald-700 bg-emerald-50"
          : "text-gray-500 bg-gray-100"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

/**
 * Halaman master data pengguna per role (Dosen / Mahasiswa / Reviewer).
 * Tabel + cari (nama/email/NIDN) + filter status + paginasi bernomor.
 * Aksi: detail & edit membuka halaman /users; aktif/nonaktif via PATCH status.
 */
export default function MasterUsers({
  role,
  title,
  subtitle,
  identityLabel,
  searchPlaceholder = "Cari nama, email, atau NIDN...",
  extraColumns = [],
}: MasterUsersProps) {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // User yang akan diaktifkan/nonaktifkan (untuk popup konfirmasi)
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);

  const latestRequestId = useRef(0);
  const isFirstRender = useRef(true);

  const fetchUsers = useCallback(
    async (page: number) => {
      const requestId = ++latestRequestId.current;
      setIsLoading(true);
      setError(null);
      try {
        const res = await getUsers({
          page,
          search: searchQuery || undefined,
          roles: role,
          status: (statusFilter || undefined) as "active" | "pending" | undefined,
        });
        if (requestId !== latestRequestId.current) return;
        setUsers(res.data);
        if (res.pagination) {
          setCurrentPage(res.pagination.page);
          setTotalPages(res.pagination.total_pages);
          setTotalItems(res.pagination.total_items);
        } else {
          setCurrentPage(1);
          setTotalPages(1);
          setTotalItems(res.data.length);
        }
      } catch (err: unknown) {
        if (requestId !== latestRequestId.current) return;
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("Sesi Anda berakhir. Silakan login kembali.");
          navigate("/login");
          return;
        }
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message || "Gagal memuat data."
          : "Gagal memuat data.";
        setError(message);
      } finally {
        if (requestId === latestRequestId.current) setIsLoading(false);
      }
    },
    [searchQuery, statusFilter, role, navigate],
  );

  // Fetch saat filter berubah (debounce 300ms); langsung jalan di render pertama
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      void fetchUsers(1);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentPage(1);
      void fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      void fetchUsers(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  const handleToggleStatus = async () => {
    if (!userToToggle) return;
    setToggling(true);
    try {
      const res = await updateUserStatus(userToToggle.id, {
        is_active: !userToToggle.is_active,
      });
      setToast({ type: "success", text: res.message });
      setUserToToggle(null);
      void fetchUsers(currentPage);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Gagal memperbarui status."
        : "Gagal memperbarui status.";
      setToast({ type: "error", text: msg });
      setUserToToggle(null);
    } finally {
      setToggling(false);
    }
  };

  const isInitialLoading = isLoading && users.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/users/add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm self-start"
        >
          <Plus size={17} />
          Tambah Pengguna
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-500 transition-colors cursor-pointer sm:w-48"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer self-start"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {isInitialLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-12">
            <Loader2 size={18} className="animate-spin text-red-600" />
            Memuat data...
          </div>
        )}

        {!isLoading && error && (
          <div className="text-sm text-red-600 bg-red-50 border-t border-red-100 px-6 py-6">
            {error}
          </div>
        )}

        {!isInitialLoading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3.5 font-semibold">Nama</th>
                    <th className="px-6 py-3.5 font-semibold">{identityLabel}</th>
                    <th className="px-6 py-3.5 font-semibold">Program Studi</th>
                    {extraColumns.map((col) => (
                      <th key={col.header} className="px-6 py-3.5 font-semibold">
                        {col.header}
                      </th>
                    ))}
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={4 + extraColumns.length}
                        className="px-6 py-10 text-center text-gray-400"
                      >
                        {searchQuery || statusFilter
                          ? "Tidak ada data yang cocok dengan filter."
                          : "Belum ada data."}
                      </td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.nidn || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.program_studi?.nama || "-"}
                      </td>
                      {extraColumns.map((col) => (
                        <td key={col.header} className="px-6 py-4 text-gray-600">
                          {col.render(user)}
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <StatusChip active={user.is_active} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Lihat detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Ubah data"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserToToggle(user)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              user.is_active
                                ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                          >
                            <Power size={16} />
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
                  {totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                sampai{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                </span>{" "}
                dari <span className="font-semibold">{totalItems}</span> data
              </p>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>

      {/* Konfirmasi aktif/nonaktif */}
      <ConfirmDialog
        open={Boolean(userToToggle)}
        onOpenChange={(open) => {
          if (!open) setUserToToggle(null);
        }}
        title={userToToggle?.is_active ? "Nonaktifkan Pengguna?" : "Aktifkan Pengguna?"}
        description={
          <>
            Anda akan {userToToggle?.is_active ? "menonaktifkan" : "mengaktifkan"}{" "}
            <span className="font-semibold text-gray-700">{userToToggle?.name}</span>{" "}
            ({userToToggle?.email}).
            {userToToggle?.is_active
              ? " Pengguna tidak akan bisa login selama nonaktif."
              : " Pengguna akan bisa login kembali."}
          </>
        }
        confirmLabel={userToToggle?.is_active ? "Nonaktifkan" : "Aktifkan"}
        cancelLabel="Batal"
        isLoading={toggling}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
}

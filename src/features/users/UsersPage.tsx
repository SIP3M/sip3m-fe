import { useState, useEffect, useRef, useCallback } from "react";
import UsersTable from "./UsersTable";
import { User, UserStatusFilter } from "./users.types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { deleteUser, getUsers } from "./Users.api";
import { AppRole, APP_ROLES } from "@/constant/roles";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useAuthStore } from "@/features/auth/auth.store";

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Id user yang sedang dihapus — untuk spinner di baris tabel
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // User yang akan dihapus (untuk popup konfirmasi)
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(ITEMS_PER_PAGE);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [selectedStatus, setSelectedStatus] = useState<UserStatusFilter | "">(
    "",
  );
  const isInitialLoading = isLoading && users.length === 0;
  const latestRequestId = useRef(0);

  // Fetch users
  const fetchUsers = useCallback(
    async (page: number = 1) => {
      const requestId = ++latestRequestId.current;
      setIsLoading(true);
      setError(null);

      try {
        const response = await getUsers({
          page,
          search: searchQuery || undefined,
          roles: selectedRole || undefined,
          status: selectedStatus || undefined,
        });

        if (requestId !== latestRequestId.current) return;

        const statusFilteredData = response.data.filter((user) => {
          if (!selectedStatus) return true;
          if (selectedStatus === "active") return user.is_active;
          return !user.is_active;
        });

        const backendStatusFilterApplied =
          !selectedStatus || statusFilteredData.length === response.data.length;

        setUsers(statusFilteredData);

        if (response.pagination) {
          if (backendStatusFilterApplied) {
            setCurrentPage(response.pagination.page);
            setTotalPages(response.pagination.total_pages);
            setTotalItems(response.pagination.total_items);
            setPerPage(response.pagination.per_page);
          } else {
            setCurrentPage(1);
            setTotalPages(1);
            setTotalItems(statusFilteredData.length);
            setPerPage(ITEMS_PER_PAGE);
          }
        } else {
          setCurrentPage(1);
          setTotalPages(1);
          setTotalItems(statusFilteredData.length);
          setPerPage(ITEMS_PER_PAGE);
        }
      } catch (err: unknown) {
        if (requestId !== latestRequestId.current) return;
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ||
            err.message ||
            "Failed to fetch users"
          : err instanceof Error
            ? err.message
            : "Failed to fetch users";
        setError(message);
        console.error("Error fetching users:", err);
      } finally {
        if (requestId === latestRequestId.current) {
          setIsLoading(false);
        }
      }
    },
    [searchQuery, selectedRole, selectedStatus],
  );

  const isFirstRender = useRef(true);

  // Fetch on filter change (debounced); runs immediately on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchUsers(1);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      fetchUsers(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleViewUser = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  /**
   * Hapus akun secara permanen (hard delete).
   * Memakai DELETE /users/{id}.
   */
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const user = userToDelete;

    if (currentUser?.id === user.id) {
      setUserToDelete(null);
      setError("Anda tidak dapat menghapus akun Anda sendiri.");
      return;
    }

    setDeletingId(user.id);
    setError(null);

    try {
      await deleteUser(user.id);

      // Kalau baris yang dihapus adalah baris terakhir di halaman ini → mundur 1 halaman
      if (users.length === 1 && currentPage > 1) {
        await fetchUsers(currentPage - 1);
      } else {
        await fetchUsers(currentPage);
      }

      setUserToDelete(null);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.message ||
          "Gagal menghapus user"
        : err instanceof Error
          ? err.message
          : "Gagal menghapus user";
      setError(message);
      setUserToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Manajemen Pengguna
          </h1>

          <p className="text-sm text-gray-500">
            Kelola akun dan hak akses sistem.
          </p>
        </div>

        <button
          onClick={() => navigate("/users/add")}
          className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow transition shrink-0"
        >
          + Tambah Pengguna
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* Role Filter */}
          <select
            value={selectedRole || ""}
            onChange={(e) => setSelectedRole((e.target.value as AppRole) || "")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="" >Semua Role</option>
            {Object.entries(APP_ROLES).map(([, value]) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as UserStatusFilter | "")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Semua Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {isInitialLoading && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">Memuat data pengguna...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isInitialLoading && !isLoading && users.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">Tidak ada pengguna ditemukan</p>
        </div>
      )}

      {/* TABLE WITH PAGINATION */}
      {users.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table */}
          <UsersTable
            users={users}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={(user) => setUserToDelete(user)}
            deletingId={deletingId}
          />

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200">
              {/* Pagination Info */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold">
                    {Math.min((currentPage - 1) * perPage + 1, totalItems)}
                  </span>{" "}
                  hingga{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * perPage, totalItems)}
                  </span>{" "}
                  dari <span className="font-semibold">{totalItems}</span>{" "}
                  pengguna
                </p>

                <p className="text-sm text-gray-500">
                  Halaman <span className="font-semibold">{currentPage}</span>{" "}
                  dari <span className="font-semibold">{totalPages}</span>
                </p>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center px-6 py-4">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* POPUP KONFIRMASI HAPUS AKUN */}
      <ConfirmDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null);
        }}
        title="Hapus Akun?"
        description={
          <>
            Anda akan menghapus akun{" "}
            <span className="font-semibold text-gray-700">
              {userToDelete?.name}
            </span>{" "}
            ({userToDelete?.email}). Akun dan seluruh data terkait akan dihapus
            permanen.
            <span className="mt-2 block font-semibold text-red-600">
              Tindakan ini tidak dapat dibatalkan.
            </span>
          </>
        }
        confirmLabel="Hapus Akun"
        cancelLabel="Batal"
        isLoading={deletingId !== null}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}

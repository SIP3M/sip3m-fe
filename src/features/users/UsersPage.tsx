import UsersTable from "./UsersTable"
import { User } from "./users.types"

const users: User[] = [
  {
    id: 1,
    name: "Dr. Admin Fauzi, M.Kom",
    email: "admin@umc.ac.id",
    role: "ADMIN",
    status: "Active",
  },
  {
    id: 2,
    name: "Siti Staffiyah, S.Kom",
    email: "staff@umc.ac.id",
    role: "STAFF",
    status: "Active",
  },
  {
    id: 3,
    name: "Budi Peneliti, M.T",
    email: "dosen@umc.ac.id",
    role: "DOSEN",
    status: "Active",
    nidn: "0412028801",
  },
  {
    id: 4,
    name: "Prof. Reviewer Santoso",
    email: "reviewer@umc.ac.id",
    role: "REVIEWER",
    status: "Active",
    nidn: "0011223344",
  },
  {
    id: 5,
    name: "Guest User",
    email: "guest@public.com",
    role: "EXTERNAL",
    status: "Active",
  },
]

export default function UsersPage() {

  return (
    <div className="p-8 space-y-6">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Manajemen Pengguna
          </h1>

          <p className="text-sm text-gray-500">
            Kelola akun dan hak akses sistem.
          </p>
        </div>

        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow">
          + Tambah Pengguna
        </button>

      </div>

      {/* TABLE */}

      <UsersTable users={users} />

    </div>
  )
}
import { User } from "./users.types"
import UserRow from "./UserRow"

interface Props {
  users: User[]
}

export default function UsersTable({ users }: Props) {

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-500">

          <tr>
            <th className="text-left px-6 py-4">Nama Lengkap</th>
            <th className="text-left px-6 py-4">Email</th>
            <th className="text-left px-6 py-4">Role</th>
            <th className="text-left px-6 py-4">Status</th>
            <th className="text-left px-6 py-4">Aksi</th>
          </tr>

        </thead>

        <tbody>

          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}

        </tbody>

      </table>

    </div>
  )
}
import { User } from "./users.types";
import UserRow from "./UserRow";

interface Props {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersTable({ users, onView, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[700px] text-sm border-separate border-spacing-y-3">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-6 py-4">Nama Lengkap</th>
              <th className="text-left px-6 py-4">Email</th>
              <th className="text-left px-6 py-4">Role</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Aksi</th>
            </tr>
          </thead>

          <tbody className="space-y-3">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

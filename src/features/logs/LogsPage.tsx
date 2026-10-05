import { Search, Filter, ChevronDown } from "lucide-react"
import LogRow from "./components/LogRow"
import { Log } from "./log.types"

const logs: Log[] = [
  {
    id: 1,
    timestamp: "2023-11-06 14:30",
    user: "Dr. Admin Fauzi",
    role: "ADMIN",
    module: "AUTH",
    action: "LOGIN",
    details: "Successful login from IP 192.168.1.1"
  },
  {
    id: 2,
    timestamp: "2023-11-06 10:15",
    user: "Siti Staffiyah",
    role: "STAFF",
    module: "PROPOSAL",
    action: "UPDATE_STATUS",
    details: "Changed status of PROP-002 to REVIEW"
  },
  {
    id: 3,
    timestamp: "2023-11-05 16:45",
    user: "Budi Peneliti",
    role: "DOSEN",
    module: "PROJECT",
    action: "UPLOAD_FILE",
    details: "Uploaded progress report for PROJ-001"
  },
  {
    id: 4,
    timestamp: "2023-11-05 09:20",
    user: "Prof. Reviewer Santoso",
    role: "REVIEWER",
    module: "REVIEW",
    action: "SUBMIT_REVIEW",
    details: "Submitted review for PROP-001"
  }
]

export default function LogsPage() {

  return (
    <div className="p-8">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            Audit Logs
          </h1>

          <p className="text-gray-500 text-sm">
            Rekaman aktivitas sistem untuk keamanan dan pemantauan.
          </p>

        </div>

        <button className="px-4 py-2 text-sm border rounded-lg">
          Export CSV
        </button>

      </div>


      {/* SEARCH */}

      <div className="bg-white rounded-xl shadow p-6 mb-4">

        <div className="flex gap-4">

          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full">

            <Search size={16} className="text-gray-400"/>

            <input
              type="text"
              placeholder="Cari user, aktivitas, atau module..."
              className="outline-none w-full text-sm"
            />

          </div>

          <div className="relative">
            <select className="appearance-none border rounded-lg px-3 pr-9 py-2 text-sm bg-white text-gray-700">
              <option value="">Semua Role</option>
              <option value="ADMIN_LPPM">ADMIN_LPPM</option>
              <option value="STAFF_LPPM">STAFF_LPPM</option>
              <option value="DOSEN">DOSEN</option>
              <option value="REVIEWER">REVIEWER</option>
              <option value="REVIEWER_EKSTERNAL">REVIEWER_EKSTERNAL</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">

            <Filter size={16}/>
            Filter

          </button>

        </div>

      </div>


      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500 text-left">

            <tr>

              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Module</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>

            </tr>

          </thead>

          <tbody>

            {logs.map((log) => (
              <LogRow
                key={log.id}
                log={log}
              />
            ))}

          </tbody>

        </table>


        {/* FOOTER */}

        <div className="flex justify-between items-center p-4 text-sm text-gray-500">

          <p>
            Menampilkan 4 dari 4 entri
          </p>

          <div className="flex gap-2">

            <button className="px-3 py-1 border rounded">
              Previous
            </button>

            <button className="px-3 py-1 border rounded">
              Next
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}
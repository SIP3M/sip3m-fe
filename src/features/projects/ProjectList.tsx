import { Activity, CheckCircle, AlertCircle } from "lucide-react"
import ProjectRow from "./components/ProjectRow"
import { Project } from "./project.types"

const projects: Project[] = [
  {
    id: 1,
    name: "Analisis Dampak Lingkungan Limbah Pabrik Gula",
    leader: "Dr. Peneliti Utama",
    progress: 75,
    milestone: "Laporan Kemajuan 2",
    status: "ON_TRACK"
  },
  {
    id: 2,
    name: "Implementasi Smart Village di Desa Setupatok",
    leader: "Dr. Peneliti Utama",
    progress: 30,
    milestone: "Survey Lapangan",
    status: "DELAYED"
  }
]

export default function ProjectList() {

  return (
    <div className="p-8">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Monitoring Proyek
        </h1>

        <p className="text-gray-500 text-sm">
          Pantau kemajuan penelitian dan pengabdian berjalan.
        </p>

      </div>


      {/* STATS */}

      <div className="grid grid-cols-3 gap-6 mb-6">

        {/* CARD 1 */}

        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">

          <div>
            <p className="text-gray-500 text-sm">
              Total Proyek Aktif
            </p>
            <h2 className="text-2xl font-bold">2</h2>
          </div>

          <Activity className="text-blue-500"/>

        </div>


        {/* CARD 2 */}

        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">

          <div>
            <p className="text-gray-500 text-sm">
              Proyek Selesai
            </p>
            <h2 className="text-2xl font-bold">0</h2>
          </div>

          <CheckCircle className="text-green-500"/>

        </div>


        {/* CARD 3 */}

        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">

          <div>
            <p className="text-gray-500 text-sm">
              Proyek Terlambat
            </p>
            <h2 className="text-2xl font-bold">1</h2>
          </div>

          <AlertCircle className="text-red-500"/>

        </div>

      </div>


      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="font-semibold">
            Daftar Proyek Berjalan
          </h2>

          <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg">
            Filter Status
          </button>

        </div>

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500 text-left">

            <tr>

              <th className="px-6 py-4">Nama Proyek</th>
              <th className="px-6 py-4">Ketua Peneliti</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Milestone Berikutnya</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Aksi</th>

            </tr>

          </thead>

          <tbody>

            {projects.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
              />
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}
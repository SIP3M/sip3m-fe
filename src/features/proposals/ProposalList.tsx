import { Search, Filter } from "lucide-react"
import ProposalRow from "./components/ProposalRow"
import { Proposal } from "./proposal.types"

const proposals: Proposal[] = [
  {
    id: 1,
    title: "Pengembangan Algoritma AI untuk",
    researcher: "Budi Peneliti, M.T.",
    nidn: "04123456",
    schema: "Penelitian Terapan",
    year: 2023,
    budget: 15000000,
    status: "REVIEW",
  },
  {
    id: 2,
    title: "Pemberdayaan UMKM Batik Trusmi",
    researcher: "Sari Ekonomi, M.M.",
    nidn: "04123456",
    schema: "Pengabdian Masyarakat",
    year: 2023,
    budget: 7500000,
    status: "SUBMITTED",
  },
  {
    id: 3,
    title: "Analisis Dampak Lingkungan Limbah",
    researcher: "Dr. Alam Lingkungan",
    nidn: "04123456",
    schema: "Penelitian Dasar",
    year: 2023,
    budget: 25000000,
    status: "APPROVED",
  },
]

export default function ProposalList() {
  return (
    <div className="p-8">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Daftar Proposal
          </h1>

          <p className="text-gray-500 text-sm">
            Seluruh proposal penelitian dan pengabdian
          </p>
        </div>

        <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
          Export Excel
        </button>

      </div>


      {/* FILTER BAR */}

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">

        <div className="flex items-center border rounded-lg px-3 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full p-2 outline-none text-sm"
            placeholder="Cari judul atau nama peneliti..."
          />
        </div>

        <input className="border rounded-lg px-3 py-2 text-sm w-40" />
        <input className="border rounded-lg px-3 py-2 text-sm w-40" />
        <input className="border rounded-lg px-3 py-2 text-sm w-40" />

        <button className="flex items-center gap-2 px-4 bg-gray-100 rounded-lg text-sm">
          <Filter size={16} />
          Filter
        </button>

      </div>


      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500 text-left">

            <tr>

              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">Judul Proposal</th>
              <th className="px-6 py-4">Peneliti</th>
              <th className="px-6 py-4">Skema</th>
              <th className="px-6 py-4">Tahun</th>
              <th className="px-6 py-4">Anggaran</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Aksi</th>

            </tr>

          </thead>

          <tbody>

            {proposals.map((p) => (
              <ProposalRow
                key={p.id}
                proposal={p}
              />
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}
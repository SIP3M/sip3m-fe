import FinanceRow from "./components/FinanceRow"
import { Finance } from "./finance.types"

const finances: Finance[] = [
  {
    id: 1,
    project: "Analisis Dampak",
    leader: "Dr. Alam Lingkungan",
    rab: 25000000,
    realization: 12500000,
    status: "APPROVED",
    date: "2023-11-01"
  },
  {
    id: 2,
    project: "Implementasi Smart Village",
    leader: "Budi Peneliti, M.T.",
    rab: 15000000,
    realization: 0,
    status: "PENDING",
    date: "2023-11-05"
  },
  {
    id: 3,
    project: "Revitalisasi Bahasa",
    leader: "Ani Sastra, M.Hum.",
    rab: 10000000,
    realization: 10000000,
    status: "DISBURSED",
    date: "2023-10-15"
  }
]

export default function FinancePage() {

  return (
    <div className="p-8">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Keuangan & Hibah
        </h1>

        <p className="text-gray-500 text-sm">
          Manajemen pencairan dana hibah penelitian.
        </p>

      </div>


      {/* STATS */}

      <div className="grid grid-cols-3 gap-6 mb-6">

        {/* TOTAL HIBAH */}

        <div className="bg-linear-to-r from-blue-900 to-blue-700 text-white p-6 rounded-xl shadow">

          <p className="text-sm opacity-80">
            Total Anggaran Hibah
          </p>

          <h2 className="text-2xl font-bold mt-1">
            Rp 50.000.000
          </h2>

          <p className="text-green-300 text-xs mt-2">
            +15% dari tahun lalu
          </p>

        </div>


        {/* DANA TERSERAP */}

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-sm text-gray-500">
            Dana Terserap
          </p>

          <h2 className="text-xl font-semibold text-green-600">
            Rp 22.500.000
          </h2>

          <div className="mt-3 w-full bg-gray-200 h-2 rounded">

            <div
              className="h-2 bg-green-500 rounded"
              style={{ width: "45%" }}
            />

          </div>

        </div>


        {/* SISA */}

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-sm text-gray-500">
            Sisa Anggaran
          </p>

          <h2 className="text-xl font-semibold">
            Rp 27.500.000
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            Tersedia untuk tim berikutnya
          </p>

        </div>

      </div>


      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="font-semibold">
            Status Pencairan Dana
          </h2>

          <div className="flex gap-3">

            <button className="px-4 py-2 text-sm border rounded-lg">
              Export Excel
            </button>

            <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">
              Ajukan Pencairan Baru
            </button>

          </div>

        </div>


        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500 text-left">

            <tr>

              <th className="px-6 py-4">Nama Proyek</th>
              <th className="px-6 py-4">Total RAB</th>
              <th className="px-6 py-4">Realisasi</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tgl Pengajuan</th>
              <th className="px-6 py-4">Aksi</th>

            </tr>

          </thead>

          <tbody>

            {finances.map((f) => (
              <FinanceRow
                key={f.id}
                data={f}
              />
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}
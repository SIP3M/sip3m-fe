import { Search, Eye, Download } from "lucide-react"
import { useState } from "react"

type Review = {
  id: number
  title: string
  category: string
  submitDate: string
  reviewDate: string
  status: "APPROVED" | "REVISION"
  score: number
}

const data: Review[] = [
  {
    id: 1,
    title: "Analisis Dampak Lingkungan Limbah",
    category: "Penelitian Dasar",
    submitDate: "2023-09-01",
    reviewDate: "2023-11-05",
    status: "APPROVED",
    score: 85
  },
  {
    id: 2,
    title: "Revitalisasi Bahasa Daerah Cirebon",
    category: "Penelitian Dasar",
    submitDate: "2023-10-10",
    reviewDate: "2023-11-05",
    status: "REVISION",
    score: 65
  }
]

export default function HistoryReview() {
  const [search, setSearch] = useState("")
  const [year, setYear] = useState("")

  const filtered = data.filter((item) => {
    const matchSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchYear = year
      ? item.submitDate.startsWith(year)
      : true

    return matchSearch && matchYear
  })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Riwayat Review
        </h1>
        <p className="text-gray-500 text-sm">
          Daftar proposal yang telah selesai Anda nilai.
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* SEARCH + FILTER */}
        <div className="flex gap-4 mb-4">

          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul proposal..."
              className="outline-none w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <input
            type="text"
            placeholder="Filter Tahun"
            className="border rounded-lg px-3 py-2 text-sm w-40"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3">Judul Proposal</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Tgl Submit</th>
                <th className="px-6 py-3">Tgl Review</th>
                <th className="px-6 py-3">Keputusan</th>
                <th className="px-6 py-3">Skor</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {item.title}
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {item.category}
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {item.submitDate}
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {item.reviewDate}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          item.status === "APPROVED"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-700">
                    {item.score}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3 text-gray-500">

                      <button className="hover:text-gray-700">
                        <Eye size={16} />
                      </button>

                      <button className="hover:text-gray-700">
                        <Download size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <p>
            Menampilkan {filtered.length} dari {data.length} entri
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
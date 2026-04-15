import { useState } from "react"
import { UserCheck } from "lucide-react"
import { ReviewProposal } from "./review.types"
import { User as UserIcon } from "lucide-react"

const proposals: ReviewProposal[] = [
  {
    id: 1,
    title: "Pengembangan Algoritma AI untuk Deteksi Hama Padi di Cirebon",
    category: "Penelitian Terapan",
    status: "Accepted",
    reviewer: "Dr. Ahmad"
  },
  {
    id: 2,
    title: "Pemberdayaan UMKM Batik Trusmi Melalui Digital Marketing",
    category: "Pengabdian Masyarakat",
    status: "Under Review",
    reviewer: "Dr. Sugiyanto",
  }
]

export default function ReviewListStaff() {
  const [selectedProposal, setSelectedProposal] =
    useState<ReviewProposal | null>(null)

  const [reviewerA, setReviewerA] = useState("")
  const [reviewerB, setReviewerB] = useState("")

  return (
    <div className="p-10 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Plotting Reviewer
        </h1>
        <p className="text-gray-500 text-sm">
          Tentukan reviewer untuk proposal yang masuk.
        </p>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6">

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Judul Proposal</th>
                <th className="px-6 py-4 text-left font-medium">Kategori</th>
                <th className="px-6 py-4 text-left font-medium">Reviewer Saat Ini</th>
                <th className="px-6 py-4 text-left font-medium">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {proposals.map((p, index) => (
                <tr
                  key={p.id}
                  className={`border-t ${index === 0 ? "bg-red-50" : ""}`}
                >
                  <td className="px-6 py-4 text-gray-700">{p.title}</td>

                  <td className="px-6 py-4 text-gray-600">{p.category}</td>

                  <td className="px-6 py-4">
                    {p.status === "Accepted" ? (
                      <span className="text-green-600 flex items-center gap-2">
                        <UserCheck size={16} />
                        Assigned
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">
                        Belum ada
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedProposal(p)}
                      className={`
                        px-4 py-1.5 rounded-full text-xs font-medium
                        ${p.status === "Accepted"
                          ? "bg-red-500 text-white"
                          : "border border-gray-300 text-gray-600"}
                      `}
                    >
                      Pilih
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-w-[300px]">

          {selectedProposal ? (
            <div>

              <h2 className="font-semibold text-gray-800">
                Tugaskan Reviewer
              </h2>

              <p className="text-xs text-gray-400 mb-4">
                ID: PROP-00{selectedProposal.id}
              </p>

              {/* BOX TABLE STYLE */}
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">
                  Judul Proposal
                </p>
                <p className="text-sm text-gray-700">
                  {selectedProposal.title}
                </p>
              </div>

              {/* FORM TABLE STYLE */}
              <div className="space-y-4">

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Pilih Reviewer 1
                  </label>
                  <input
                    type="text"
                    value={reviewerA}
                    onChange={(e) => setReviewerA(e.target.value)}
                    className="w-full h-[42px] rounded-lg border border-gray-300 px-3 text-sm bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Pilih Reviewer 2 (Opsional)
                  </label>
                  <input
                    type="text"
                    value={reviewerB}
                    onChange={(e) => setReviewerB(e.target.value)}
                    className="w-full h-[42px] rounded-lg border border-gray-300 px-3 text-sm bg-white shadow-sm"
                  />
                </div>

                <button
                  className="w-full h-[44px] rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                >
                  Simpan Penugasan
                </button>

              </div>

            </div>
          ) : (
            <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
              <UserIcon size={48} className="mb-3" />
              <p>
                Pilih proposal di sebelah kiri
                <br />
                untuk menugaskan reviewer.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
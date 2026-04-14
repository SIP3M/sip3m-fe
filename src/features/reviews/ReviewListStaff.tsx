// import { useState } from "react"
// import ProposalReviewerRow from "./components/ProposalReviewerRow"
// import { ReviewProposal } from "./review.types"

// const proposals: ReviewProposal[] = [
//   {
//     id: 1,
//     title: "Pengembangan Algoritma AI untuk Deteksi Hama Padi di Cirebon",
//     category: "Penelitian Terapan",
//     reviewer: "Dr. Ahmad",
//   },
//   {
//     id: 2,
//     title: "Pemberdayaan UMKM Batik Trusmi Melalui Digital Marketing",
//     category: "Pengabdian Masyarakat",
//   },
// ]

// export default function ReviewListStaff() {

//   const [selectedProposal, setSelectedProposal] =
//     useState<ReviewProposal | null>(proposals[0])

//   return (
//     <div className="p-8">

//       {/* HEADER */}

//       <div className="mb-6">
//         <h1 className="text-2xl font-semibold text-gray-800">
//           Plotting Reviewer
//         </h1>

//         <p className="text-sm text-gray-500">
//           Tentukan reviewer untuk proposal yang masuk.
//         </p>
//       </div>


//       {/* GRID */}

//       <div className="grid grid-cols-[2fr_1fr] gap-6">

//         {/* LEFT TABLE */}

//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">

//           <table className="w-full text-sm">

//             <thead className="bg-gray-50 text-gray-500 text-left">

//               <tr>
//                 <th className="px-6 py-4">Judul Proposal</th>
//                 <th className="px-6 py-4">Kategori</th>
//                 <th className="px-6 py-4">Reviewer Saat Ini</th>
//                 <th className="px-6 py-4"></th>
//               </tr>

//             </thead>

//             <tbody>

//               {proposals.map((p) => (

//                 <ProposalReviewerRow
//                   key={p.id}
//                   proposal={p}
//                   onSelect={setSelectedProposal}
//                   active={selectedProposal?.id === p.id}
//                 />

//               ))}

//             </tbody>

//           </table>

//         </div>


//         {/* RIGHT PANEL */}

//         <div className="bg-white rounded-xl shadow-sm p-6 h-fit">

//           <h2 className="font-semibold text-gray-800 mb-1">
//             Tugaskan Reviewer
//           </h2>

//           <p className="text-xs text-gray-400 mb-4">
//             ID: PROP-001
//           </p>

//           {selectedProposal && (

//             <>

//               <div className="bg-gray-100 p-3 rounded-lg text-sm mb-5">

//                 <p className="text-gray-400 text-xs mb-1">
//                   Judul Proposal
//                 </p>

//                 <p className="text-gray-700">
//                   {selectedProposal.title}
//                 </p>

//               </div>


//               <div className="mb-4">

//                 <label className="text-sm text-gray-600">
//                   Pilih Reviewer 1
//                 </label>

//                 <input
//                   type="text"
//                   className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
//                 />

//               </div>


//               <div className="mb-6">

//                 <label className="text-sm text-gray-600">
//                   Pilih Reviewer 2 (Opsional)
//                 </label>

//                 <input
//                   type="text"
//                   className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
//                 />

//               </div>


//               <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
//                 Simpan Penugasan
//               </button>

//             </>

//           )}

//         </div>

//       </div>

//     </div>
//   )
// }

import { useState } from "react"
import ProposalReviewerRow from "./components/ProposalReviewerRow"
import { ReviewProposal } from "./review.types"
import { User } from "lucide-react"

const proposals: ReviewProposal[] = [
  {
    id: 1,
    title: "Pengembangan Algoritma AI untuk Deteksi Hama Padi di Cirebon",
    category: "Penelitian Terapan",
    reviewer: "Dr. Ahmad"
  },
  {
    id: 2,
    title: "Pemberdayaan UMKM Batik Trusmi Melalui Digital Marketing",
    category: "Pengabdian Masyarakat"
  }
]

export default function ReviewList() {

  const [selectedProposal, setSelectedProposal] =
    useState<ReviewProposal | null>(null)

  return (
    <div className="p-8">

      {/* HEADER */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Plotting Reviewer
        </h1>

        <p className="text-gray-500 text-sm">
          Tentukan reviewer untuk proposal yang masuk.
        </p>
      </div>


      {/* MAIN GRID */}

      <div className="grid grid-cols-[2fr_1fr] gap-6">

        {/* LEFT TABLE */}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-4">Judul Proposal</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Reviewer Saat Ini</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>

            <tbody>

              {proposals.map((p) => (
                <ProposalReviewerRow
                  key={p.id}
                  proposal={p}
                  onSelect={setSelectedProposal}
                />
              ))}

            </tbody>

          </table>

        </div>


        {/* RIGHT PANEL */}

        <div className="bg-white rounded-xl shadow-sm min-w-[280px] flex items-center justify-center">

          {selectedProposal ? (

            <div className="p-6 w-full">

              <h2 className="font-semibold text-lg mb-4">
                Assign Reviewer
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                {selectedProposal.title}
              </p>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Pilih Reviewer
              </button>

            </div>

          ) : (

            <div className="text-center text-gray-400 p-6">

              <User size={48} className="mx-auto mb-3"/>

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
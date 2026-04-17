import { useState } from "react";
import { Search, Filter, Clock, AlertCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Proposal {
  id: number;
  title: string;
  author: string;
  category: string;
  assignedDate: string;
  deadline: string;
  status: "Pending" | "Progress" | "Done";
}

const dummyData: Proposal[] = [
  {
    id: 1,
    title: "Pengembangan Algoritma AI untuk Deteksi Hama",
    author: "Budi Peneliti, M.T.",
    category: "Penelitian Terapan",
    assignedDate: "05 Nov 2023",
    deadline: "3 Hari Lagi",
    status: "Pending",
  },
];

export default function ReviewListReviewer() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // 🔥 FILTER + SEARCH
  const filtered = dummyData.filter((item) => {
    const matchSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchFilter =
      filter === "ALL" ? true : item.status === filter;

    return matchSearch && matchFilter;
  });

  // 🔥 STATS
  const total = dummyData.length;
  const pending = dummyData.filter((d) => d.status === "Pending").length;
  const progress = dummyData.filter((d) => d.status === "Progress").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Tugas Review
        </h1>
        <p className="text-sm text-gray-500">
          Daftar proposal yang menunggu penilaian Anda.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* PERLU REVIEW */}
        <div className="bg-white border border-orange-300 rounded-xl p-4 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Perlu Direview</p>
            <p className="text-2xl font-bold">{pending}</p>
            <p className="text-xs text-gray-400">Segera kerjakan</p>
          </div>
          <div className="bg-orange-100 p-2 rounded-lg">
            <AlertCircle className="text-orange-500" size={18} />
          </div>
        </div>

        {/* PROGRESS */}
        <div className="bg-white border border-blue-400 rounded-xl p-4 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Dalam Progress</p>
            <p className="text-2xl font-bold">{progress}</p>
            <p className="text-xs text-gray-400">Sedang dikerjakan</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg">
            <Clock className="text-blue-500" size={18} />
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Tugas</p>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-gray-400">Tahun ini</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-lg">
            <FileText className="text-gray-500" size={18} />
          </div>
        </div>

      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex gap-3">

        {/* SEARCH */}
        <div className="flex items-center bg-gray-100 px-3 rounded-lg w-full">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul proposal atau nama peneliti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-2 bg-transparent outline-none text-sm"
          />
        </div>

        {/* FILTER */}
        <button
          onClick={() =>
            setFilter(filter === "Pending" ? "ALL" : "Pending")
          }
          className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2"
        >
          <Filter size={14} /> Filter
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-7 text-xs text-gray-400 px-4 py-3 border-b">
          <p>No</p>
          <p>Judul Proposal</p>
          <p>Peneliti</p>
          <p>Kategori</p>
          <p>Ditugaskan</p>
          <p>Tenggat Waktu</p>
          <p>Aksi</p>
        </div>

        {/* DATA */}
        {filtered.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-7 px-4 py-4 text-sm items-center border-b"
          >
            <p>{index + 1}</p>

            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 mt-1" />
              <p>{item.title}</p>
            </div>

            <p className="text-gray-600">{item.author}</p>
            <p className="text-gray-600">{item.category}</p>
            <p className="text-gray-500">{item.assignedDate}</p>

            <p className="text-red-500">{item.deadline}</p>

            <div className="flex items-center gap-2">

              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                {item.status}
              </span>

              <button
                onClick={() =>
                  navigate(`/reviewer-dashboard/reviews/${item.id}`)
                }
                className="text-red-600 text-xs hover:underline"
              >
                Mulai Review
              </button>

            </div>
          </div>
        ))}

      </div>

      {/* FOOTER INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 text-sm text-blue-700">
        <p className="font-medium mb-1">Panduan Review</p>
        <p>
          Setiap proposal harus dinilai berdasarkan kriteria:
          <b> Orisinalitas (25%)</b>, <b>Metodologi (30%)</b>,
          <b> Kelayakan (25%)</b>, dan <b>Luaran (20%)</b>.
          Pastikan semua aspek sudah Anda evaluasi sebelum mengirimkan penilaian.
        </p>
      </div>

    </div>
  );
}
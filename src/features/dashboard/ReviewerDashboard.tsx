import { FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReviewerDashboard() {
  const navigate = useNavigate();

  const data = [
    {
      id: 1,
      title: "Pengembangan Algoritma AI untuk Deteksi Hama",
      category: "Penelitian Terapan",
      deadline: "3 Hari Lagi",
      status: "REVIEW",
    },
  ];

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Dashboard Reviewer
        </h1>
        <p className="text-sm text-gray-500">
          Kelola tugas review proposal penelitian.
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* TUGAS BARU */}
        <div className="bg-white border-2 border-red-500 rounded-xl p-5 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Tugas Baru</p>
            <p className="text-2xl font-bold mt-1">1</p>
            <p className="text-xs text-gray-400 mt-2">
              Perlu diselesaikan segera
            </p>
          </div>
          <div className="bg-red-100 p-2 rounded-lg">
            <FileText className="text-red-600" size={18} />
          </div>
        </div>

        {/* SELESAI */}
        <div className="bg-white border-2 border-green-500 rounded-xl p-5 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Selesai Direview</p>
            <p className="text-2xl font-bold mt-1">1</p>
            <p className="text-xs text-gray-400 mt-2">
              Dalam tahun ini
            </p>
          </div>
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircle className="text-green-600" size={18} />
          </div>
        </div>

        {/* STATISTIK */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">
            Statistik Review
          </p>

          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs w-12">Aktif</p>
            <div className="flex-1 bg-gray-200 h-2 rounded">
              <div className="bg-red-500 h-2 rounded w-[80%]" />
            </div>
            <p className="text-xs">1</p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs w-12">Selesai</p>
            <div className="flex-1 bg-gray-200 h-2 rounded">
              <div className="bg-green-500 h-2 rounded w-[80%]" />
            </div>
            <p className="text-xs">1</p>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl p-5 shadow-sm overflow-hidden">

        <div className="mb-4">
          <h2 className="font-semibold text-gray-800">
            Daftar Tugas Review
          </h2>
          <p className="text-sm text-gray-500">
            Proposal yang menunggu penilaian Anda.
          </p>
        </div>

        <div className="overflow-x-auto w-full">
          <div className="min-w-[700px]">
            {/* HEADER */}
            <div className="grid grid-cols-5 text-xs text-gray-400 border-b pb-2 mb-3 gap-2">
              <p>Judul Proposal</p>
              <p>Kategori</p>
              <p>Tenggat Waktu</p>
              <p>Status</p>
              <p>Aksi</p>
            </div>

            {/* ROW */}
            {data.map((item) => (
              <div key={item.id} className="grid grid-cols-5 items-center text-sm gap-2">

                <p>{item.title}</p>
                <p className="text-gray-500">{item.category}</p>
                <p className="text-red-500">{item.deadline}</p>

                <span className="bg-yellow-100 text-yellow-600 px-2 py-1 text-xs rounded-full w-fit">
                  {item.status}
                </span>

                <button
                  onClick={() =>
                    navigate(`/reviewer-dashboard/reviews/${item.id}`)
                  }
                  className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-700 w-fit cursor-pointer"
                >
                  Mulai Review
                </button>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
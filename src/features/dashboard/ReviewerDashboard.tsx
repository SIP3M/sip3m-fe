import { FileText, CheckCircle, Clock, TrendingUp, BookOpen, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReviewerDashboard() {
  const navigate = useNavigate();

  const data = [
    {
      id: 1,
      title: "Pengembangan Algoritma Al untuk Deteksi",
      category: "Penelitian Terapan",
      deadline: "3 Hari Lagi",
      status: "REVIEW",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard Reviewer
        </h1>
        <p className="text-sm text-gray-500">
          Kelola dan pantau tugas review proposal penelitian Anda.
        </p>
      </div>

      {/* TOP CARDS - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Tugas Aktif */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 font-medium">Tugas Aktif</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">1</p>
              <p className="text-xs text-gray-400 mt-2">Perlu diselesaikan</p>
            </div>
            <div className="bg-red-50 p-2.5 rounded-lg">
              <FileText className="text-red-500" size={20} />
            </div>
          </div>
        </div>

        {/* Selesai Direview */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 font-medium">Selesai Direview</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">11</p>
              <p className="text-xs text-gray-400 mt-2">Tahun akademik ini</p>
            </div>
            <div className="bg-green-50 p-2.5 rounded-lg">
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </div>
        </div>

        {/* Rata-rata Nilai */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 font-medium">Rata-rata Nilai</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">82.4</p>
              <p className="text-xs text-gray-400 mt-2">Dari semua review</p>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <TrendingUp className="text-blue-500" size={20} />
            </div>
          </div>
        </div>

        {/* Deadline Terdekat */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 font-medium">Deadline Terdekat</p>
              <p className="text-3xl font-bold text-orange-500 mt-1">3 Hari</p>
              <p className="text-xs text-gray-400 mt-2">PROP-001 — Segera</p>
            </div>
            <div className="bg-orange-50 p-2.5 rounded-lg">
              <Clock className="text-orange-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trend Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Tren Rata-rata Nilai Review</h3>
              <p className="text-xs text-gray-400">6 bulan terakhir</p>
            </div>
          </div>
          
          {/* Chart Visualization */}
          <div className="relative h-48">
            <div className="absolute inset-0 flex items-end justify-between px-1">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-1">
                <span>100</span>
                <span>90</span>
                <span>80</span>
                <span>70</span>
                <span>60</span>
              </div>
              
              {/* Chart bars */}
              <div className="w-full h-full pl-8 flex items-end justify-around gap-2">
                {[65, 72, 78, 82, 79, 85].map((value, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full max-w-[40px] bg-blue-500 rounded-t transition-all duration-300"
                      style={{ height: `${(value / 100) * 80}%` }}
                    />
                    <span className="text-xs text-gray-400 mt-2">
                      {['Agus', 'Sep', 'Okt', 'Nov', 'Des', 'Jan'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Kategori Proposal Direview</h3>
              <p className="text-xs text-gray-400">Distribusi berdasarkan skema penelitian</p>
            </div>
          </div>
          
          {/* Category Chart */}
          <div className="flex items-end justify-around h-48 pt-4">
            {[
              { label: 'Penelitian Dasar', value: 8, color: 'bg-blue-500' },
              { label: 'Penelitian Terapan', value: 6, color: 'bg-green-500' },
              { label: 'Pengabdian', value: 4, color: 'bg-orange-500' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className={`${item.color} rounded-t transition-all duration-300 w-full max-w-[60px]`}
                  style={{ height: `${(item.value / 8) * 80}%` }}
                />
                <div className="text-xs text-gray-600 font-medium mt-2">{item.value}</div>
                <span className="text-xs text-gray-400 text-center mt-1">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tugas Review Aktif Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Tugas Review Aktif</h2>
            <p className="text-sm text-gray-500">Proposal yang menunggu penilaian Anda</p>
          </div>
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">1</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Judul Proposal</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Kategori</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Tenggat</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{item.title}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{item.category}</td>
                    <td className="px-5 py-3 text-sm text-red-500 font-medium">{item.deadline}</td>
                    <td className="px-5 py-3">
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(`/reviewer-dashboard/reviews/${item.id}`)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
                      >
                        Mulai Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Riwayat Review Terakhir & Panduan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Riwayat Review */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Riwayat Review Terakhir</h3>
          
          <div className="space-y-4">
            {[
              { title: 'Analisis Dampak Lingkungan Limbah Pabrik Gula', date: '02 Nov 2023 · PROP-003', score: 85 },
              { title: 'Revitalisasi Bahasa Daerah Cirebon Berbasis App', date: '15 Okt 2023 · PROP-005', score: 65 },
              { title: 'Analisis Kualitas Air Sungai Cimanuk', date: '28 Sep 2023 · PROP-007', score: 78 }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
                <span className={`text-lg font-bold ${item.score >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                  {item.score}
                </span>
                <span className="text-xs text-gray-400 ml-1">/ 100</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panduan Penilaian */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-sm border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg mt-1">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Panduan Penilaian LPPM UMC</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Setiap proposal dievaluasi berdasarkan 5 indikator:{' '}
                <span className="font-medium">Perumusan Masalah (20%)</span>,{' '}
                <span className="font-medium">Tinjauan Pustaka (20%)</span>,{' '}
                <span className="font-medium">Metode Penelitian (25%)</span>,{' '}
                <span className="font-medium">Kelayakan Anggaran (15%)</span>, dan{' '}
                <span className="font-medium">Luaran & Kontribusi (20%)</span>.
                <br />
                <span className="text-gray-500">Pastikan setiap indikator telah dinilai dan diberi catatan sebelum submit.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
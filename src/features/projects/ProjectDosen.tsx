import { CheckCircle, Circle, Upload } from "lucide-react";

export default function ProjectDosen() {
  return (
    <div className="p-6 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Proyek Saya
        </h1>
        <p className="text-sm text-gray-500">
          Kelola milestone dan laporan kemajuan penelitian.
        </p>
      </div>

      {/* CARD UTAMA */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

        {/* TOP */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                Sedang Berjalan
              </span>
              <span className="text-xs text-gray-400">
                PROJ - 001
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              Analisis Dampak Lingkungan Limbah Pabrik Gula
            </h2>

            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Penelitian fokus pada analisis parameter lingkungan limbah cair dari pabrik gula di wilayah Cirebon Timur untuk mitigasi pencemaran sungai.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">
              Progress Keseluruhan
            </p>
            <p className="text-2xl font-bold text-red-600">
              75%
            </p>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="relative flex items-center justify-between mt-8 mb-6">

          {/* LINE */}
          <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-200"></div>

          {/* STEP 1 */}
          <div className="relative flex flex-col items-center text-center w-1/4">
            <div className="bg-green-500 text-white rounded-full p-1 z-10">
              <CheckCircle size={18} />
            </div>
            <p className="text-xs mt-2 text-gray-700">
              Tanda Tangan Kontrak
            </p>
            <p className="text-xs text-gray-400">
              2023-09-10
            </p>
          </div>

          {/* STEP 2 */}
          <div className="relative flex flex-col items-center text-center w-1/4">
            <div className="bg-green-500 text-white rounded-full p-1 z-10">
              <CheckCircle size={18} />
            </div>
            <p className="text-xs mt-2 text-gray-700">
              Laporan Kemajuan 1 (30%)
            </p>
            <p className="text-xs text-gray-400">
              2023-10-10
            </p>
          </div>

          {/* STEP 3 ACTIVE */}
          <div className="relative flex flex-col items-center text-center w-1/4">
            <div className="border-2 border-red-500 rounded-full p-1 z-10 bg-white">
              <Circle size={18} className="text-red-500" />
            </div>
            <p className="text-xs mt-2 text-red-600 font-medium">
              Laporan Kemajuan 2 (70%)
            </p>
            <p className="text-xs text-gray-400">
              2023-11-10
            </p>
          </div>

          {/* STEP 4 */}
          <div className="relative flex flex-col items-center text-center w-1/4">
            <div className="bg-gray-200 text-gray-400 rounded-full p-1 z-10">
              <Circle size={18} />
            </div>
            <p className="text-xs mt-2 text-gray-400">
              Laporan Akhir (100%)
            </p>
            <p className="text-xs text-gray-400">
              2023-12-10
            </p>
          </div>

        </div>

        {/* UPLOAD BOX */}
        <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <div className="bg-white border rounded-lg p-2">
              <Upload size={18} className="text-red-500" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Upload Laporan Kemajuan 2 (70%)
              </p>
              <p className="text-xs text-gray-500">
                Tenggat waktu: 10 November 2023
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100">
              Lihat Panduan
            </button>

            <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
              Upload Dokumen
            </button>
          </div>

        </div>

      </div>

      {/* BOTTOM CARD */}
      <div className="grid grid-cols-2 gap-6">

        {/* CARD SELESAI */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">
              PKM Batik Trusmi
            </p>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
              Selesai
            </span>
          </div>

          <p className="text-xs text-gray-500">
            2022 • Pengabdian Masyarakat
          </p>

          <p className="text-xs text-gray-400 mt-2">
            📄 Laporan Akhir.pdf &nbsp;&nbsp; 📅 Des 2022
          </p>
        </div>

        {/* CARD ARSIP */}
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
            ...
          </div>

          <p className="text-sm font-medium">
            Lihat Arsip Proyek
          </p>

          <p className="text-xs text-gray-400">
            Tampilkan semua proyek tahun lalu
          </p>
        </div>

      </div>

    </div>
  );
}
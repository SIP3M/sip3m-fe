import { AlertCircle, Download } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function FinanceDetail({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-start overflow-y-auto">
      <div className="bg-gray-100 w-full max-w-6xl p-6 mt-10 rounded-xl">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button onClick={onClose} className="text-gray-500 mb-2">
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Detail Keuangan Proyek
            </h1>
            <p className="text-sm text-gray-500">
              Analisis Dampak Lingkungan Limbah Pabrik Gula
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white">
            <Download className="h-4 w-4" />
            Export Laporan
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
            <p className="text-sm text-blue-600">Total Hibah</p>
            <h2 className="text-2xl font-bold text-blue-900 mt-1">
              Rp 25.000.000
            </h2>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
            <p className="text-sm text-green-600">Sudah Dicairkan</p>
            <h2 className="text-2xl font-bold text-green-800 mt-1">
              Rp 12.500.000
            </h2>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500">Sisa Dana</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Rp 12.500.000
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="col-span-2 space-y-6">
            {/* TERMIN TABLE */}
            <div className="bg-white rounded-xl shadow p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-4 py-3 rounded-l-lg">Termin</th>
                    <th className="px-4 py-3">Nominal</th>
                    <th className="px-4 py-3">Tgl Pengajuan</th>
                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-4 font-medium text-gray-700">
                      Termin 1 (70%)
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      Rp 17.500.000
                    </td>
                    <td className="px-4 py-4 text-gray-600">2023-09-15</td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                        Cair
                      </span>
                    </td>
                    <td className="px-4 py-4"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-medium text-gray-700">
                      Termin 2 (30%)
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      Rp 7.500.000
                    </td>
                    <td className="px-4 py-4 text-gray-600">-</td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        Belum Cair
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="px-4 py-1.5 text-xs text-white bg-red-600 rounded-lg">
                        Proses
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* RAB PLACEHOLDER */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                Detail RAB belum diinput oleh peneliti.
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="mb-4">
                <p className="text-xs text-gray-400">Nama Bank</p>
                <p className="text-sm font-semibold text-gray-800">
                  Bank Syariah Indonesia (BSI)
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-400">Nomor Rekening</p>
                <p className="text-sm font-mono text-gray-800">
                  1234-5678-90
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Atas Nama</p>
                <p className="text-sm font-semibold text-gray-800">
                  Dr. Peneliti Utama
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border-t-4 border-orange-400">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <h3 className="font-semibold text-gray-800">
                  Validasi Keuangan
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Pastikan laporan penggunaan dana tahap sebelumnya sudah valid
                sebelum mencairkan tahap berikutnya.
              </p>
              <button className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg">
                Lihat Laporan Keuangan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

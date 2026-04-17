import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StaffDashboard() {
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Staff
        </h1>
        <p className="text-sm text-gray-500">
          Kelola administrasi dan verifikasi proposal.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Verifikasi */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">
              Status Verifikasi
            </CardTitle>
            <p className="text-xs text-gray-400">
              Rasio proposal yang telah diverifikasi
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {/* Fake Donut Chart */}
            <div className="w-40 h-40 rounded-full border-[14px] border-green-500 relative">
              <div className="absolute inset-0 border-[14px] border-yellow-400 rounded-full clip-path-half" />
              <div className="absolute inset-0 border-[14px] border-red-500 rounded-full clip-path-quarter" />
              <div className="absolute inset-6 bg-white rounded-full" />
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1 text-red-500">
                <span className="w-3 h-3 bg-red-500 inline-block" /> Ditolak
                Admin
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <span className="w-3 h-3 bg-yellow-400 inline-block" /> Perlu
                verifikasi
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <span className="w-3 h-3 bg-green-500 inline-block" />
                verifikasi
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">
              Beban Kerja Mingguan
            </CardTitle>
            <p className="text-xs text-gray-400">
              Jumlah tugas admin draft terselesaikan
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-3">
              {[12, 18, 14, 22, 16].map((val, i) => (
                <div key={i} className="flex flex-col items-center w-full">
                  <div
                    className="w-8 bg-red-500 rounded"
                    style={{ height: `${val * 5}px` }}
                  />
                  <span className="text-xs mt-2 text-gray-500">
                    {['Sen', 'Sel', 'Rab', 'Kam', 'Jum'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700">
              Perlu Verifikasi (1)
            </CardTitle>
            <button className="text-xs text-red-500">Lihat Semua</button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="text-gray-400 text-xs">
                <tr>
                  <th className="text-left">Judul Proposal</th>
                  <th className="text-left">Peneliti</th>
                  <th className="text-left">Tgl Masuk</th>
                  <th className="text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-3">Pemberdayaan UMKM Batik</td>
                  <td>Sari Ekonomi, M.U</td>
                  <td>2023-10-20</td>
                  <td>
                    <Button size="sm" className="bg-gray-100 text-gray-700">
                      Verifikasi
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right Side */}
        <div className="space-y-4">
          {/* Prioritas */}
          <Card className="rounded-2xl shadow-sm bg-red-50">
            <CardHeader>
              <CardTitle className="text-sm text-red-600">
                Prioritas Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>• Verifikasi 3 proposal baru</p>
              <p>• Plotting reviewer untuk batch 2</p>
              <p>• Cek laporan keuangan terakhir</p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-gray-700">
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-between bg-gray-100 text-gray-700">
                Plotting Reviewer <span>→</span>
              </Button>
              <Button className="w-full justify-between bg-gray-100 text-gray-700">
                Cek Log Keuangan <span>→</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


import Button from "@/components/ui/button";

type Props = {
  onClose: () => void;
};

export default function DisbursementForm({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-start overflow-y-auto">

      <div className="bg-gray-100 w-full max-w-6xl p-6 mt-10 rounded-xl">

        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={onClose}
            className="text-gray-500 mb-2"
          >
            ←
          </button>

          <h1 className="text-xl font-semibold text-gray-800">
            Ajukan Pencairan Dana
          </h1>

          <p className="text-sm text-gray-500">
            Form pengajuan pencairan dana hibah penelitian
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="col-span-2 space-y-4">

            <input className="w-full p-3 rounded-lg border bg-white" placeholder="Pilih Proyek" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Skema Penelitian</label>
                <input
                  className="w-full p-3 rounded-lg border bg-gray-100 mt-1"
                  value="Penelitian Dasar Unggulan Perguruan Tinggi"
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Total RAB</label>
                <input
                  className="w-full p-3 rounded-lg border bg-gray-100 mt-1"
                  value="Rp 25.000.000"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input className="p-3 rounded-lg border bg-white" placeholder="Jumlah Dana Diajukan" />
              <input className="p-3 rounded-lg border bg-white" placeholder="Termin Pencairan" />
            </div>

            <input className="w-full p-3 rounded-lg border bg-white" placeholder="Tanggal Pengajuan" />

            <textarea
              className="w-full p-3 rounded-lg border bg-white h-28"
              placeholder="Jelaskan keperluan pencairan dana ini..."
            />

            {/* Upload */}
            <div className="border-2 border-dashed rounded-xl bg-white p-8 text-center">
              <div className="text-red-500 text-2xl mb-2">⬆</div>
              <p className="text-sm text-gray-600">
                Klik untuk upload atau drag & drop
              </p>
              <p className="text-xs text-gray-400">
                PDF, Maksimal 5MB
              </p>
            </div>

            {/* BUTTON */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={onClose}
                className="bg-gray-200 text-gray-700"
              >
                Batal
              </Button>

              <Button className="bg-red-600 text-white hover:bg-red-700">
                Ajukan Pencairan
              </Button>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-4">

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-sm text-gray-500">Ringkasan Anggaran</p>

              <p className="text-xs text-gray-400 mt-2">
                Total RAB Disetujui
              </p>

              <h2 className="text-lg font-semibold">
                Rp 25.000.000
              </h2>

              <div className="mt-3">
                <p className="text-xs text-gray-400">
                  Sudah Cair (30%)
                </p>

                <div className="w-full bg-gray-200 h-2 rounded mt-1">
                  <div className="h-2 bg-green-500 rounded w-[30%]" />
                </div>

                <p className="text-green-600 text-xs mt-1">
                  Rp 7.500.000
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-400">Sisa Anggaran</p>
                <p className="text-red-600 font-semibold">
                  Rp 17.500.000
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-sm font-medium mb-2">
                Persyaratan Dokumen
              </p>

              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Laporan Kemajuan Penelitian</li>
                <li>• Rincian Penggunaan Dana (SPTBJ)</li>
                <li>• Bukti Transaksi / Nota Belanja</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
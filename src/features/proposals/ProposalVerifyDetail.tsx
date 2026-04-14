import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProposalVerifyDetail() {

  const navigate = useNavigate();

  return (
    <div className="p-8">

      {/* BACK */}

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 mb-4"
      >
        <ArrowLeft size={18} />
      </button>

      {/* TITLE */}

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Detail Verifikasi Proposal
        </h1>
        <p className="text-sm text-gray-500">
          Pemeriksaan kelengkapan administrasi proposal
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}

        <div className="col-span-2 space-y-6">

          {/* PROPOSAL INFO */}

          <div className="bg-white rounded-xl shadow-sm p-6">

            <p className="text-xs text-gray-400 mb-2">JUDUL PROPOSAL</p>

            <h2 className="font-semibold text-gray-800 mb-6">
              Pemberdayaan UMKM Batik Trusmi Melalui Digital Marketing
            </h2>

            <div className="grid grid-cols-2 gap-6 text-sm">

              <div>
                <p className="text-gray-400">Nama Peneliti</p>
                <p className="font-medium">Sari Ekonomi, M.M.</p>
              </div>

              <div>
                <p className="text-gray-400">Tahun Anggaran</p>
                <p className="font-medium">2023</p>
              </div>

              <div>
                <p className="text-gray-400">Skema</p>
                <p className="font-medium">Pengabdian Masyarakat</p>
              </div>

              <div>
                <p className="text-gray-400">Status Saat Ini</p>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                  SUBMITTED
                </span>
              </div>

            </div>

          </div>

          {/* CHECKLIST */}

          <div className="bg-white rounded-xl shadow-sm p-6">

            <h3 className="font-medium text-gray-700 mb-4">
              Checklist Kelengkapan Dokumen
            </h3>

            <div className="space-y-3">

              <label className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                <input type="checkbox" defaultChecked />
                Dokumen Proposal Lengkap
              </label>

              <label className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                <input type="checkbox" defaultChecked />
                RAB Sesuai Format
              </label>

              <label className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                <input type="checkbox" />
                Surat Pernyataan Dilampirkan
              </label>

              <label className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                <input type="checkbox" />
                Template LPPM Digunakan
              </label>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="space-y-4">

          <div className="bg-white rounded-xl shadow-sm p-4">

            <p className="text-sm font-medium mb-2">
              Catatan Administrasi
            </p>

            <textarea
              placeholder="Tuliskan catatan untuk peneliti jika ada"
              className="w-full border rounded-lg p-3 text-sm h-28"
            />

          </div>

          <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
            Verifikasi Proposal
          </button>

          <button className="w-full border border-red-500 text-red-600 py-2 rounded-lg">
            Tolak / Revisi
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full text-gray-500 text-sm"
          >
            Kembali
          </button>

        </div>

      </div>

    </div>
  );
}
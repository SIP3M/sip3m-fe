import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddUserPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center space-y-6">

      {/* HEADER */}
      <div className="flex items-start gap-3 w-full max-w-3xl">
        <button
          onClick={() => navigate("/users")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Tambah Pengguna
          </h1>
          <p className="text-sm text-gray-500">
            Tambahkan akun pengguna baru ke sistem LPPM
          </p>
        </div>
      </div>

      {/* CARD FORM */}
      <div className="bg-white w-full max-w-3xl p-10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)]">

        <div className="space-y-6">

          {/* NAMA */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>

            <input
              type="text"
              placeholder="Contoh: Dr. Ahmad Dahlan, M.Kom"
              className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              placeholder="nama@umc.ac.id"
              className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* NIDN */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              NIDN / NIP <span className="text-gray-400">(Opsional)</span>
            </label>

            <input
              type="text"
              placeholder="Nomor Induk Dosen / Pegawai"
              className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Role
            </label>

            <select className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Pilih Role</option>
              <option value="admin">Admin LPPM</option>
              <option value="dosen">Dosen</option>
              <option value="reviewer">Reviewer</option>
            </select>

            <p className="text-xs text-gray-400 mt-1">
              Hak akses akan disesuaikan dengan peran yang dipilih.
            </p>
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Status Akun
            </label>

            <div className="flex gap-6 mt-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="status" defaultChecked />
                Active
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="status" />
                Non-Active
              </label>
            </div>
          </div>

          {/* PASSWORD */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>

              <input
                type="password"
                className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-3 pt-4">

            <button
              onClick={() => navigate("/users")}
              className="px-5 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            >
              Batal
            </button>

            <button className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-red-700 transition">
              <Save size={16} />
              Simpan Pengguna
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
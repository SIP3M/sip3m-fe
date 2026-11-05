import { ArrowRight, Eye, Shield } from "lucide-react";

// =====================================================================
// DATA STATIS — halaman ini belum terhubung ke API (sebelumnya masih
// placeholder "Segera hadir"). Jumlah pengguna & izin di bawah hanya
// contoh dari desain. Ganti dengan data dari endpoint role & permission
// begitu tersedia.
// =====================================================================
interface RoleCard {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissionCount: number;
  badgeClass: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    id: "ketua-lppm",
    name: "Ketua LPPM",
    description:
      "Pimpinan LPPM dengan akses manajerial penuh terhadap Penelitian dan KKM.",
    userCount: 1,
    permissionCount: 42,
    badgeClass: "bg-red-100 text-red-700",
  },
  {
    id: "admin-sistem",
    name: "Admin Sistem",
    description:
      "Administrator teknis sistem: pengguna, konfigurasi, master data, integrasi.",
    userCount: 1,
    permissionCount: 38,
    badgeClass: "bg-gray-100 text-gray-700",
  },
  {
    id: "staff-lppm",
    name: "Staff LPPM",
    description:
      "Staf operasional LPPM untuk verifikasi proposal dan administrasi harian.",
    userCount: 8,
    permissionCount: 28,
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    id: "dosen-peneliti",
    name: "Dosen/Peneliti",
    description:
      "Dosen yang mengajukan proposal penelitian dan melaksanakan proyek.",
    userCount: 186,
    permissionCount: 18,
    badgeClass: "bg-purple-50 text-purple-700",
  },
  {
    id: "reviewer",
    name: "Reviewer",
    description:
      "Penilai eksternal yang mengevaluasi proposal penelitian yang diajukan.",
    userCount: 42,
    permissionCount: 12,
    badgeClass: "bg-amber-50 text-amber-700",
  },
  {
    id: "dpl",
    name: "DPL",
    description:
      "Dosen Pembimbing Lapangan yang membimbing kelompok KKM mahasiswa.",
    userCount: 28,
    permissionCount: 14,
    badgeClass: "bg-teal-50 text-teal-700",
  },
  {
    id: "mahasiswa",
    name: "Mahasiswa",
    description:
      "Mahasiswa peserta KKM yang mendaftar, membuat logbook, dan laporan.",
    userCount: 2148,
    permissionCount: 8,
    badgeClass: "bg-green-50 text-green-700",
  },
];
// =====================================================================

/**
 * Master Data — Role & Permission.
 * Tampilan daftar role. Data masih statis, belum terhubung ke backend.
 */
export default function RolePermission() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role & Permission</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola role dan izin akses pengguna dalam sistem LPPM
          </p>
        </div>

        {/* TODO: sambungkan ke halaman/modal matriks izin begitu tersedia */}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-xl shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Eye size={16} />
          Matriks Penuh
        </button>
      </div>

      {/* DAFTAR ROLE */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ROLE_CARDS.map((role) => (
          <div
            key={role.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                <Shield size={18} />
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${role.badgeClass}`}
              >
                {role.name}
              </span>
            </div>

            <p className="mt-4 min-h-[40px] text-sm leading-relaxed text-gray-500">
              {role.description}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  <span className="font-bold text-gray-900">
                    {role.userCount.toLocaleString("id-ID")}
                  </span>{" "}
                  pengguna
                </span>
                <span>
                  <span className="font-bold text-gray-900">
                    {role.permissionCount}
                  </span>{" "}
                  izin
                </span>
              </div>

              {/* TODO: sambungkan ke halaman detail role begitu tersedia */}
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Detail
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
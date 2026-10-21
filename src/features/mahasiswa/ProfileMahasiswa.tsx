import { Bell, Check, Pencil } from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";

// =====================================================================
// DATA STATIS — sebagian data diambil dari sesi login (nama, email,
// fakultas, program studi). Sisanya belum ada di endpoint /auth/me.
// =====================================================================

const DATA_KKM = {
  periode: "KKM Reguler 2026",
  kelompok: "Kelompok 07",
  dpl: "Dr. Ahmad Fauzi, M.Kom",
  desa: "Astanajapura, Cirebon",
  statusVerifikasi: "Verified",
  statusKelompok: "Sudah Ditempatkan",
};

/** Field yang belum tersedia di API */
const DATA_TAMBAHAN = {
  nim: "210411001",
  semester: "7",
  alamat: "Jl. Pemuda No. 12, Cirebon",
  jumlahNotifikasi: 2,
};

/** Inisial untuk avatar */
const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export default function ProfileMahasiswa() {
  const user = useAuthStore((state) => state.user);

  const nama = user?.name ?? "Andi Pratama";
  const email = user?.email ?? "andi.pratama@student.umc.ac.id";
  const fakultas = user?.fakultas ?? "Fakultas Teknik";
  const programStudi = user?.program_studi ?? "Teknik Informatika";
  const nomorHp = user?.nomor_hp ?? "0812-3456-7890";

  const identitas = [
    { label: "Nama Lengkap", value: nama },
    { label: "NIM", value: DATA_TAMBAHAN.nim },
    { label: "Program Studi", value: programStudi },
    { label: "Fakultas", value: fakultas },
    { label: "Semester", value: DATA_TAMBAHAN.semester },
    { label: "Email UMC", value: email },
    { label: "Nomor HP", value: nomorHp },
    { label: "Alamat", value: DATA_TAMBAHAN.alamat },
  ];

  const informasiKkm = [
    { label: "Periode KKM", value: DATA_KKM.periode },
    { label: "Kelompok", value: DATA_KKM.kelompok },
    { label: "DPL", value: DATA_KKM.dpl },
    { label: "Desa", value: DATA_KKM.desa },
    { label: "Status Verifikasi", value: DATA_KKM.statusVerifikasi, check: true },
    { label: "Status Kelompok", value: DATA_KKM.statusKelompok },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola informasi akun dan notifikasi KKM
          </p>
        </div>

        {/* NOTIFIKASI */}
        <button
          type="button"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 cursor-pointer"
          aria-label={`${DATA_TAMBAHAN.jumlahNotifikasi} notifikasi baru`}
          title="Notifikasi"
        >
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {DATA_TAMBAHAN.jumlahNotifikasi}
          </span>
        </button>
      </div>

      {/* KARTU PROFIL */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* HEADER MERAH */}
        <div className="h-28 bg-gradient-to-br from-red-600 to-red-700" />

        {/* AVATAR + TOMBOL EDIT */}
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mt-12 flex items-end gap-4">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold text-red-600 shadow-md ring-4 ring-white">
              {getInitials(nama)}
            </span>
          </div>

          {/* TODO: arahkan ke form edit profil begitu tersedia */}
          <button
            type="button"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer sm:self-auto"
          >
            <Pencil size={15} />
            Edit Profil
          </button>
        </div>

        {/* INFORMASI IDENTITAS */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 px-6 pb-7 sm:grid-cols-2">
          {identitas.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INFORMASI KKM */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Informasi KKM</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {informasiKkm.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-gray-50 px-4 py-3.5"
            >
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                {item.value}
                {item.check && (
                  <Check size={15} className="text-green-600" />
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

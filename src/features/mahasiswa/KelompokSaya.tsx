import {
  GraduationCap,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

// =====================================================================
// DATA STATIS — belum terhubung ke API.
// Ganti dengan data dari endpoint kelompok mahasiswa ketika tersedia.
// =====================================================================

interface Anggota {
  initials: string;
  nama: string;
  prodi: string;
  /** Peran dalam kelompok (kosong = Anggota biasa) */
  peran?: "Ketua" | "Sekretaris" | "Bendahara";
  /** Tandai sebagai mahasiswa yang sedang login */
  saya?: boolean;
  /** Warna avatar */
  avatar: string;
}

const ANGGOTA: Anggota[] = [
  {
    initials: "AP",
    nama: "Andi Pratama",
    prodi: "Teknik Informatika",
    peran: "Ketua",
    saya: true,
    avatar: "bg-blue-100 text-blue-600",
  },
  {
    initials: "FH",
    nama: "Fitri Handayani",
    prodi: "Pendidikan Agama Islam",
    peran: "Sekretaris",
    avatar: "bg-pink-100 text-pink-600",
  },
  {
    initials: "BS",
    nama: "Budi Santoso",
    prodi: "Farmasi",
    peran: "Bendahara",
    avatar: "bg-blue-100 text-blue-600",
  },
  {
    initials: "DA",
    nama: "Dewi Anggraini",
    prodi: "Hukum",
    avatar: "bg-pink-100 text-pink-600",
  },
  {
    initials: "HK",
    nama: "Hendra Kusuma",
    prodi: "Manajemen",
    avatar: "bg-blue-100 text-blue-600",
  },
  {
    initials: "IP",
    nama: "Indah Permata",
    prodi: "Akuntansi",
    avatar: "bg-pink-100 text-pink-600",
  },
  {
    initials: "JP",
    nama: "Joko Prabowo",
    prodi: "PGSD",
    avatar: "bg-blue-100 text-blue-600",
  },
  {
    initials: "KD",
    nama: "Karina Dewi",
    prodi: "Sistem Informasi",
    avatar: "bg-pink-100 text-pink-600",
  },
  {
    initials: "LH",
    nama: "Lukman Hakim",
    prodi: "Kelistrikan",
    avatar: "bg-blue-100 text-blue-600",
  },
  {
    initials: "MS",
    nama: "Maya Sari",
    prodi: "Manajemen",
    avatar: "bg-pink-100 text-pink-600",
  },
];

interface ProgramKerja {
  nama: string;
  status: "Berjalan" | "Selesai";
  progress: number;
}

const PROGRAM_KERJA: ProgramKerja[] = [
  { nama: "Edukasi Digital UMKM", status: "Berjalan", progress: 60 },
  { nama: "Penyuluhan Kesehatan Masyarakat", status: "Selesai", progress: 100 },
  { nama: "Pelatihan Administrasi Desa", status: "Berjalan", progress: 40 },
];

const BADGE_PERAN: Record<string, string> = {
  Ketua: "bg-red-500 text-white",
  Sekretaris: "bg-blue-100 text-blue-700",
  Bendahara: "bg-blue-100 text-blue-700",
};

const BADGE_STATUS: Record<ProgramKerja["status"], string> = {
  Berjalan: "bg-blue-100 text-blue-700",
  Selesai: "bg-green-100 text-green-700",
};

export default function KelompokSaya() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelompok Saya</h1>
        <p className="text-sm text-gray-500 mt-1">
          Informasi kelompok KKM Anda
        </p>
      </div>

      {/* HERO KELOMPOK */}
      <section className="mb-6 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* NAMA KELOMPOK */}
          <div>
            <h2 className="text-2xl font-bold text-white">Kelompok 07</h2>
            <p className="text-sm text-white/80 mt-1">KKM Reguler 2026</p>

            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Aktif
            </span>
          </div>

          {/* INFO RINGKAS */}
          <div className="space-y-2.5 md:text-right">
            <p className="flex items-center gap-2 text-sm text-white/90 md:justify-end">
              <GraduationCap size={16} className="shrink-0" />
              Dr. Ahmad Fauzi, M.Kom
            </p>
            <p className="flex items-center gap-2 text-sm text-white/90 md:justify-end">
              <MapPin size={16} className="shrink-0" />
              Desa Astanajapura
            </p>
            <p className="flex items-center gap-2 text-sm text-white/90 md:justify-end">
              <Users size={16} className="shrink-0" />
              10 Mahasiswa
            </p>
          </div>
        </div>
      </section>

      {/* DPL PEMBIMBING */}
      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
            <GraduationCap size={22} />
          </span>

          <div>
            <p className="text-xs text-gray-500">
              Dosen Pembimbing Lapangan (DPL)
            </p>
            <p className="mt-0.5 font-bold text-gray-900">
              Dr. Ahmad Fauzi, M.Kom
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Teknik Informatika — Fakultas Teknik
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 cursor-pointer sm:self-auto"
        >
          <Phone size={15} />
          Hubungi
        </button>
      </section>

      {/* DAFTAR ANGGOTA + PROGRAM KERJA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DAFTAR ANGGOTA */}
        <section className="lg:col-span-5 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">
              Daftar Anggota
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {ANGGOTA.map((anggota) => (
              <div
                key={anggota.nama}
                className={`flex items-center gap-3 px-5 py-3.5 ${
                  anggota.saya ? "bg-red-50/60" : ""
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${anggota.avatar}`}
                >
                  {anggota.initials}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-800">
                    {anggota.nama}
                    {anggota.saya && (
                      <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        Saya
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-gray-400 mt-0.5">
                    {anggota.prodi}
                  </p>
                </div>

                {anggota.peran ? (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${BADGE_PERAN[anggota.peran]}`}
                  >
                    {anggota.peran}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                    Anggota
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* PROGRAM KERJA */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900">Program Kerja</h3>

            <div className="mt-5 space-y-5">
              {PROGRAM_KERJA.map((program) => {
                const selesai = program.status === "Selesai";

                return (
                  <div key={program.nama}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-800">
                        {program.nama}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${BADGE_STATUS[program.status]}`}
                      >
                        {program.status}
                      </span>
                    </div>

                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          selesai ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{ width: `${program.progress}%` }}
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-gray-400">
                      {program.progress}% selesai
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* RINGKASAN */}
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-2xl bg-green-50 p-5 text-center">
              <p className="text-3xl font-bold text-green-600">4</p>
              <p className="mt-1 text-xs text-gray-500">Logbook Minggu Ini</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">2</p>
              <p className="mt-1 text-xs text-gray-500">Laporan Disetujui</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

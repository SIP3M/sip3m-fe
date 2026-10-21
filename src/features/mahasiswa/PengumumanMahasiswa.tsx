import { useMemo, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";

// =====================================================================
// DATA STATIS — belum terhubung ke API.
// Ganti dengan data dari endpoint pengumuman KKM ketika tersedia.
// =====================================================================

type Kategori =
  | "Pembekalan"
  | "Penempatan"
  | "Deadline"
  | "Revisi"
  | "Jadwal";

interface PengumumanItem {
  id: number;
  judul: string;
  kategori: Kategori;
  tanggal: string;
  pengirim: string;
  isi: string;
  /** Belum dibaca → ada titik merah di kanan */
  belumDibaca: boolean;
}

const PENGUMUMAN: PengumumanItem[] = [
  {
    id: 1,
    judul: "Jadwal Pembekalan KKM Reguler 2026",
    kategori: "Pembekalan",
    tanggal: "20 Jan 2026",
    pengirim: "Admin LPPM",
    isi: "Pembekalan akan dilaksanakan pada tanggal 25 Januari 2026 pukul 08.00 WIB di Aula Kampus 1 UMC. Seluruh peserta KKM wajib hadir denganSeragam lengkap dan membawa berkas administrasi.",
    belumDibaca: true,
  },
  {
    id: 2,
    judul: "Informasi Lokasi Desa Penempatan KKM",
    kategori: "Penempatan",
    tanggal: "25 Jan 2026",
    pengirim: "Staff LPPM",
    isi: "Penempatan kelompok KKM telah ditentukan. Silakan cek menu Kelompok Saya untuk melihat desa dan DPL yang ditugaskan untuk kelompok Anda.",
    belumDibaca: false,
  },
  {
    id: 3,
    judul: "Deadline Upload Laporan Awal KKM",
    kategori: "Deadline",
    tanggal: "01 Feb 2026",
    pengirim: "Admin LPPM",
    isi: "Laporan Awal KKM wajib diupload paling lambat tanggal 10 Februari 2026. Keterlambatan akan mempengaruhi penilaian laporan Anda.",
    belumDibaca: true,
  },
  {
    id: 4,
    judul: "Revisi Format Logbook Kegiatan",
    kategori: "Revisi",
    tanggal: "03 Feb 2026",
    pengirim: "Staff LPPM",
    isi: "Terdapat perubahan format logbook kegiatan. Harap unduh template terbaru melalui portal mahasiswa dan gunakan untuk pengisian logbook kedep.",
    belumDibaca: false,
  },
  {
    id: 5,
    judul: "Jadwal Monitoring DPL Minggu Pertama",
    kategori: "Jadwal",
    tanggal: "05 Feb 2026",
    pengirim: "Admin LPPM",
    isi: "DPL akan melakukan monitoring lapangan pada minggu pertama pelaksanaan KKM. Pastikan seluruh anggota kelompok hadir dan program kerja berjalan sesuai rencana.",
    belumDibaca: true,
  },
];

/** Warna badge kategori */
const KATEGORI_STYLE: Record<Kategori, string> = {
  Pembekalan: "bg-purple-100 text-purple-700",
  Penempatan: "bg-blue-100 text-blue-700",
  Deadline: "bg-red-100 text-red-700",
  Revisi: "bg-orange-100 text-orange-700",
  Jadwal: "bg-amber-100 text-amber-700",
};

const TABS: ("Semua" | Kategori)[] = [
  "Semua",
  "Pembekalan",
  "Penempatan",
  "Deadline",
  "Revisi",
  "Jadwal",
];

export default function PengumumanMahasiswa() {
  const [activeTab, setActiveTab] = useState<"Semua" | Kategori>("Semua");

  const belumDibaca = useMemo(
    () => PENGUMUMAN.filter((item) => item.belumDibaca).length,
    [],
  );

  const daftar = useMemo(
    () =>
      activeTab === "Semua"
        ? PENGUMUMAN
        : PENGUMUMAN.filter((item) => item.kategori === activeTab),
    [activeTab],
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
          <p className="text-sm text-gray-500 mt-1">
            Informasi dan pengumuman resmi dari LPPM UMC
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600">
          <Bell size={14} />
          {belumDibaca} belum dibaca
        </span>
      </div>

      {/* FILTER TABS */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const active = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* DAFTAR PENGUMUMAN */}
      <div className="space-y-3">
        {daftar.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-gray-500">
              Belum ada pengumuman pada kategori ini
            </p>
          </div>
        )}

        {daftar.map((item) => (
          <article
            key={item.id}
            className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-red-200 hover:shadow-md"
          >
            {/* IKON */}
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                item.belumDibaca
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Bell size={18} />
            </span>

            {/* ISI */}
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-gray-900">
                {item.judul}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${KATEGORI_STYLE[item.kategori]}`}
                >
                  {item.kategori}
                </span>
                <span>{item.tanggal}</span>
                <span>—</span>
                <span>{item.pengirim}</span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {item.isi}
              </p>
            </div>

            {/* TANDAS BELUM DIBACA + PANAH */}
            <div className="flex shrink-0 items-center gap-3 pt-1">
              {item.belumDibaca && (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              )}
              <ChevronRight
                size={18}
                className="text-gray-300 transition-colors group-hover:text-red-400"
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

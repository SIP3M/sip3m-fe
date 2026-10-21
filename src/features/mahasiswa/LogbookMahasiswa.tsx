import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  RotateCcw,
} from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import TambahLogbookModal, {
  type LogbookBaru,
} from "@/features/mahasiswa/components/TambahLogbookModal";

// Parsing tanggal format "01 Feb 2026"
dayjs.extend(customParseFormat);

// =====================================================================
// DATA STATIS — belum terhubung ke API.
// Ganti dengan data dari endpoint logbook mahasiswa ketika tersedia.
// =====================================================================

type StatusLogbook = "Approved" | "Pending" | "Revisi";

interface Logbook {
  id: number;
  tanggal: string;
  aktivitas: string;
  deskripsi: string;
  durasi: string;
  status: StatusLogbook;
}

const LOGBOOK: Logbook[] = [
  {
    id: 1,
    tanggal: "01 Feb 2026",
    aktivitas: "Survey Lokasi UMKM",
    deskripsi:
      "Melakukan survey awal ke 5 UMKM di Desa Astanajapura untuk pemetaan kebutuhan digital",
    durasi: "4 jam",
    status: "Approved",
  },
  {
    id: 2,
    tanggal: "03 Feb 2026",
    aktivitas: "Pelatihan Desain Poster",
    deskripsi:
      "Mengajarkan pembuatan desain poster promosi menggunakan Canva kepada 10 pelaku UMKM",
    durasi: "3 jam",
    status: "Approved",
  },
  {
    id: 3,
    tanggal: "05 Feb 2026",
    aktivitas: "Penyuluhan Gizi Anak",
    deskripsi:
      "Bekerja sama dengan Puskesmas setempat untuk penyuluhan gizi anak di Posyandu.",
    durasi: "5 jam",
    status: "Pending",
  },
  {
    id: 4,
    tanggal: "07 Feb 2026",
    aktivitas: "Pembuatan Media Sosial UMKM",
    deskripsi:
      "Membantu pelaku UMKM membuat akun Instagram dan WhatsApp Business.",
    durasi: "3 jam",
    status: "Revisi",
  },
];

const STATUS_CONFIG: Record<
  StatusLogbook,
  { badge: string; icon: typeof CheckCircle2 }
> = {
  Approved: {
    badge: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  Pending: {
    badge: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  Revisi: {
    badge: "bg-red-100 text-red-600",
    icon: RotateCcw,
  },
};

export default function LogbookMahasiswa() {
  const [logbook, setLogbook] = useState<Logbook[]>(LOGBOOK);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const total = logbook.length;
  const approved = logbook.filter((row) => row.status === "Approved").length;
  const pending = logbook.filter((row) => row.status === "Pending").length;
  const revisi = logbook.filter((row) => row.status === "Revisi").length;

  // Logbook baru selalu berstatus "Pending" sampai divalidasi DPL
  const handleTambahLogbook = (data: LogbookBaru) => {
    const nextId = logbook.reduce((max, row) => Math.max(max, row.id), 0) + 1;

    // Tanggal input "01 Feb 2026" → format yang sama dipakai tabel
    const parsed = dayjs(data.tanggal, "DD MMM YYYY");

    setLogbook((prev) => [
      {
        id: nextId,
        tanggal: parsed.isValid()
          ? parsed.format("DD MMM YYYY")
          : data.tanggal,
        aktivitas: data.aktivitas,
        deskripsi: data.deskripsi,
        durasi: data.durasi,
        status: "Pending",
      },
      ...prev,
    ]);
  };

  const statistik = [
    {
      nilai: total,
      label: "Total Logbook",
      card: "bg-white border border-gray-100",
      angka: "text-gray-900",
    },
    {
      nilai: approved,
      label: "Approved",
      card: "bg-green-50 border border-green-100",
      angka: "text-green-600",
    },
    {
      nilai: pending,
      label: "Pending",
      card: "bg-amber-50 border border-amber-100",
      angka: "text-amber-600",
    },
    {
      nilai: revisi,
      label: "Perlu Revisi",
      card: "bg-red-50 border border-red-100",
      angka: "text-red-600",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logbook Kegiatan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Catat setiap kegiatan KKM Anda secara rutin
          </p>
        </div>

        {/* TODO: hubungkan ke form tambah logbook begitu tersedia */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(220,38,38,0.25)] transition-colors hover:bg-red-700 cursor-pointer"
        >
          <Plus size={16} />
          Tambah Logbook
        </button>
      </div>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statistik.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl p-5 text-center shadow-sm ${item.card}`}
          >
            <p className={`text-3xl font-bold ${item.angka}`}>{item.nilai}</p>
            <p className="mt-1 text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* TABEL LOGBOOK */}
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/40 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-4 px-6 font-semibold">Tanggal</th>
                <th className="py-4 px-6 font-semibold">Aktivitas</th>
                <th className="py-4 px-6 font-semibold">Durasi</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 text-center font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-sm">
              {logbook.map((row) => {
                const config = STATUS_CONFIG[row.status];
                const StatusIcon = config.icon;

                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50/60"
                  >
                    <td className="py-5 px-6 whitespace-nowrap text-gray-600">
                      {row.tanggal}
                    </td>

                    <td className="py-5 px-6">
                      <p className="font-bold text-gray-900">{row.aktivitas}</p>
                      <p className="mt-0.5 max-w-xl truncate text-xs text-gray-400">
                        {row.deskripsi}
                      </p>
                    </td>

                    <td className="py-5 px-6 whitespace-nowrap text-gray-600">
                      {row.durasi}
                    </td>

                    <td className="py-5 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
                      >
                        <StatusIcon size={13} className="shrink-0" />
                        {row.status}
                      </span>
                    </td>

                    <td className="py-5 px-6 text-center whitespace-nowrap">
                      {/* TODO: arahkan ke detail logbook begitu route tersedia */}
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL TAMBAH LOGBOOK */}
      <TambahLogbookModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleTambahLogbook}
      />
    </div>
  );
}

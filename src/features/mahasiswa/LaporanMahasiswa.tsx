import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  RotateCcw,
  Upload,
} from "lucide-react";
import dayjs from "dayjs";
import UploadLaporanModal from "@/features/mahasiswa/components/UploadLaporanModal";

// =====================================================================
// DATA STATIS — belum terhubung ke API.
// Ganti dengan data dari endpoint laporan mahasiswa ketika tersedia.
// =====================================================================

type StatusLaporan = "Disetujui" | "Menunggu Review" | "Revisi" | "Belum Upload";

type AksiLaporan = "lihat" | "upload" | "upload-ulang";

interface Laporan {
  id: number;
  jenis: string;
  tanggalUpload: string | null;
  status: StatusLaporan;
  catatan: string | null;
  aksi: AksiLaporan;
}

const LAPORAN: Laporan[] = [
  {
    id: 1,
    jenis: "Laporan Awal",
    tanggalUpload: "05 Feb 2026",
    status: "Disetujui",
    catatan: "Laporan lengkap dan sesuai format.",
    aksi: "lihat",
  },
  {
    id: 2,
    jenis: "Laporan Mingguan Ke-1",
    tanggalUpload: "12 Feb 2026",
    status: "Menunggu Review",
    catatan: null,
    aksi: "lihat",
  },
  {
    id: 3,
    jenis: "Laporan Mingguan Ke-2",
    tanggalUpload: null,
    status: "Revisi",
    catatan: "Dokumentasi kegiatan masih kurang lengkap, mohon dilengkapi.",
    aksi: "upload-ulang",
  },
  {
    id: 4,
    jenis: "Laporan Tengah",
    tanggalUpload: null,
    status: "Belum Upload",
    catatan: null,
    aksi: "upload",
  },
  {
    id: 5,
    jenis: "Laporan Akhir",
    tanggalUpload: null,
    status: "Belum Upload",
    catatan: null,
    aksi: "upload",
  },
  {
    id: 6,
    jenis: "Dokumentasi Kegiatan",
    tanggalUpload: null,
    status: "Belum Upload",
    catatan: null,
    aksi: "upload",
  },
];

const STATUS_CONFIG: Record<
  StatusLaporan,
  { badge: string; icon: typeof CheckCircle2 }
> = {
  Disetujui: {
    badge: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  "Menunggu Review": {
    badge: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  Revisi: {
    badge: "bg-red-100 text-red-600",
    icon: RotateCcw,
  },
  "Belum Upload": {
    badge: "bg-gray-100 text-gray-500",
    icon: Clock,
  },
};

export default function LaporanMahasiswa() {
  const [laporan, setLaporan] = useState<Laporan[]>(LAPORAN);

  // Laporan yang sedang di-upload (null = popup tertutup)
  const [uploadTarget, setUploadTarget] = useState<Laporan | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const disetujui = laporan.filter((row) => row.status === "Disetujui").length;
  const menunggu = laporan.filter(
    (row) => row.status === "Menunggu Review",
  ).length;
  const perluRevisi = laporan.filter((row) => row.status === "Revisi").length;
  const belumUpload = laporan.filter(
    (row) => row.status === "Belum Upload",
  ).length;

  /** File dipilih & tombol "Upload Sekarang" diklik */
  const handleUpload = () => {
    if (!uploadTarget) return;

    setIsUploading(true);

    // TODO: kirim file ke API upload laporan (belum ada endpoint)
    setLaporan((prev) =>
      prev.map((row) =>
        row.id === uploadTarget.id
          ? {
              ...row,
              status: "Menunggu Review",
              tanggalUpload: dayjs().format("DD MMM YYYY"),
              catatan: null,
            }
          : row,
      ),
    );

    setUploadTarget(null);
    setIsUploading(false);
  };

  const statistik = [
    {
      nilai: disetujui,
      label: "Disetujui",
      card: "bg-green-50 border border-green-100",
      angka: "text-green-600",
    },
    {
      nilai: menunggu,
      label: "Menunggu Review",
      card: "bg-amber-50 border border-amber-100",
      angka: "text-amber-600",
    },
    {
      nilai: perluRevisi,
      label: "Perlu Revisi",
      card: "bg-red-50 border border-red-100",
      angka: "text-red-600",
    },
    {
      nilai: belumUpload,
      label: "Belum Upload",
      card: "bg-white border border-gray-100",
      angka: "text-gray-900",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan KKM</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload dan pantau status laporan KKM Anda
        </p>
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

      {/* PERINGATAN LAPORAN PERLU REVISI */}
      {perluRevisi > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <RotateCcw size={18} className="mt-0.5 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-bold text-red-600">
              Ada laporan yang memerlukan revisi
            </p>
            <p className="mt-0.5 text-xs text-red-500">
              Periksa catatan revisi dan upload ulang laporan yang diperlukan.
            </p>
          </div>
        </div>
      )}

      {/* TABEL LAPORAN */}
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/40 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-4 px-6 font-semibold">Jenis Laporan</th>
                <th className="py-4 px-6 font-semibold">Tanggal Upload</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Catatan</th>
                <th className="py-4 px-6 text-center font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-sm">
              {laporan.map((row) => {
                const config = STATUS_CONFIG[row.status];
                const StatusIcon = config.icon;

                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50/60"
                  >
                    {/* JENIS LAPORAN */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                          <FileText size={16} />
                        </span>
                        <span className="font-semibold text-gray-900">
                          {row.jenis}
                        </span>
                      </div>
                    </td>

                    {/* TANGGAL UPLOAD */}
                    <td className="py-5 px-6 whitespace-nowrap text-gray-600">
                      {row.tanggalUpload ?? "-"}
                    </td>

                    {/* STATUS */}
                    <td className="py-5 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
                      >
                        <StatusIcon size={13} className="shrink-0" />
                        {row.status}
                      </span>
                    </td>

                    {/* CATATAN */}
                    <td className="py-5 px-6">
                      {row.catatan ? (
                        <p className="max-w-xs text-xs leading-relaxed text-gray-500">
                          {row.catatan}
                        </p>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* AKSI */}
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {row.aksi === "lihat" && (
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye size={17} />
                          </button>
                        )}

                        {row.aksi === "upload-ulang" && (
                          <>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                              title="Lihat Detail"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setUploadTarget(row)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer"
                            >
                              <Upload size={13} />
                              Upload Ulang
                            </button>
                          </>
                        )}

                        {row.aksi === "upload" && (
                          <button
                            type="button"
                            onClick={() => setUploadTarget(row)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 cursor-pointer"
                          >
                            <Upload size={13} />
                            Upload
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL UPLOAD LAPORAN */}
      <UploadLaporanModal
        open={Boolean(uploadTarget)}
        onOpenChange={(open) => {
          if (!open) setUploadTarget(null);
        }}
        title={
          uploadTarget?.aksi === "upload-ulang"
            ? "Upload Ulang Laporan"
            : "Upload Laporan"
        }
        jenisLaporan={uploadTarget?.jenis ?? ""}
        catatanRevisi={
          uploadTarget?.aksi === "upload-ulang" ? uploadTarget.catatan : null
        }
        isLoading={isUploading}
        onSubmit={handleUpload}
      />
    </div>
  );
}

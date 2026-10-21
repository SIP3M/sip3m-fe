import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

/**
 * Halaman kosong sementara untuk menu mahasiswa.
 * Ganti isi halaman ini dengan fitur yang sebenarnya (± route di router.tsx).
 */
export default function MahasiswaBlankPage({ title, description }: Props) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {description ?? "Halaman sedang dalam tahap pengerjaan."}
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 flex flex-col items-center text-center gap-3">
        <Construction size={28} className="text-gray-300" />
        <p className="text-sm font-medium text-gray-600">
          {title} belum tersedia
        </p>
        <p className="text-xs text-gray-400">
          Halaman ini sedang disiapkan. Silakan kembali nanti.
        </p>
      </div>
    </div>
  );
}

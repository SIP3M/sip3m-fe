import { Construction, ShieldCheck } from "lucide-react";

/**
 * Master Data — Role & Permission (placeholder).
 * Halaman pengaturan role & permission dijadwalkan pada Fase 2.
 */
export default function RolePermission() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Role & Permission</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pengaturan role dan hak akses pengguna sistem SIP3M
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6">
          <div className="p-4 rounded-2xl bg-red-50 text-red-600">
            <ShieldCheck size={30} />
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Construction size={16} />
            <p className="text-sm font-medium">Segera hadir</p>
          </div>
          <p className="text-sm text-gray-400 max-w-md">
            Halaman Role &amp; Permission sedang disiapkan dan akan tersedia pada fase
            berikutnya. Sementara itu, kelola role pengguna melalui halaman{" "}
            <span className="font-medium text-gray-600">Pengguna</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

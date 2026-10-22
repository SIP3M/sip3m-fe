import { Navigate, Outlet } from "react-router-dom";
import { useKkmMahasiswaAccessStore } from "@/features/kkm/kkmMahasiswaAccess.store";

/**
 * Guard untuk modul-modul KKM yang membutuhkan akses terverifikasi dari Admin LPPM
 * (Kelompok Saya, Logbook, Laporan, Nilai).
 * Mahasiswa yang belum mendapatkan verifikasi akan diarahkan ke Dashboard KKM
 * untuk melihat status verifikasi berkas.
 */
export default function MahasiswaKkmRouteGuard() {
  const hasAccess = useKkmMahasiswaAccessStore((state) => state.hasAccess);

  if (!hasAccess) {
    return <Navigate to="/mahasiswa-dashboard" replace />;
  }

  return <Outlet />;
}

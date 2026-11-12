import { LaporanKKMPage } from "./LaporanKKM";

// =====================================================================
// Halaman Laporan KKM untuk DPL — identik dengan halaman admin.
// Scope kelompok bimbingan dipaksa server-side (role DOSEN), jadi hanya
// laporan kelompok bimbingannya sendiri yang tampil.
// =====================================================================

export default function LaporanKKMDosen() {
  return <LaporanKKMPage variant="dosen" />;
}

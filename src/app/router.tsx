import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import RegisterDosenPage from "@/features/auth/RegisterDosenPage";
import RegisterReviewerPage from "@/features/auth/RegisterReviewerPage";
import OAuthCallback from "@/features/auth/OauthCallback";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import DplRouteGuard from "@/components/common/DplRouteGuard";
import { APP_ROLES } from "@/constant/roles";
import { PERMISSIONS } from "@/constant/permissions";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StaffLayout from "@/components/layout/StaffLayout";
import DosenLayout from "@/components/layout/DosenLayout";
import ReviewerLayout from "@/components/layout/ReviewerLayout";
import EksternalLayout from "@/components/layout/EksternalLayout";
import MahasiswaLayout from "@/components/layout/MahasiswaLayout";

import AdminDashboard from "@/features/dashboard/AdminDashboard";
import DashboardAdminKKM from "@/features/dashboard/DashboardAdminKKM";
import StaffDashboard from "@/features/dashboard/StaffDashboard";
import DosenDashboard from "@/features/dashboard/DosenDashboard";
import ReviewerDashboard from "@/features/dashboard/ReviewerDashboard";
import ReviewerEksternalDashboard from "@/features/dashboard/ReviewerEksternalDashboard";
import UsersPage from "@/features/users/UsersPage";
import AddUserPage from "@/features/users/AddUserPage";
import UserDetailPage from "@/features/users/UserDetailPage";
import EditUserPage from "@/features/users/EditUserPage";
import ProposalList from "@/features/proposals/ProposalList";
import ProposalDetail from "@/features/proposals/ProposalDetail";
import ReviewList from "@/features/reviews/ReviewList";
import ProjectList from "@/features/projects/ProjectList";
import ProjectDetail from "@/features/projects/ProjectDetail";
import LandingPage from "@/features/dashboard/LandingPage";
import ProposalStaff from "@/features/proposals/ProposalStaff";
import ProposalVerifyDetail from "@/features/proposals/ProposalVerifyDetail";
import ReviewListStaff from "@/features/reviews/ReviewListStaff";
import AuditLogPage from "@/features/logs/AuditLogPage";

import ProposalDosen from "@/features/proposals/ProposalDosen";
import ProjectDosen from "@/features/projects/ProjectDosen";
import Laporan from "@/features/laporan/Laporan";
import PublicationList from "@/features/repository/PublicationList";
import Profile from "@/features/profile/Profile";

import ReviewDetailPage from "@/features/dashboard/ReviewDetailPage";
import ReviewListReviewer from "@/features/reviews/ReviewListReviewer";
import HistoryReview from "@/features/reviews/HistoryReview";
import ReviewListEksternal from "@/features/reviews/ReviewListEksternal";
import ReviewNoteDetailPage from "@/features/reviews/ReviewNoteDetailPage";
import EditProposalDosen from "@/features/proposals/EditProposalDosen";
import AuthSessionsPage from "@/features/settings/AuthSessionsPage";
import OauthGooglePage from "@/features/settings/OauthGooglePage";

import PeriodeKKM from "@/features/kkm/PeriodeKKM";
import DetailPeriodeKKM from "@/features/kkm/DetailPeriodeKKM";
import TambahPeriodeKKM from "@/features/kkm/TambahPeriodeKKM";
import KkmPeriodForm from "@/features/kkm/KkmPeriodForm";
import PesertaKKM from "@/features/kkm/PesertaKKM";
import LokasiKKM from "@/features/kkm/LokasiKKM";
import DPLKKM from "@/features/kkm/DPLKKM";
import GenerateKelompok from "@/features/kkm/GenerateKelompok";
import MonitoringKKM from "@/features/kkm/MonitoringKKM";
import KelompokKKM from "@/features/kkm/KelompokKKM";
import DetailKelompokKKM from "@/features/kkm/DetailKelompokKKM";
import EditKelompokKKM from "@/features/kkm/EditKelompokKKM";
import LaporanKKM from "@/features/kkm/LaporanKKM";
import PengumumanKKM from "@/features/kkm/PengumumanKKM";
import PengumumanKKMDosen from "@/features/kkm/PengumumanKKMDosen";
import BuatPengumumanKKM from "@/features/kkm/BuatPengumumanKKM";
import PilihSkemaKKM from "@/features/kkm/PilihSkemaKKM";
import FormPendaftaranKKM from "@/features/kkm/FormPendaftaranKKM";

import DashboardDosenKKM from "@/features/dashboard/DashboardDosenKKM";
import DashboardMahasiswaKKM from "@/features/dashboard/DashboardMahasiswaKKM";
import KelompokBimbingan from "@/features/kkm/KelompokBimbingan";
import DetailKelompokBimbingan from "@/features/kkm/DetailKelompokBimbingan";
import MonitoringKKMDosen from "@/features/kkm/MonitoringKKMDosen";
import DetailMonitoringKKMDosen from "@/features/kkm/DetailMonitoringKKMDosen";
import ValidasiLogbookDosen from "@/features/kkm/ValidasiLogbookDosen";
import DetailValidasiLogbookDosen from "@/features/kkm/DetailValidasiLogbookDosen";
import LaporanKKMDosen from "@/features/kkm/LaporanKKMDosen";
import PenilaianMahasiswaDplPage from "@/features/kkm/PenilaianMahasiswaDplPage";

import KelompokSaya from "@/features/mahasiswa/KelompokSaya";
import LogbookMahasiswa from "@/features/mahasiswa/LogbookMahasiswa";
import LogbookKelompokMahasiswa from "@/features/mahasiswa/LogbookKelompokMahasiswa";
import LaporanIndividuMahasiswa from "@/features/mahasiswa/LaporanIndividuMahasiswa";
import LaporanKelompokMahasiswa from "@/features/mahasiswa/LaporanKelompokMahasiswa";
import NilaiMahasiswa from "@/features/mahasiswa/NilaiMahasiswa";
import PengumumanMahasiswa from "@/features/mahasiswa/PengumumanMahasiswa";
import ProfileMahasiswa from "@/features/mahasiswa/ProfileMahasiswa";

import KelolaFakultas from "@/features/master/KelolaFakultas";
import KelolaProgramStudi from "@/features/master/KelolaProgramStudi";
import KelolaReferensi from "@/features/master/KelolaReferensi";
import MasterDosen from "@/features/master/MasterDosen";
import MasterMahasiswa from "@/features/master/MasterMahasiswa";
import MasterReviewer from "@/features/master/MasterReviewer";
import RolePermission from "@/features/master/RolePermission";
import MasterJabatanKelompok from "@/features/kkm/MasterJabatanKelompok";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/register/dosen",
    element: <RegisterDosenPage />,
  },
  {
    path: "/register/reviewer",
    element: <RegisterReviewerPage />,
  },
  {
    path: "/oauth-callback",
    element: <OAuthCallback />,
  },

  // =========================
  // ADMIN AREA
  // =========================
  // ADMIN AREA - Perbaiki bagian ini
  {
    element: (
      <ProtectedRoute
        roles={[APP_ROLES.KETUA_LPPM]}
        anyOf={[
          PERMISSIONS.DASHBOARD_ADMIN,
          PERMISSIONS.DASHBOARD_KKM,
          PERMISSIONS.PENGGUNA_LIHAT,
          PERMISSIONS.PROPOSAL_LIHAT,
          PERMISSIONS.PROPOSAL_PLOTTING,
          PERMISSIONS.MONITORING_PROYEK_LIHAT,
          PERMISSIONS.KKM_PERIODE_LIHAT,
          PERMISSIONS.KKM_PESERTA_LIHAT,
          PERMISSIONS.KKM_KELOMPOK_LIHAT,
          PERMISSIONS.KKM_LOKASI_LIHAT,
          PERMISSIONS.KKM_DPL_LIHAT,
          PERMISSIONS.KKM_GENERATE_LIHAT,
          PERMISSIONS.KKM_MONITORING_LIHAT,
          PERMISSIONS.KKM_PENGUMUMAN_LIHAT,
        ]}
      >
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "admin-dashboard",
        element: <AdminDashboard />, // Dashboard Penelitian
      },
      {
        path: "admin-dashboard/kkm/dashboard", // Dashboard KKM
        element: <DashboardAdminKKM />,
      },
      {
        path: "proposals",
        element: <ProposalList />,
      },
      {
        path: "proposals/:id",
        element: <ProposalDetail />,
      },
      {
        path: "plotting-reviewer",
        element: <ReviewList />,
      },
      {
        path: "monitoring-project",
        element: <ProjectList />,
      },
      {
        path: "monitoring-project/:id",
        element: <ProjectDetail />,
      },
      {
        path: "repository-publik",
        element: <PublicationList />,
      },
      {
        path: "settings/sessions",
        element: <AuthSessionsPage />,
      },
      // Tambahkan route untuk menu KKM lainnya
      {
        path: "admin-dashboard/kkm/periode",
        element: <PeriodeKKM />,
      },
      {
        path: "admin-dashboard/kkm/periode/new",
        element: <TambahPeriodeKKM />,
      },
      {
        path: "admin-dashboard/kkm/periode/:id",
        element: <DetailPeriodeKKM />,
      },
      {
        path: "admin-dashboard/kkm/periode/:id/edit",
        element: <KkmPeriodForm mode="edit" />,
      },
      {
        path: "admin-dashboard/kkm/peserta",
        element: <PesertaKKM />,
      },
      {
        path: "admin-dashboard/kkm/kelompok",
        element: <KelompokKKM />,
      },
      {
        path: "admin-dashboard/kkm/kelompok/:id",
        element: <DetailKelompokKKM />,
      },
      {
        path: "admin-dashboard/kkm/kelompok/:id/edit",
        element: <EditKelompokKKM />,
      },
      {
        path: "admin-dashboard/kkm/lokasi",
        element: <LokasiKKM />,
      },
      {
        path: "admin-dashboard/kkm/dpl",
        element: <DPLKKM />,
      },
      {
        path: "admin-dashboard/kkm/generate",
        element: <GenerateKelompok />,
      },
      {
        path: "admin-dashboard/kkm/monitoring",
        element: <MonitoringKKM />,
      },
      {
        path: "admin-dashboard/kkm/laporan",
        element: <LaporanKKM />,
      },
      {
        path: "admin-dashboard/kkm/pengumuman",
        element: <PengumumanKKM />,
      },
      {
        path: "admin-dashboard/kkm/pengumuman/baru",
        element: <BuatPengumumanKKM />,
      },
    ],
  },
  // =========================
  // MANAJEMEN PENGGUNA — dipakai bersama KETUA_LPPM & ADMIN_SISTEM
  // (halaman users reuse; ADMIN_SISTEM mengelola akun dari menu Pengguna)
  // =========================
  {
    element: (
      <ProtectedRoute
        roles={[APP_ROLES.KETUA_LPPM, APP_ROLES.ADMIN_SISTEM]}
        permission={PERMISSIONS.PENGGUNA_LIHAT}
      >
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "users/add",
        element: <AddUserPage />,
      },
      {
        path: "users/:id",
        element: <UserDetailPage />,
      },
      {
        path: "users/:id/edit",
        element: <EditUserPage />,
      },
    ],
  },
  // =========================
  // ADMIN SISTEM — master data
  // Guard terpisah dari KETUA_LPPM agar ADMIN_SISTEM tidak bisa
  // membuka halaman admin lain lewat URL langsung.
  // =========================
  {
    element: (
      <ProtectedRoute
        roles={[APP_ROLES.ADMIN_SISTEM]}
        anyOf={[
          PERMISSIONS.MASTER_AKADEMIK_KELOLA,
          PERMISSIONS.MASTER_REFERENSI_KELOLA,
          PERMISSIONS.PENGGUNA_LIHAT,
          PERMISSIONS.ROLE_KELOLA,
          PERMISSIONS.KKM_JABATAN_KELOLA,
          PERMISSIONS.KKM_DPL_LIHAT,
          PERMISSIONS.KKM_LOKASI_LIHAT,
          PERMISSIONS.AUDIT_LIHAT,
          PERMISSIONS.SISTEM_KONFIGURASI,
        ]}
      >
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "admin-dashboard/master-data/fakultas",
        element: <KelolaFakultas />,
      },
      {
        path: "admin-dashboard/master-data/program-studi",
        element: <KelolaProgramStudi />,
      },
      {
        // Skema penelitian & sumber pendanaan (opsi dropdown proposal)
        path: "admin-dashboard/master-data/referensi",
        element: <KelolaReferensi />,
      },
      {
        path: "admin-dashboard/master-data/dosen",
        element: <MasterDosen />,
      },
      {
        path: "admin-dashboard/master-data/mahasiswa",
        element: <MasterMahasiswa />,
      },
      {
        path: "admin-dashboard/master-data/reviewer",
        element: <MasterReviewer />,
      },
      {
        // Reuse halaman Manajemen DPL KKM (list, stats, assign, cabut)
        path: "admin-dashboard/master-data/dpl",
        element: <DPLKKM />,
      },
      {
        // Reuse halaman Lokasi/Desa KKM
        path: "admin-dashboard/master-data/desa-mitra",
        element: <LokasiKKM />,
      },
      {
        path: "admin-dashboard/master-data/jabatan",
        element: <MasterJabatanKelompok />,
      },
      {
        path: "admin-dashboard/master-data/role-permission",
        element: <RolePermission />,
      },
      {
        // Audit log — khusus ADMIN_SISTEM (guard blok ini)
        path: "admin-dashboard/audit-log",
        element: <AuditLogPage />,
      },
      {
        // Login Google (kredensial OAuth) — guard izin khusus agar role
        // lain yang lolos guard blok tidak bisa membuka via URL langsung.
        path: "admin-dashboard/settings/oauth-google",
        element: (
          <ProtectedRoute
            roles={[APP_ROLES.ADMIN_SISTEM]}
            permission={PERMISSIONS.SISTEM_KONFIGURASI}
          >
            <OauthGooglePage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // =========================
  // STAFF LPPM
  // =========================
  {
    path: "staff-lppm",
    element: (
      <ProtectedRoute
        roles={[APP_ROLES.STAFF_LPPM]}
        anyOf={[
          PERMISSIONS.PROPOSAL_STATUS,
          PERMISSIONS.PROPOSAL_PLOTTING,
          PERMISSIONS.PROPOSAL_LIHAT,
          PERMISSIONS.MONITORING_PROYEK_LIHAT,
          PERMISSIONS.PENGABDIAN_LIHAT,
          PERMISSIONS.DASHBOARD_KKM,
          PERMISSIONS.KKM_PENGUMUMAN_LIHAT,
          PERMISSIONS.KKM_PERIODE_LIHAT,
          PERMISSIONS.KKM_PESERTA_LIHAT,
          PERMISSIONS.KKM_KELOMPOK_LIHAT,
          PERMISSIONS.KKM_GENERATE_LIHAT,
          PERMISSIONS.KKM_MONITORING_LIHAT,
          PERMISSIONS.KKM_LAPORAN_LIHAT,
        ]}
      >
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/staff-lppm/staff-dashboard" replace />,
      },
      {
        path: "staff-dashboard",
        element: <StaffDashboard />,
      },
      {
        path: "kkm/dashboard",
        element: <DashboardAdminKKM />,
      },
      {
        path: "kkm",
        element: <Navigate to="/staff-lppm/kkm/dashboard" replace />,
      },
      {
        path: "verifikasi-proposal",
        element: <ProposalStaff />,
      },
      {
        path: "/staff-lppm/verifikasi-proposal/:id",
        element: <ProposalVerifyDetail />,
      },
      {
        path: "plotting-reviewer",
        element: <ReviewListStaff />,
      },
      {
        path: "monitoring-project",
        element: <ProjectList />,
      },
      {
        path: "monitoring-project/:id",
        element: <ProjectDetail />,
      },
      {
        path: "repository-publik",
        element: <PublicationList />,
      },
      {
        path: "kkm/periode",
        element: <PeriodeKKM />,
      },
      {
        path: "kkm/periode/new",
        element: <TambahPeriodeKKM />,
      },
      {
        path: "kkm/periode/:id",
        element: <DetailPeriodeKKM />,
      },
      {
        path: "kkm/periode/:id/edit",
        element: <KkmPeriodForm mode="edit" />,
      },
      {
        path: "kkm/peserta",
        element: <PesertaKKM />,
      },
      {
        path: "kkm/kelompok",
        element: <KelompokKKM />,
      },
      {
        path: "kkm/kelompok/:id",
        element: <DetailKelompokKKM />,
      },
      {
        path: "kkm/kelompok/:id/edit",
        element: <EditKelompokKKM />,
      },
      {
        path: "kkm/generate",
        element: <GenerateKelompok />,
      },
      {
        path: "kkm/monitoring",
        element: <MonitoringKKM />,
      },
      {
        path: "kkm/pengumuman",
        element: <PengumumanKKM />,
      },
      {
        path: "kkm/laporan",
        element: <LaporanKKM />,
      },
    ],
  },

  // =========================
  // DOSEN
  // =========================
  {
    path: "dosen-dashboard",
    element: (
      <ProtectedRoute
        roles={[APP_ROLES.DOSEN]}
        anyOf={[
          PERMISSIONS.PROPOSAL_SAYA,
          PERMISSIONS.PENGABDIAN_LIHAT,
          PERMISSIONS.DOSEN_PROFIL,
          PERMISSIONS.KKM_MONITORING_LIHAT,
        ]}
      >
        <DosenLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DosenDashboard />,
      },
      {
        // Seluruh modul KKM dosen dibungkus guard status DPL.
        path: "kkm",
        element: <DplRouteGuard />,
        children: [
          { path: "dashboard", element: <DashboardDosenKKM /> },
          { path: "kelompok-bimbingan", element: <KelompokBimbingan /> },
          {
            path: "kelompok-bimbingan/:id",
            element: <DetailKelompokBimbingan />,
          },
          { path: "monitoring", element: <MonitoringKKMDosen /> },
          { path: "monitoring/:id", element: <DetailMonitoringKKMDosen /> },
          { path: "validasi-logbook", element: <ValidasiLogbookDosen /> },
          {
            path: "validasi-logbook/:id",
            element: <DetailValidasiLogbookDosen />,
          },
          { path: "laporan", element: <LaporanKKMDosen /> },
          { path: "penilaian", element: <PenilaianMahasiswaDplPage /> },
          { path: "pengumuman", element: <PengumumanKKMDosen /> },
        ],
      },
      {
        path: "proposals",
        element: <ProposalDosen />,
      },
      {
        path: "proposals/:id",
        element: <ProposalDetail />,
      },
      {
        path: "proposals/:id/edit",
        element: <EditProposalDosen />, // Ganti dengan nama komponen form edit kamu
      },
      {
        path: "proposals/:id/review-detail",
        element: <ReviewNoteDetailPage />,
      },
      {
        path: "project-dosen",
        element: <ProjectDosen />,
      },
      {
        path: "laporan",
        element: <Laporan />,
      },
      {
        path: "repository-publik",
        element: <PublicationList />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },

  // =========================
  // MAHASISWA — PORTAL KKM
  // =========================
  {
    path: "mahasiswa-dashboard",
    element: (
      // Admin/staff juga boleh masuk untuk preview (sesuai akses GET /kkm/skema)
      <ProtectedRoute
        roles={[
          APP_ROLES.MAHASISWA,
          APP_ROLES.KETUA_LPPM,
          APP_ROLES.STAFF_LPPM,
        ]}
        permission={PERMISSIONS.KKM_SKEMA_LIHAT}
      >
        <MahasiswaLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardMahasiswaKKM />,
      },
      {
        path: "kelompok",
        element: <KelompokSaya />,
      },
      {
        // Indeks menu Logbook — arahkan ke submenu Individu.
        path: "logbook",
        element: <Navigate to="individu" replace />,
      },
      {
        // Submenu: Logbook Individu (entri + review DPL)
        path: "logbook/individu",
        element: <LogbookMahasiswa />,
      },
      {
        // Submenu: Logbook Kelompok (PDF mingguan — ketua/sekretaris)
        path: "logbook/kelompok",
        element: <LogbookKelompokMahasiswa />,
      },
      {
        // Indeks menu Laporan — arahkan ke submenu Individu.
        path: "laporan",
        element: <Navigate to="individu" replace />,
      },
      {
        // Submenu: Laporan Individu (1 PDF per mahasiswa)
        path: "laporan/individu",
        element: <LaporanIndividuMahasiswa />,
      },
      {
        // Submenu: Laporan Kelompok (dokumen LAPORAN_AKHIR)
        path: "laporan/kelompok",
        element: <LaporanKelompokMahasiswa />,
      },
      {
        path: "nilai",
        element: <NilaiMahasiswa />,
      },
      {
        path: "pengumuman",
        element: <PengumumanMahasiswa />,
      },
      {
        path: "profile",
        element: <ProfileMahasiswa />,
      },
      {
        // Langkah 1 portal KKM — pemilihan skema (live API /kkm/skema)
        path: "pilih-skema",
        element: <PilihSkemaKKM />,
      },
      {
        // Formulir pendaftaran mandiri per periode (mahasiswa semester 7)
        path: "pendaftaran/:periodeId",
        element: <FormPendaftaranKKM />,
      },
    ],
  },

  // =========================
  // REVIEWER
  // =========================
  {
    path: "reviewer-dashboard",
    element: (
      <ProtectedRoute
        roles={[APP_ROLES.REVIEWER]}
        permission={PERMISSIONS.PROPOSAL_REVIEW}
      >
        <ReviewerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ReviewerDashboard />,
      },
      {
        path: "reviews/:id",
        element: <ReviewDetailPage />,
      },
      {
        path: "proposal-saya",
        element: <ReviewListReviewer />,
      },
      {
        path: "riwayat-review",
        element: <HistoryReview />,
      },
    ],
  },

  // =========================
  // REVIEWER EKSTERNAL
  // =========================
  {
    path: "reviewer-eksternal-dashboard",
    element: (
      <ProtectedRoute
        roles={[APP_ROLES.REVIEWER_EKSTERNAL]}
        permission={PERMISSIONS.PROPOSAL_LIHAT}
      >
        <EksternalLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ReviewerEksternalDashboard />,
      },
      {
        path: "reviews",
        element: <ReviewListEksternal />,
      },
      {
        path: "reviews/:id",
        element: <ReviewDetailPage />,
      },
    ],
  },

  // =========================
  // FALLBACK ROUTE
  // =========================
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

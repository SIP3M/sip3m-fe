import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import RegisterDosenPage from "@/features/auth/RegisterDosenPage";
import RegisterReviewerPage from "@/features/auth/RegisterReviewerPage";
import OAuthCallback from "@/features/auth/OauthCallback";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import { APP_ROLES } from "@/constant/roles";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StaffLayout from "@/components/layout/StaffLayout";
import DosenLayout from "@/components/layout/DosenLayout";
import ReviewerLayout from "@/components/layout/ReviewerLayout";
import EksternalLayout from "@/components/layout/EksternalLayout";

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
import FinancePage from "@/features/finance/FinancePage";
import LandingPage from "@/features/dashboard/LandingPage";
import ProposalStaff from "@/features/proposals/ProposalStaff";
import ProposalVerifyDetail from "@/features/proposals/ProposalVerifyDetail";
import ReviewListStaff from "@/features/reviews/ReviewListStaff";
import LogsPage from "@/features/logs/LogsPage";

import ProposalDosen from "@/features/proposals/ProposalDosen";
import ProjectDosen from "@/features/projects/ProjectDosen";
import Laporan from "@/features/laporan/Laporan";
import PublicationList from "@/features/repository/PublicationList";
import Profile from "@/features/profile/Profile";

import ReviewDetailPage from "@/features/dashboard/ReviewDetailPage";
import ReviewListReviewer from "@/features/reviews/ReviewListReviewer";
import HistoryReview from "@/features/reviews/HistoryReview";
import ReviewListEksternal from "@/features/reviews/ReviewListEksternal";
import EditProposalDosen from "@/features/proposals/EditProposalDosen";
import SystemSettings from "@/features/settings/SystemSettings";

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
import LaporanKKM from "@/features/kkm/LaporanKKM";
import PengumumanKKM from "@/features/kkm/PengumumanKKM";

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
    <ProtectedRoute roles={[APP_ROLES.ADMIN_LPPM]}>
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
      path: "finance",
      element: <FinancePage />,
    },
    {
      path: "repository-publik",
      element: <PublicationList />,
    },
    {
      path: "logs",
      element: <LogsPage />,
    },
    {
      path: "settings",
      element: <SystemSettings />
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
  ],
},
  // =========================
  // STAFF LPPM
  // =========================
  {
    path: "staff-lppm",
    element: (
      <ProtectedRoute roles={[APP_ROLES.STAFF_LPPM]}>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "staff-dashboard",
        element: <StaffDashboard />,
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
        path: "finance",
        element: <FinancePage />,
      },
      {
        path: "repository-publik",
        element: <PublicationList />,
      },
      {
        path: "logs",
        element: <LogsPage />,
      },
    ],
  },

  // =========================
  // DOSEN
  // =========================
  {
    path: "dosen-dashboard",
    element: (
      <ProtectedRoute roles={[APP_ROLES.DOSEN]}>
        <DosenLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DosenDashboard />,
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
      }
    ],
  },

  // =========================
  // REVIEWER
  // =========================
  {
    path: "reviewer-dashboard",
    element: (
      <ProtectedRoute roles={[APP_ROLES.REVIEWER]}>
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
      <ProtectedRoute roles={[APP_ROLES.REVIEWER_EKSTERNAL]}>
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

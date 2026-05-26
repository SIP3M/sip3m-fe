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

import ReviewDetailPage from "@/features/dashboard/ReviewDetailPage";
import ReviewListReviewer from "@/features/reviews/ReviewListReviewer";
import HistoryReview from "@/features/reviews/HistoryReview";
import ReviewListEksternal from "@/features/reviews/ReviewListEksternal";

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
  {
    element: (
      <ProtectedRoute roles={[APP_ROLES.ADMIN_LPPM]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "admin-dashboard",
        element: <AdminDashboard />,
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
        path: "logs",
        element: <LogsPage />,
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

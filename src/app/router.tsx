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
import RoleLayout from "@/components/layout/RoleLayout";

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
import ReviewList from "@/features/reviews/ReviewList";
import ProjectList from "@/features/projects/ProjectList";
import FinancePage from "@/features/finance/FinancePage";

import ProposalStaff from "@/features/proposals/ProposalStaff";
import ProposalVerifyDetail from "@/features/proposals/ProposalVerifyDetail";

export const router = createBrowserRouter([
  {
    path: "/",
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
    path: "/",
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
        path: "plotting-reviewer",
        element: <ReviewList />,
      },
      {
        path: "monitoring-project",
        element: <ProjectList />,
      },
      {
        path: "finance",
        element: <FinancePage />,
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
        element: <ReviewList />,
      },
      {
        path: "monitoring-project",
        element: <ProjectList />,
      },
      {
        path: "finance",
        element: <FinancePage />,
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
        <RoleLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DosenDashboard />,
      },
      {
        path: "proposals",
        element: <ProposalList />,
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
        <RoleLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ReviewerDashboard />,
      },
      {
        path: "reviews",
        element: <ReviewList />,
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
        <RoleLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ReviewerEksternalDashboard />,
      },
      {
        path: "reviews",
        element: <ReviewList />,
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

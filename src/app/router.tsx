import { createBrowserRouter } from "react-router-dom";

import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import RegisterDosenPage from "@/features/auth/RegisterDosenPage";
import RegisterReviewerPage from "@/features/auth/RegisterReviewerPage";
import OAuthCallback from "@/features/auth/OauthCallback";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import { APP_ROLES } from "@/constant/roles";

import DashboardLayout from "@/components/layout/DashboardLayout";

import AdminDashboard from "@/features/dashboard/AdminDashboard";
import UsersPage from "@/features/users/UsersPage";

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

  // DASHBOARD AREA
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
    ],
  },
]);
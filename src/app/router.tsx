import { createBrowserRouter } from "react-router-dom";

import LoginPage from "@/features/auth/LoginPage";


import ProtectedRoute from "@/components/common/ProtectedRoute";
import { APP_ROLES } from "@/constant/roles";
import AdminDashboard from "@/features/dashboard/AdminDashboard";
import OAuthCallback from "@/features/auth/OauthCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/oauth-callback",
    element: <OAuthCallback />,
  },
  {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute roles={[APP_ROLES.ADMIN_LPPM]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

]);
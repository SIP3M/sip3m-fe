import { createBrowserRouter } from "react-router-dom";

import LoginPage from "@/features/auth/LoginPage";


import ProtectedRoute from "@/components/common/ProtectedRoute";
import { APP_ROLES } from "@/constant/roles";
import AdminDashboard from "@/features/dashboard/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },

  // 🔥 ADMIN
  {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute roles={[APP_ROLES.ADMIN_LPPM]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  // buat route lainnya (staff, dosen, reviewer) dengan pola yang sama seperti admin, tinggal ganti komponen dashboard dan role-nya aja
  // 🔥 STAFF
  // {
  //   path: "/staff",
  //   element: (
  //     <ProtectedRoute roles={[APP_ROLES.STAFF_LPPM]}>
  //       <StaffDashboard />
  //     </ProtectedRoute>
  //   ),
  // },

  // // 🔥 DOSEN
  // {
  //   path: "/dosen",
  //   element: (
  //     <ProtectedRoute roles={[APP_ROLES.DOSEN]}>
  //       <DosenDashboard />
  //     </ProtectedRoute>
  //   ),
  // },

  // // 🔥 REVIEWER (gabung internal & eksternal)
  // {
  //   path: "/reviewer",
  //   element: (
  //     <ProtectedRoute
  //       roles={[APP_ROLES.REVIEWER, APP_ROLES.REVIEWER_EKSTERNAL]}
  //     >
  //       <ReviewerDashboard />
  //     </ProtectedRoute>
  //   ),
  // },
]);
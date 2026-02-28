import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/features/auth/LoginPage";
import AdminDashboard from "@/features/dashboard/AdminDashboard";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
]);
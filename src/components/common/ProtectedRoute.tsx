import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { AppRole } from "@/constant/roles";
import NewtonCradleLoader from "./NewtonCradleLoader";
import { getAccessToken } from "@/services/storage";

interface Props {
  roles: AppRole[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ roles, children }: Props) => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const token = getAccessToken();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <NewtonCradleLoader />
        <p className="text-sm text-gray-500">Memuat sesi pengguna...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userRole = user.roles.roles;

  if (!roles.includes(userRole as AppRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

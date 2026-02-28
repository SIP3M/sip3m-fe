import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { AppRole } from "@/constant/roles";

interface Props {
  roles: AppRole[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ roles, children }: Props) => {
  const user = useAuthStore((state) => state.user);

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
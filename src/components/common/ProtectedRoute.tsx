import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
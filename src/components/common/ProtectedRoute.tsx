import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { AppRole } from "@/constant/roles";
import NewtonCradleLoader from "./NewtonCradleLoader";
import { getAccessToken } from "@/services/storage";

interface Props {
  /** Role bawaan yang diizinkan masuk (parity dengan guard lama). */
  roles: AppRole[];
  /**
   * Permission (kode izin) — role CUSTOM (di luar daftar `roles`) diizinkan
   * masuk bila punya izin ini. Menjadikan guard dinamis mengikuti matriks
   * izin halaman Role & Permission.
   */
  permission?: string;
  /** Varian any-of: role custom lolos bila punya SALAH SATU izin di daftar. */
  anyOf?: string[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ roles, permission, anyOf, children }: Props) => {
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

  const allowedByRole = roles.includes(userRole as AppRole);
  const allowedByPermission = Boolean(
    (permission && user.permissions?.includes(permission)) ||
      (anyOf && anyOf.some((kode) => user.permissions?.includes(kode))),
  );

  if (!allowedByRole && !allowedByPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

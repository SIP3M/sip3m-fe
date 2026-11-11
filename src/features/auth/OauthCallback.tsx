import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "./auth.store";
import { APP_ROLES } from "@/constant/roles";
import { setAuthSession } from "@/services/storage";

const getDashboardPathByRole = (role?: string, dashboardPath?: string | null) => {
  if (role === APP_ROLES.KETUA_LPPM) return "/admin-dashboard";
  // ADMIN_SISTEM hanya punya modul master data — langsung ke halaman itu
  if (role === APP_ROLES.ADMIN_SISTEM) {
    return "/admin-dashboard/master-data/fakultas";
  }
  if (role === APP_ROLES.STAFF_LPPM) return "/staff-lppm/staff-dashboard";
  if (role === APP_ROLES.DOSEN) return "/dosen-dashboard";
  if (role === APP_ROLES.MAHASISWA) return "/mahasiswa-dashboard";
  if (role === APP_ROLES.REVIEWER) return "/reviewer-dashboard";
  if (role === APP_ROLES.REVIEWER_EKSTERNAL) {
    return "/reviewer-eksternal-dashboard";
  }
  // Role custom: ikut dashboard_path dari role (default: layout External).
  if (dashboardPath) return dashboardPath;
  return "/reviewer-eksternal-dashboard";
};

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);

  useEffect(() => {
    const token = searchParams.get("token");
    const userDataRaw = searchParams.get("user");

    if (token && userDataRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userDataRaw));

        setAuthSession({
          token,
          user,
          rememberMe: true,
        });

        setUser(user);
        // Payload OAuth tidak memuat permissions — segarkan dari /auth/me
        // supaya guard & sidebar berbasis izin langsung akurat.
        void fetchCurrentUser();

        const role = user?.roles?.roles;
        navigate(getDashboardPathByRole(role, user?.roles?.dashboard_path));
      } catch (error) {
        console.error("Gagal memproses data user dari URL:", error);
        // Kalau terjadi error saat membaca data, kembalikan ke halaman login
        navigate("/");
      }
    } else {
      // Kalau URL tidak memiliki token atau user, tendang balik ke Login
      navigate("/");
    }
  }, [searchParams, navigate, setUser]);

  // Tampilan saat FE sedang memproses (hanya muncul sekian milidetik)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg text-gray-600 font-medium">
        Sedang memproses otentikasi...
      </p>
    </div>
  );
};

export default OAuthCallback;

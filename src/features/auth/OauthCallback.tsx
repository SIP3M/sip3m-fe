import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "./auth.store";
import { setAuthSession } from "@/services/storage";
import { resolveDashboardPath } from "./dashboardPath";

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

        navigate(resolveDashboardPath(user));
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

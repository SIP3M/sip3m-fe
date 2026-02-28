import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "./auth.store";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const token = searchParams.get("token");
    const userDataRaw = searchParams.get("user");

    if (token && userDataRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userDataRaw));
        
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userData", JSON.stringify(user));
        
        setUser(user);

        // 6. Pindah ke halaman Dashboard! 🚀
        navigate("/admin-dashboard"); // Ganti sesuai role, nanti kita buat logikanya di ProtectedRoute
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
      <p className="text-lg text-gray-600 font-medium">Sedang memproses otentikasi...</p>
    </div>
  );
};

export default OAuthCallback;
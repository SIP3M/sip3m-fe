import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldAlert, Home, LogIn } from "lucide-react";

/**
 * Halaman penolakan akses.
 *
 * Tanpa route ini, `<Navigate to="/unauthorized">` dari ProtectedRoute akan
 * jatuh ke catch-all `*` dan user "terlempar" ke landing page tanpa penjelasan.
 *
 * `?reason=dashboard-belum-diatur` = role belum punya `dashboard_path` dan
 * izinnya tidak dikenali, jadi admin perlu mengisi dashboard role tersebut.
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dashboardUnset = searchParams.get("reason") === "dashboard-belum-diatur";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <ShieldAlert size={22} />
        </div>

        <h1 className="mt-4 text-xl font-bold text-gray-900">
          {dashboardUnset
            ? "Dashboard role Anda belum diatur"
            : "Anda tidak berwenang membuka halaman ini"}
        </h1>

        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          {dashboardUnset ? (
            <>
              Role Anda belum memiliki halaman dashboard tujuan dan izinnya
              belum dikenali sistem. Minta admin mengisi{" "}
              <span className="font-mono text-gray-700">dashboard_path</span>{" "}
              role Anda di menu Master Data → Role &amp; Permission.
            </>
          ) : (
            <>
              Akun Anda sudah login, tetapi role/izin yang dimiliki tidak cukup
              untuk membuka halaman tersebut. Hubungi admin LPPM bila ini tidak
              sesuai.
            </>
          )}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-xl shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Home size={16} /> Ke beranda
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <LogIn size={16} /> Masuk ulang
          </button>
        </div>
      </div>
    </div>
  );
}

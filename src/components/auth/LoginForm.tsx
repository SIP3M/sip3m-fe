import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import kampus from "@/assets/images/img-login.png";
import mumar from "@/assets/images/mumar-login.png";
import logo from "@/assets/images/logo.png";
import { getDeviceId } from "@/utils/device";

interface LoginFormProps {
  form: { email: string; password: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogin: (e: React.FormEvent) => void;
  rememberMe: boolean;
  handleRememberMeChange: (checked: boolean) => void;
  isLoading?: boolean;
  loginSuccess?: boolean;
  userName?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  form,
  handleChange,
  handleLogin,
  rememberMe,
  handleRememberMeChange,
  isLoading,
  loginSuccess,
  userName,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loginSuccess) {
      const enterTimer = setTimeout(() => setToastVisible(true), 50);
      return () => clearTimeout(enterTimer);
    } else {
      setToastVisible(false);
    }
  }, [loginSuccess]);

  const handleGoogleLogin = () => {
    const apiBase = (
      import.meta.env.VITE_API_BASE_URL || "https://sip3m-be.vercel.app/api"
    ).replace(/\/+$/, "");

    const params = new URLSearchParams();
    try {
      params.set("device_id", getDeviceId());
    } catch {
      // ignore — fallback device id dari BE
    }
    params.set("fe", window.location.origin);

    window.location.href = `${apiBase}/auth/oauth/google?${params.toString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="relative w-full max-w-[690px] xl:max-w-[710px] bg-white rounded-3xl sm:rounded-[32px]
        shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100/80
        flex flex-col lg:flex-row items-center lg:items-stretch
        p-6 sm:p-7 gap-6 sm:gap-7 lg:gap-7"
    >
      {/* TOAST — Login Berhasil */}
      {loginSuccess && (
        <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:top-6 z-[100] w-auto sm:w-full sm:max-w-sm">
          <div
            className={`flex items-start gap-3 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-4 pr-3 transition-all duration-300 ease-out
              ${toastVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="#e10600"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-gray-800">
                Login berhasil!
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {userName
                  ? `Selamat datang, ${userName}`
                  : "Mengalihkan ke dashboard..."}
              </p>

              <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e10600] rounded-full"
                  style={{ animation: "toastProgress 1.8s linear forwards" }}
                />
              </div>
            </div>
          </div>

          <style>{`
            @keyframes toastProgress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      )}

      {/* ================= LEFT (desktop photo + mascot) ================= */}
      <div className="hidden lg:flex relative w-[280px] xl:w-[290px] shrink-0 flex-col">
        {/* Frame Foto Gedung Kampus UMC */}
        <div className="w-full h-full min-h-[410px] rounded-[22px] overflow-hidden border border-gray-300 shadow-xs relative">
          <img
            src={kampus}
            alt="Kampus Universitas Muhammadiyah Cirebon"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Maskot Mumar UMC — Posisi persis di pojok kiri bawah foto gedung, overlapping keluar sedikit */}
        <img
          src={mumar}
          alt="Maskot UMC"
          className="absolute pointer-events-none select-none z-10 w-[89%] -left-[30.5%] -bottom-[21.2%]"
        />
      </div>

      {/* ================= RIGHT (Form & Branding) ================= */}
      <div className="flex-1 w-full max-w-[325px] flex flex-col justify-center">
        {/* Logo & Judul Header */}
        <div className="flex flex-col items-center mb-3">
          <img
            src={logo}
            alt="Logo LPPM UMC"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
          />

          <h1 className="text-lg sm:text-[19px] font-bold text-center leading-tight text-gray-900 mt-2">
            Sistem Informasi <br /> LPPM UMC
          </h1>

          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 mb-2 sm:mb-3 text-center">
            Universitas Muhammadiyah Cirebon
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1 text-left">
              Email / NIDN / NIP
            </label>

            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan Email / NIDN / NIP"
              className="w-full h-9 sm:h-10 px-3.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#e10600] focus:border-[#e10600] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1 text-left">
              Password
            </label>

            <div className="relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Masukkan Password"
                className="w-full h-9 sm:h-10 pl-3.5 pr-10 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#e10600] focus:border-[#e10600] transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 inset-y-0 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} strokeWidth={1.75} />
                ) : (
                  <Eye size={17} strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {/* Ingat saya & Lupa password */}
          <div className="flex justify-between items-center text-xs pt-0.5">
            <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-[#e10600] cursor-pointer"
              />
              <span>Ingat saya</span>
            </label>

            <span className="text-[#e10600] cursor-pointer hover:underline text-xs">
              Lupa password?
            </span>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 sm:h-10 bg-[#e10600] hover:bg-[#c50500] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer disabled:opacity-60 flex items-center justify-center mt-1 shadow-xs active:scale-[0.99]"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>

          {/* Divider atau */}
          <div className="flex items-center gap-2.5 my-2">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-[11px] text-gray-400 select-none">atau</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Tombol Sign in with Google (Pill button centered) */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-4 h-4 shrink-0"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.67 1.22 9.15 3.6l6.85-6.85C35.9 2.4 30.37 0 24 0 14.6 0 6.5 5.48 2.6 13.44l7.98 6.2C12.4 13.36 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24c0-1.6-.14-3.14-.4-4.64H24v9.3h12.7c-.55 2.96-2.2 5.48-4.7 7.18l7.3 5.7C43.9 37.1 46.5 31 46.5 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.6 28.36A14.5 14.5 0 019.5 24c0-1.52.26-2.98.72-4.36l-7.98-6.2A24 24 0 000 24c0 3.9.94 7.6 2.6 10.56l8-6.2z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.37 0 11.73-2.1 15.64-5.7l-7.3-5.7c-2.02 1.36-4.6 2.15-8.34 2.15-6.3 0-11.6-3.86-13.42-9.14l-8 6.2C6.5 42.52 14.6 48 24 48z"
                />
              </svg>

              <span className="text-[12px] text-gray-700">
                Sign in with Google
              </span>
            </button>
          </div>

          {/* Link Daftar */}
          <p className="text-center text-xs text-gray-700 pt-1.5">
            Belum punya akun?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-[#e10600] font-medium cursor-pointer hover:underline"
            >
              Daftar sekarang
            </span>
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default LoginForm;

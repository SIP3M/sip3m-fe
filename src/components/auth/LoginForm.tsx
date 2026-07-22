import React, { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import kampus from "@/assets/images/img-login.png";
import mumar from "@/assets/images/mumar-login.png";
import logo from "@/assets/images/logo.png";

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
    window.location.href = "https://sip3m-be.vercel.app/api/auth/oauth/google";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="
        w-180 h-130
        bg-white
        rounded-4xl
        shadow-[0_30px_80px_rgba(0,0,0,0.15)]
        flex
        overflow-hidden
        relative
      "
    >
      {/* TOAST — Login Berhasil */}
      {loginSuccess && (
        <div className="fixed top-6 right-6 z-[100] w-full max-w-sm">
          <div
            className={`flex items-start gap-3 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-4 pr-3 transition-all duration-300 ease-out
              ${toastVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
          >
            {/* Icon */}
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

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-gray-800">
                Login berhasil!
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {userName ? `Selamat datang, ${userName}` : "Mengalihkan ke dashboard..."}
              </p>

              {/* Progress bar auto-dismiss */}
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

      {/* ================= LEFT ================= */}
      <div className="max-w-1/2 relative p-4 flex">
        <div className="w-80 h-full rounded-4xl overflow-hidden shadow-md">
          <img src={kampus} alt="Kampus" className="w-80 h-full object-cover" />
        </div>

        <img
          src={mumar}
          alt="Maskot"
          className="absolute bottom-0 w-62 -translate-x-20 top-64"
        />
      </div>

      {/* ================= RIGHT ================= */}
      <div className="w-1/2 flex flex-col justify-center px-6 py-2 scale-[0.95]">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-2">
          <img src={logo} alt="Logo" className="w-16" />

          <h1 className="text-[24px] font-semibold text-center leading-8 text-gray-800 mt-2">
            Sistem Informasi <br /> LPPM UMC
          </h1>

          <p className="text-[13px] text-gray-500 mt-1 text-center">
            Universitas Muhammadiyah Cirebon
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-1">
          {/* EMAIL */}
          <div>
            <label className="block text-[12px] text-gray-600 mb-2">
              Email / NIDN / NIP
            </label>

            <Input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan Email / NIDN / NIP"
              className="w-full h-10 px-4 text-[13px] bg-[#ededed] border border-[#dddddd] rounded-[14px] focus:ring-2 focus:ring-[#e10600] focus:border-[#e10600]"
            />
          </div>

          {/* PASSWORD */}
          <div className="mt-1">
            <label className="block text-[12px] text-gray-600 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                placeholder="Masukkan Password"
                className="w-full h-10 px-4 pr-12 text-[13px] bg-[#ededed] border border-[#dddddd] rounded-[14px] focus:ring-2 focus:ring-[#e10600] focus:border-[#e10600] outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 inset-y-0 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* REMEMBER */}
          <div className="flex justify-between items-center text-[12px] mt-2">
            <label className="flex items-center gap-2 text-gray-500">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                className="w-4 h-3"
              />
              Ingat saya
            </label>

            <span className="text-[#e10600] cursor-pointer hover:underline">
              Lupa password?
            </span>
          </div>

          {/* BUTTON */}
          <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#e10600] hover:bg-[#c50500] text-white rounded-[14px] text-[15px] font-medium transition"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </motion.div>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#dddddd]"></div>
            <span className="text-[11px] text-gray-400">atau</span>
            <div className="flex-1 h-px bg-[#dddddd]"></div>
          </div>

          {/* GOOGLE BUTTON */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-10 my-1 bg-white border border-[#dddddd] rounded-[14px] text-[13px] text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-3"
          >
            {/* SVG tetap */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
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

            <span>Sign in with Google</span>
          </Button>

          {/* REGISTER */}
          <p className="text-center text-[12px] mt-5 text-gray-500">
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
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import kampus from "@/assets/images/img-login.png";
import mumar from "@/assets/images/mumar-login.png";
import logo from "@/assets/images/logo.png";

interface LoginFormProps {
  form: { email: string; password: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogin: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  form,
  handleChange,
  handleLogin,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // URL ini sesuai dengan yang kamu sebutkan sebelumnya
    window.location.href = "https://sip3m-be.vercel.app/api/auth/oauth/google";
  };

  return (
    <div
      className="
    w-180 h-130
    bg-white
    rounded-4xl
    shadow-[0_30px_80px_rgba(0,0,0,0.15)]
    flex
    overflow-hidden
  "
    >
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
              className="
                w-full h-10
                px-4 text-[13px]
                bg-[#ededed]
                border border-[#dddddd]
                rounded-[14px]
                focus:ring-2 focus:ring-[#e10600]
                focus:border-[#e10600]
              "
            />
          </div>

          {/* PASSWORD */}
          <div className="mt-1">
            <label className="block text-[12px] text-gray-600 mb-2">
              Password
            </label>

            <div className="relative">
              <Input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan Password"
                className="
      w-full h-10
      px-4 pr-12
      text-[13px]
      bg-[#ededed]
      border border-[#dddddd]
      rounded-[14px]
      focus:ring-2 focus:ring-[#e10600]
      focus:border-[#e10600]
    "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 inset-y-0 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* REMEMBER */}
          <div className="flex justify-between items-center text-[12px] mt-2">
            <label className="flex items-center gap-2 text-gray-500">
              <input type="checkbox" className="w-4 h-3" />
              Ingat saya
            </label>

            <span className="text-[#e10600] cursor-pointer hover:underline">
              Lupa password?
            </span>
          </div>

          {/* BUTTON */}
          <Button
            type="submit"
            disabled={isLoading}
            className="
              w-full h-10
              bg-[#e10600]
              hover:bg-[#c50500]
              text-white
              rounded-[14px]
              text-[15px]
              font-medium
              transition
            "
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </Button>

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
            className="
    w-full h-10 my-1
    bg-white
    border border-[#dddddd]
    rounded-[14px]
    text-[13px]
    text-gray-700
    hover:bg-gray-50
    transition
    flex items-center justify-center gap-3
  "
          >
            {/* GOOGLE LOGO */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.9-6.9C35.91 2.4 30.38 0 24 0 14.82 0 6.73 5.16 2.69 12.69l8.03 6.23C12.74 13.1 17.89 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.14 24.5c0-1.6-.14-3.14-.41-4.63H24v9.01h12.41c-.54 2.91-2.19 5.37-4.66 7.03l7.16 5.56C43.88 37.14 46.14 31.33 46.14 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.72 28.92c-.48-1.43-.76-2.95-.76-4.42s.27-2.99.76-4.42l-8.03-6.23C.97 16.98 0 20.38 0 24.5s.97 7.52 2.69 10.65l8.03-6.23z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.38 0 11.74-2.1 15.65-5.7l-7.16-5.56c-2 1.34-4.56 2.13-8.49 2.13-6.11 0-11.26-3.6-13.28-8.42l-8.03 6.23C6.73 42.84 14.82 48 24 48z"
              />
            </svg>
            Sign in with Google
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
    </div>
  );
};

export default LoginForm;

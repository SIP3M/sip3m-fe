import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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
              className="w-full h-10 px-4 text-[13px] bg-[#ededed] border border-[#dddddd] rounded-[14px] focus:ring-2 focus:ring-[#e10600] focus:border-[#e10600]"
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
                autoComplete="new-password"
                data-lpignore= "true"
                placeholder="Masukkan Password"
                className="w-full h-10 px-4 pr-12 text-[13px] bg-[#ededed] border border-[#dddddd] rounded-[14px] focus:ring-2 focus:ring-[#e10600] focus:border-[#e10600]"
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

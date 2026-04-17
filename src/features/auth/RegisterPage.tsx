import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

import { GraduationCap, UserCheck } from "lucide-react";

import bg from "@/assets/images/img-login.png";
import logo from "@/assets/images/logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLoginClick = () => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

  return (
    <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
      {/* overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>

      <motion.div
        animate={
          isLeaving
            ? { opacity: 0, scale: 0.96 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-5xl px-4"
      >
        {/* HEADER */}
        <div className="bg-white rounded-[28px] shadow-xl px-6 py-4 flex items-center gap-4 mb-10">
          <img src={logo} className="w-14" />

          <div>
            <h1 className="text-[20px] font-bold text-gray-800 tracking-wide">
              SISTEM INFORMASI LPPM
            </h1>
            <p className="text-[#e10600] text-[13px] font-semibold">
              Universitas Muhammadiyah Cirebon
            </p>
            <p className="text-gray-500 text-[11px]">
              Silakan pilih jenis registrasi yang sesuai
            </p>
          </div>
        </div>

        {/* CARD */}
        <div className="grid grid-cols-2 gap-6">
          {/* DOSEN */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-50 p-2 rounded-lg">
                <GraduationCap className="text-[#e10600]" size={20} />
              </div>
              <h2 className="text-[16px] font-semibold text-gray-800">
                Registrasi Dosen
              </h2>
            </div>

            <p className="text-[13px] text-gray-500 mb-4">
              Untuk dosen internal kampus
            </p>

            <ul className="text-[13px] text-gray-600 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-[#e10600] mt-[5px] text-[8px]">●</span>
                Formulir registrasi 3 langkah
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#e10600] mt-[5px] text-[8px]">●</span>
                Data pribadi, akademik, dan akun login
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#e10600] mt-[5px] text-[8px]">●</span>
                Menunggu verifikasi dari Admin LPPM
              </li>
            </ul>

            <button
              onClick={() => navigate("/register/dosen")}
              className="text-[#e10600] text-[13px] font-semibold hover:underline flex items-center gap-1"
            >
              Mulai Registrasi <span>›</span>
            </button>
          </div>

          {/* REVIEWER */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-50 p-2 rounded-lg">
                <UserCheck className="text-[#e10600]" size={20} />
              </div>
              <h2 className="text-[16px] font-semibold text-gray-800">
                Registrasi Reviewer
              </h2>
            </div>

            <p className="text-[13px] text-gray-500 mb-4">
              Untuk reviewer eksternal
            </p>

            <ul className="text-[13px] text-gray-600 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-[#e10600] mt-[5px] text-[8px]">●</span>
                Formulir registrasi 3 langkah
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#e10600] mt-[5px] text-[8px]">●</span>
                Identitas, info profesional, dan akun login
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#e10600] mt-[5px] text-[8px]">●</span>
                Upload CV dan pengalaman review
              </li>
            </ul>

            <button
              onClick={() => navigate("/register/reviewer")}
              className="text-[#e10600] text-[13px] font-semibold hover:underline flex items-center gap-1"
            >
              Mulai Registrasi <span>›</span>
            </button>
          </div>
        </div>

        {/* LOGIN */}
        <p className="text-center mt-8 text-[13px] text-gray-600">
          Sudah memiliki akun?{" "}
          <motion.span
            onClick={handleLoginClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#e10600] cursor-pointer hover:underline font-medium"
          >
            Login di sini
          </motion.span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;
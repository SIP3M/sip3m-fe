import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

import bg from "@/assets/images/img-login.png";
import logo from "@/assets/images/logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLoginClick = () => {
    setIsLeaving(true);

    setTimeout(() => {
      navigate("/");
    }, 300); // durasi animasi
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay blur */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

      <motion.div
        animate={
          isLeaving
            ? { opacity: 0, scale: 0.96 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* HEADER */}
        <div className="bg-white rounded-[30px] shadow-lg px-8 py-5 flex items-center gap-4 mb-10">
          <img src={logo} className="w-16" />

          <div>
            <h1 className="text-[22px] font-bold text-gray-800">
              SISTEM INFORMASI LPPM
            </h1>
            <p className="text-[#e10600] text-[14px] font-medium">
              Universitas Muhammadiyah Cirebon
            </p>
            <p className="text-gray-500 text-[12px]">
              Silakan pilih jenis registrasi yang sesuai
            </p>
          </div>
        </div>

        {/* CARD */}
        <div className="grid grid-cols-2 gap-6">
          {/* DOSEN */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-1">Registrasi Dosen</h2>
            <p className="text-sm text-gray-500 mb-4">
              Untuk dosen internal kampus
            </p>

            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• Formulir registrasi 3 langkah</li>
              <li>• Data pribadi, akademik, dan akun login</li>
              <li>• Menunggu verifikasi dari Admin LPPM</li>
            </ul>

            <button
              onClick={() => navigate("/register/dosen")}
              className="text-[#e10600] font-medium hover:underline"
            >
              Mulai Registrasi →
            </button>
          </div>

          {/* REVIEWER */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-1">
              Registrasi Reviewer
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Untuk reviewer eksternal
            </p>

            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• Formulir registrasi 3 langkah</li>
              <li>• Identitas, info profesional, dan akun login</li>
              <li>• Upload CV dan pengalaman review</li>
            </ul>

            <button
              onClick={() => navigate("/register/reviewer")}
              className="text-[#e10600] font-medium hover:underline"
            >
              Mulai Registrasi →
            </button>
          </div>
        </div>

        {/* LOGIN */}
        <p className="text-center mt-8 text-sm text-gray-600">
          Sudah memiliki akun?{" "}
          <motion.span
            onClick={handleLoginClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#e10600] cursor-pointer hover:underline inline-block"
          >
            Login di sini
          </motion.span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;
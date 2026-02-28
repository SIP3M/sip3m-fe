import { useNavigate } from "react-router-dom";
import bg from "@/assets/images/img-login.png"; // background kampus
import logo from "@/assets/images/logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay blur */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-5xl">
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

        {/* CARD CONTAINER */}
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
          <span
            onClick={() => navigate("/")}
            className="text-[#e10600] cursor-pointer hover:underline"
          >
            Login di sini
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterDosenPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step === 1) return navigate("/register");
    setStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center py-10">
      {/* TITLE */}
      {step !== 4 && (
        <>
          <h1 className="text-[24px] font-semibold text-gray-800">
            Registrasi Dosen
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Sistem Informasi LPPM Universitas Muhammadiyah Cirebon
          </p>
        </>
      )}

      {/* ================= SUCCESS PAGE ================= */}
      {step === 4 && (
        <div className="w-162.5 bg-white rounded-2xl shadow-md p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>

          <h2 className="text-xl font-semibold mb-3">
            Registrasi Berhasil
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            Silakan menunggu verifikasi dari Admin LPPM. Anda akan menerima
            notifikasi melalui email setelah akun Anda diverifikasi.
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#e10600] text-white py-3 rounded-xl"
          >
            Kembali ke Beranda
          </button>
        </div>
      )}

      {/* ================= FORM CARD ================= */}
      {step !== 4 && (
        <div className="w-162.5 bg-white rounded-2xl shadow-md p-8">
          
          {/* ================= STEP INDICATOR ================= */}
          <div className="relative flex items-center justify-between mb-10">

            {/* BACKGROUND LINE */}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200"></div>

            {/* ACTIVE LINE */}
            <div
              className="absolute top-4 left-0 h-0.5 bg-[#e10600] transition-all duration-300"
              style={{
                width:
                  step === 1
                    ? "0%"
                    : step === 2
                    ? "50%"
                    : "100%",
              }}
            ></div>

            {/* STEP 1 */}
            <div className="relative z-10 flex flex-col items-center w-1/3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1
                    ? "bg-[#e10600] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className="text-xs mt-2 text-gray-600">
                Data Pribadi
              </span>
            </div>

            {/* STEP 2 */}
            <div className="relative z-10 flex flex-col items-center w-1/3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2
                    ? "bg-[#e10600] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 2 ? "✓" : "2"}
              </div>
              <span className="text-xs mt-2 text-gray-600">
                Data Akademik
              </span>
            </div>

            {/* STEP 3 */}
            <div className="relative z-10 flex flex-col items-center w-1/3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3
                    ? "bg-[#e10600] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span className="text-xs mt-2 text-gray-600">
                Akun Login
              </span>
            </div>
          </div>

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <>
              <h2 className="text-[16px] font-semibold mb-4">
                Informasi Pribadi
              </h2>

              <div className="space-y-4">
                <Input label="Nama Lengkap*" />
                <Input label="Tempat Lahir*" />
                <Input type="date" label="Tanggal Lahir*" />

                <div>
                  <label className="text-sm">Jenis Kelamin*</label>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <label>
                      <input type="radio" name="jk" /> Laki-laki
                    </label>
                    <label>
                      <input type="radio" name="jk" /> Perempuan
                    </label>
                  </div>
                </div>

                <Textarea label="Alamat*" />
                <Input label="Nomor HP*" />
              </div>
            </>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <>
              <h2 className="text-[16px] font-semibold mb-4">
                Informasi Akademik
              </h2>

              <div className="space-y-4">
                <Input label="NIDN*" />
                <p className="text-xs text-gray-400 -mt-2">
                  NIDN harus sesuai dengan data resmi kampus.
                </p>
                <Select label="Fakultas*" />
                <Select label="Program Studi*" />
              </div>
            </>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <>
              <h2 className="text-[16px] font-semibold mb-4">
                Informasi Akun
              </h2>

              <div className="space-y-4">
                <Input label="Username*" />
                <Input type="password" label="Password*" />
                <Input type="password" label="Konfirmasi Password*" />

                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <input type="checkbox" />
                  <span>
                    Saya menyetujui kebijakan privasi dan penggunaan data
                  </span>
                </div>
              </div>
            </>
          )}

          {/* BUTTON */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={prevStep}
              className="w-full border border-[#e10600] text-[#e10600] py-2 rounded-xl"
            >
              Kembali
            </button>

            <button
              onClick={nextStep}
              className="w-full bg-[#e10600] text-white py-2 rounded-xl"
            >
              {step === 3 ? "Daftar sebagai Dosen" : "Lanjut"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterDosenPage;

/* ================= COMPONENT ================= */

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input
      {...props}
      className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]"
    />
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <textarea
      {...props}
      className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]"
    />
  </div>
);

const Select = ({ label }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <select className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]">
      <option>Pilih</option>
    </select>
  </div>
);
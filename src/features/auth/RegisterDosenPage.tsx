import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const RegisterDosenPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    nama: "",
    tempat: "",
    tanggal: "",
    jk: "",
    alamat: "",
    nohp: "",
    nidn: "",
    fakultas: "",
    prodi: "",
    username: "",
    password: "",
    confirm: "",
    agree: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const nextStep = () => {
    if (step < 4) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step === 1) return navigate("/register");
    setStep((prev) => prev - 1);
  };

  /* ================= VALIDASI ================= */
  const isStep1Valid =
    form.nama &&
    form.tempat &&
    form.tanggal &&
    form.jk &&
    form.alamat &&
    form.nohp;

  const isStep2Valid =
    form.nidn &&
    form.fakultas &&
    form.prodi;

  const isStep3Valid =
    form.username &&
    form.password &&
    form.confirm &&
    form.password === form.confirm &&
    form.agree;

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

      {/* ================= SUCCESS ================= */}
      {step === 4 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-162.5 bg-white rounded-2xl shadow-md p-10 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>

          <h2 className="text-xl font-semibold mb-3">
            Registrasi Berhasil
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            Silakan menunggu verifikasi dari Admin LPPM.
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#e10600] text-white py-3 rounded-xl"
          >
            Kembali ke Beranda
          </button>
        </motion.div>
      )}

      {/* ================= FORM ================= */}
      {step !== 4 && (
        <div className="w-162.5 bg-white rounded-2xl shadow-md p-8">

          {/* ================= STEP ================= */}
          <div className="flex items-center justify-between mb-10 px-4">
            {["Data Pribadi", "Data Akademik", "Akun Login"].map(
              (label, i) => {
                const num = i + 1;

                return (
                  <div key={i} className="flex items-center w-full">

                    {/* BULATAN */}
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2
                        ${
                          step > num
                            ? "bg-[#e10600] border-[#e10600] text-white"
                            : step === num
                            ? "border-[#e10600] text-[#e10600] bg-white"
                            : "border-gray-300 text-gray-400 bg-white"
                        }`}
                      >
                        {step > num ? "✓" : num}
                      </div>

                      <span className="text-xs mt-2 text-gray-600 text-center w-25">
                        {label}
                      </span>
                    </div>

                    {/* GARIS */}
                    {i < 2 && (
                      <div className="flex-1 h-0.5 mx-2">
                        <div className="w-full h-full bg-gray-200 relative">
                          <div
                            className={`h-full transition-all duration-500 ${
                              step > num ? "bg-[#e10600] w-full" : "w-0"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* ================= CONTENT (ANIMASI) ================= */}
          <AnimatePresence mode="wait">

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-4"
              >
                <h2 className="font-semibold">Informasi Pribadi</h2>

                <Input name="nama" label="Nama Lengkap*" onChange={handleChange} />
                <Input name="tempat" label="Tempat Lahir*" onChange={handleChange} />
                <Input name="tanggal" type="date" label="Tanggal Lahir*" onChange={handleChange} />

                <div>
                  <label className="text-sm">Jenis Kelamin*</label>
                  <div className="flex gap-4 mt-2 text-sm">
                    <label>
                      <input type="radio" name="jk" value="L" onChange={handleChange}/> Laki-laki
                    </label>
                    <label>
                      <input type="radio" name="jk" value="P" onChange={handleChange}/> Perempuan
                    </label>
                  </div>
                </div>

                <Textarea name="alamat" label="Alamat*" onChange={handleChange} />
                <Input name="nohp" label="Nomor HP*" onChange={handleChange} />
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-4"
              >
                <h2 className="font-semibold">Informasi Akademik</h2>

                <Input name="nidn" label="NIDN*" onChange={handleChange} />
                <Select name="fakultas" label="Fakultas*" onChange={handleChange} />
                <Select name="prodi" label="Program Studi*" onChange={handleChange} />
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-4"
              >
                <h2 className="font-semibold">Informasi Akun</h2>

                <Input name="username" label="Username*" onChange={handleChange} />
                <Input name="password" type="password" label="Password*" onChange={handleChange} />
                <Input name="confirm" type="password" label="Konfirmasi Password*" onChange={handleChange} />

                <label className="flex gap-2 text-sm">
                  <input type="checkbox" name="agree" onChange={handleChange} />
                  Saya menyetujui kebijakan privasi
                </label>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ================= BUTTON ================= */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={prevStep}
              className="w-full border border-[#e10600] text-[#e10600] py-2 rounded-xl"
            >
              Kembali
            </button>

            <button
              onClick={() => {
                if (step === 3) return setStep(4);
                nextStep();
              }}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid)
              }
              className={`w-full py-2 rounded-xl text-white transition active:scale-95
                ${
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 3 && !isStep3Valid)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#e10600] hover:bg-[#c50500]"
                }
              `}
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
    <input {...props} className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]" />
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <textarea {...props} className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]" />
  </div>
);

const Select = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <select {...props} className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]">
      <option value="">Pilih</option>
      <option>Contoh 1</option>
      <option>Contoh 2</option>
    </select>
  </div>
);
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RegisterReviewerPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dragging, setDragging] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    email: "",
    nohp: "",
    instansi: "",
    bidang: "",
    pengalaman: "",
    file: null as File | null,
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

  const handleFile = (file: File) => {
    setForm({ ...form, file });
  };

  const next = () => setStep((s) => s + 1);
  const back = () => {
    if (step === 1) return navigate("/register");
    setStep((s) => s - 1);
  };

  const isStep1Valid = form.nama && form.email && form.nohp;
  const isStep2Valid =
    form.instansi && form.bidang && form.pengalaman && form.file;
  const isStep3Valid =
    form.username &&
    form.password &&
    form.confirm &&
    form.password === form.confirm &&
    form.agree;

  const variants = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center py-10">
      <h1 className="text-[24px] font-semibold text-gray-800">
        Registrasi Reviewer Eksternal
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Sistem Informasi LPPM Universitas Muhammadiyah Cirebon
      </p>

      <div className="w-162.5 bg-white rounded-2xl shadow-md p-8">

        {/* STEP */}
        {step <= 3 && (
          <div className="flex items-center justify-between mb-12 px-6">
            {["Identitas", "Informasi Profesional", "Akun Login"].map(
              (label, i) => {
                const num = i + 1;

                return (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative z-10 bg-white">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition
                        ${
                          step > num
                            ? "bg-[#e10600] border-[#e10600] text-white"
                            : step === num
                            ? "border-[#e10600] text-[#e10600]"
                            : "border-gray-300 text-gray-400"
                        }`}
                      >
                        {step > num ? "✓" : num}
                      </motion.div>

                      <span className="text-xs mt-2 text-gray-600 text-center w-24">
                        {label}
                      </span>
                    </div>

                    {i < 2 && (
                      <div className="relative flex-1 h-0.5 mx-2 mt-4">
                        <div className="absolute inset-0 bg-gray-200" />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: step > num ? "100%" : "0%" }}
                          className="absolute inset-0 bg-[#e10600]"
                        />
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" {...variants} transition={{ duration: 0.4 }}>
              <h2 className="text-[16px] font-semibold mb-4">Identitas</h2>

              <div className="space-y-4">
                <Input name="nama" label="Nama Lengkap*" onChange={handleChange} />
                <Input name="email" label="Email*" onChange={handleChange} />
                <Input name="nohp" label="Nomor HP*" onChange={handleChange} />
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" {...variants} transition={{ duration: 0.4 }}>
              <h2 className="text-[16px] font-semibold mb-4">
                Informasi Profesional
              </h2>

              <div className="space-y-4">
                <Input name="instansi" label="Instansi*" onChange={handleChange} />
                <Input name="bidang" label="Bidang Keahlian*" onChange={handleChange} />
                <Textarea name="pengalaman" label="Pengalaman Review*" onChange={handleChange} />

                {/* DRAG DROP */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="transition"
                >
                  <label className="text-sm text-gray-600">Upload CV*</label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      handleFile(e.dataTransfer.files[0]);
                    }}
                    className={`mt-2 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
                    ${
                      dragging
                        ? "border-[#e10600] bg-red-50 scale-[1.01]"
                        : "border-gray-300 bg-[#fafafa]"
                    }`}
                  >
                    <UploadCloud className="mx-auto mb-2 text-gray-400" />

                    <p className="text-sm text-gray-500">
                      Drag & drop file atau klik untuk upload
                    </p>

                    <input
                      type="file"
                      onChange={(e) => handleFile(e.target.files![0])}
                      className="hidden"
                      id="upload"
                    />

                    <label
                      htmlFor="upload"
                      className="text-xs text-[#e10600] cursor-pointer hover:underline"
                    >
                      Pilih file
                    </label>

                    {form.file && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs mt-2 text-green-600"
                      >
                        {form.file.name}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="step3" {...variants} transition={{ duration: 0.4 }}>
              <h2 className="text-[16px] font-semibold mb-4">
                Informasi Akun
              </h2>

              <div className="space-y-4">
                <Input name="username" label="Username*" onChange={handleChange} />

                <PasswordInput
                  label="Password*"
                  name="password"
                  show={showPass}
                  toggle={() => setShowPass(!showPass)}
                  onChange={handleChange}
                />

                <PasswordInput
                  label="Konfirmasi Password*"
                  name="confirm"
                  show={showConfirm}
                  toggle={() => setShowConfirm(!showConfirm)}
                  onChange={handleChange}
                />

                <label className="text-sm flex gap-2">
                  <input type="checkbox" name="agree" onChange={handleChange} />
                  Saya menyetujui kebijakan privasi
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BUTTON */}
        {step <= 3 && (
          <div className="flex gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={back}
              className="w-full border border-[#e10600] text-[#e10600] py-2 rounded-xl"
            >
              Kembali
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => (step === 3 ? setStep(4) : next())}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid)
              }
              className={`w-full py-2 rounded-xl text-white transition ${
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid)
                  ? "bg-gray-300"
                  : "bg-[#e10600]"
              }`}
            >
              {step === 3 ? "Daftar sebagai Reviewer" : "Lanjut"}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterReviewerPage;

/* COMPONENTS */

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input
      {...props}
      className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]
      focus:outline-none focus:ring-2 focus:ring-[#e10600]/30
      focus:border-[#e10600] transition"
    />
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <textarea
      {...props}
      className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]
      focus:outline-none focus:ring-2 focus:ring-[#e10600]/30
      focus:border-[#e10600] transition"
    />
  </div>
);

const PasswordInput = ({ label, show, toggle, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className="w-full mt-1 px-4 py-2 pr-10 border rounded-xl bg-[#f9f9f9]
        focus:outline-none focus:ring-2 focus:ring-[#e10600]/30
        focus:border-[#e10600] transition"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-3 text-gray-500 hover:text-[#e10600]"
      >
        {show ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  </div>
);
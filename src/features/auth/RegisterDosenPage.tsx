import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const RegisterDosenPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step === 1) return navigate("/register");
    setStep((prev) => prev - 1);
  };

  /* ================= VALIDASI ================= */
  const isStep1Valid = Boolean(
    form.nama &&
      form.tempat &&
      form.tanggal &&
      form.jk &&
      form.alamat &&
      form.nohp
  );

  const isStep2Valid = Boolean(
    form.nidn && form.fakultas && form.prodi
  );

  const isStep3Valid = Boolean(
    form.username &&
      form.password &&
      form.confirm &&
      form.password === form.confirm &&
      form.agree
  );

  /* ================= SUBMIT API ================= */
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        nama: form.nama,
        tempat_lahir: form.tempat,
        tanggal_lahir: form.tanggal,
        jenis_kelamin: form.jk,
        alamat: form.alamat,
        no_hp: form.nohp,
        nidn: form.nidn,
        fakultas: form.fakultas,
        prodi: form.prodi,
        username: form.username,
        password: form.password,
      };

      const response = await fetch(
        "https://sip3m-be.vercel.app/auth/register/dosen", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }

      // jika sukses
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center py-10">

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
          className="w-[650px] bg-white rounded-2xl shadow-md p-10 text-center"
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
        <div className="w-[650px] bg-white rounded-2xl shadow-md p-8">

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <Input
                  name="nama"
                  label="Nama Lengkap*"
                  value={form.nama}
                  onChange={handleChange}
                />
                <Input
                  name="tempat"
                  label="Tempat Lahir*"
                  value={form.tempat}
                  onChange={handleChange}
                />
                <Input
                  name="tanggal"
                  type="date"
                  label="Tanggal Lahir*"
                  value={form.tanggal}
                  onChange={handleChange}
                />

                <div>
                  <label className="text-sm">Jenis Kelamin*</label>
                  <div className="flex gap-4 mt-2 text-sm">
                    <label>
                      <input
                        type="radio"
                        name="jk"
                        value="L"
                        checked={form.jk === "L"}
                        onChange={handleChange}
                      />{" "}
                      Laki-laki
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="jk"
                        value="P"
                        checked={form.jk === "P"}
                        onChange={handleChange}
                      />{" "}
                      Perempuan
                    </label>
                  </div>
                </div>

                <Textarea
                  name="alamat"
                  label="Alamat*"
                  value={form.alamat}
                  onChange={handleChange}
                />
                <Input
                  name="nohp"
                  label="Nomor HP*"
                  value={form.nohp}
                  onChange={handleChange}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <Input
                  name="nidn"
                  label="NIDN*"
                  value={form.nidn}
                  onChange={handleChange}
                />
                <Select
                  name="fakultas"
                  label="Fakultas*"
                  value={form.fakultas}
                  onChange={handleChange}
                />
                <Select
                  name="prodi"
                  label="Program Studi*"
                  value={form.prodi}
                  onChange={handleChange}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <Input
                  name="username"
                  label="Username*"
                  value={form.username}
                  onChange={handleChange}
                />
                <Input
                  name="password"
                  type="password"
                  label="Password*"
                  value={form.password}
                  onChange={handleChange}
                />
                <Input
                  name="confirm"
                  type="password"
                  label="Konfirmasi Password*"
                  value={form.confirm}
                  onChange={handleChange}
                />

                <label className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                  />
                  Saya menyetujui kebijakan privasi
                </label>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 mt-8">
            <button
              onClick={prevStep}
              className="w-full border border-[#e10600] text-[#e10600] py-2 rounded-xl"
            >
              Kembali
            </button>

            <button
              onClick={() => {
                if (step === 3) return handleSubmit();
                nextStep();
              }}
              disabled={
                loading ||
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid)
              }
              className="w-full py-2 rounded-xl text-white bg-[#e10600]"
            >
              {loading
                ? "Memproses..."
                : step === 3
                ? "Daftar sebagai Dosen"
                : "Lanjut"}
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

const Select = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <select
      {...props}
      className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9]"
    >
      <option value="">Pilih</option>
      <option value="Fakultas 1">Fakultas 1</option>
      <option value="Fakultas 2">Fakultas 2</option>
    </select>
  </div>
);
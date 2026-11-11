import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerDosen, getFakultas, getProdiByFakultas, MasterData } from "./auth.api";
import { RegisterDosenPayload } from "./auth.types";
import axios from "axios";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import bg from "@/assets/images/img-login.png";
import logo from "@/assets/images/logo.png";

import type { RegisterDosenFieldErrors, RegisterDosenForm } from "./RegisterDosenPage.types";
import {
  AgreeCheckbox,
  FieldError,
  FieldLabel,
  FormAlert,
  PasswordField,
  RegisterStepper,
  SearchableSelect,
  TextAreaField,
  TextField,
} from "./RegisterShared";
import {
  mapBackendFieldErrors,
  stepHasErrors,
  validateStep1,
  validateStep2,
  validateStep3,
} from "./RegisterDosenPage.validation";

const STEPPER_LABELS = ["Data Diri", "Keakademian", "Akun & Keamanan"];

const RegisterDosenPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterDosenFieldErrors>({});

  // State untuk Data Master
  const [fakultasList, setFakultasList] = useState<MasterData[]>([]);
  const [prodiList, setProdiList] = useState<MasterData[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);

  const [form, setForm] = useState<RegisterDosenForm>({
    nama: "",
    tempat: "",
    tanggal: "",
    jk: "",
    alamat: "",
    nohp: "",
    nidn: "",
    fakultas: "", // Akan menyimpan ID dalam bentuk string sementara
    prodi: "",    // Akan menyimpan ID dalam bentuk string sementara
    username: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });

  // Fetch Fakultas saat komponen di-mount
  useEffect(() => {
    const fetchFakultas = async () => {
      try {
        const data = await getFakultas();
        setFakultasList(data);
      } catch (err) {
        console.error("Gagal mengambil data fakultas", err);
      }
    };
    fetchFakultas();
  }, []);

  // Fetch Prodi setiap kali Fakultas berubah
  useEffect(() => {
    if (!form.fakultas) {
      setProdiList([]);
      return;
    }

    const fetchProdi = async () => {
      setIsLoadingMaster(true);
      try {
        const data = await getProdiByFakultas(Number(form.fakultas));
        setProdiList(data);
      } catch (err) {
        console.error("Gagal mengambil data prodi", err);
      } finally {
        setIsLoadingMaster(false);
      }
    };

    fetchProdi();
  }, [form.fakultas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Bersihkan error field yang sedang diperbaiki
    setFieldErrors((prev) => {
      const key = name as keyof RegisterDosenForm;
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Handler khusus untuk komponen Combobox Shadcn
  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Jika yang diganti adalah fakultas, reset prodi agar tidak nyangkut data lama
      ...(name === "fakultas" && { prodi: "" }),
    }));

    setFieldErrors((prev) => {
      const key = name as keyof RegisterDosenForm;
      const next = { ...prev };
      delete next[key];
      if (name === "fakultas") delete next.prodi;
      return next;
    });
  };

  const nextStep = () => {
    if (step < 4) {
      setError("");
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setError("");
    if (step === 1) return navigate("/register");
    setStep((prev) => prev - 1);
  };

  const goNext = () => {
    const errors = step === 1 ? validateStep1(form) : validateStep2(form);
    setFieldErrors(errors);
    if (!stepHasErrors(errors)) nextStep();
  };

  const handleSubmit = async () => {
    const errors = validateStep3(form);
    setFieldErrors(errors);
    if (stepHasErrors(errors)) return;

    setLoading(true);
    setError("");

    try {
      const payload: RegisterDosenPayload = {
        name: form.nama,
        tempat_lahir: form.tempat,
        tanggal_lahir: form.tanggal,
        jenis_kelamin: form.jk,
        alamat: form.alamat,
        nomor_hp: form.nohp,
        nidn: form.nidn,
        // Konversi ke Number agar sesuai dengan relasi database Int di backend
        fakultas_id: Number(form.fakultas),
        program_studi_id: Number(form.prodi),
        username: form.username,
        password: form.password,
        email: form.email,
        konfirmasi_password: form.confirm,
      };

      await registerDosen(payload);
      setStep(4);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string; errors?: Record<string, string[] | undefined> }
          | undefined;

        // Tampilkan error per-field dari validasi backend (jika ada)
        if (data?.errors) setFieldErrors(mapBackendFieldErrors(data.errors));
        setError(data?.message || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center bg-cover bg-center px-4 py-8 sm:py-10"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay — seragam dengan halaman pilih register */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        {/* HEADER ber-logo — gaya RegisterPage */}
        <div className="mb-6 flex w-full items-center gap-4 rounded-[28px] bg-white px-6 py-4 shadow-xl">
          <img src={logo} alt="" className="w-14 shrink-0" />
          <div>
            <h1 className="text-[20px] font-bold tracking-wide text-gray-800">
              SISTEM INFORMASI LPPM
            </h1>
            <p className="text-[13px] font-semibold text-[#e10600]">
              Universitas Muhammadiyah Cirebon
            </p>
            <p className="text-[11px] text-gray-500">
              Registrasi Dosen — silakan lengkapi 3 langkah berikut
            </p>
          </div>
        </div>

        {/* SUKSES */}
        {step === 4 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100 sm:p-10"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check size={32} className="text-green-600" aria-hidden />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              Registrasi Berhasil
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Silakan menunggu verifikasi dari Ketua LPPM.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="h-11 w-full rounded-lg bg-[#e10600] text-white hover:bg-[#c10500]"
            >
              Kembali ke Beranda
            </Button>
          </motion.div>
        )}

        {/* FORM */}
        {step !== 4 && (
          <div className="w-full rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 sm:p-8">
            <FormAlert message={error} />

            <RegisterStepper labels={STEPPER_LABELS} current={step} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }} className="space-y-4">
                  <TextField name="nama" label="Nama Lengkap" required value={form.nama} onChange={handleChange} error={fieldErrors.nama} />
                  <TextField name="tempat" label="Tempat Lahir" required value={form.tempat} onChange={handleChange} error={fieldErrors.tempat} />
                  <TextField name="tanggal" type="date" label="Tanggal Lahir" required value={form.tanggal} onChange={handleChange} error={fieldErrors.tanggal} />

                  <div>
                    <FieldLabel label="Jenis Kelamin" required />
                    <div className="flex gap-4">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input type="radio" name="jk" value="Laki-laki" checked={form.jk === "Laki-laki"} onChange={handleChange} className="h-4 w-4 accent-[#e10600]" />
                        Laki-laki
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input type="radio" name="jk" value="Perempuan" checked={form.jk === "Perempuan"} onChange={handleChange} className="h-4 w-4 accent-[#e10600]" />
                        Perempuan
                      </label>
                    </div>
                    <FieldError error={fieldErrors.jk} />
                  </div>

                  <TextAreaField name="alamat" label="Alamat" value={form.alamat} onChange={handleChange} error={fieldErrors.alamat} />
                  <TextField name="nohp" label="Nomor HP" required value={form.nohp} onChange={handleChange} error={fieldErrors.nohp} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }} className="space-y-4">
                  <TextField name="nidn" label="NIDN" required value={form.nidn} onChange={handleChange} error={fieldErrors.nidn} />

                  {/* Searchable Dropdown Fakultas */}
                  <SearchableSelect
                    label="Fakultas"
                    required
                    options={fakultasList}
                    value={form.fakultas}
                    onChange={(val) => handleSelectChange("fakultas", val)}
                    placeholder="Cari Fakultas..."
                    error={fieldErrors.fakultas}
                  />

                  {/* Searchable Dropdown Prodi (Disabled jika fakultas belum dipilih) */}
                  <SearchableSelect
                    label="Program Studi"
                    required
                    options={prodiList}
                    value={form.prodi}
                    onChange={(val) => handleSelectChange("prodi", val)}
                    placeholder={isLoadingMaster ? "Memuat..." : "Cari Program Studi..."}
                    disabled={!form.fakultas}
                    error={fieldErrors.prodi}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }} className="space-y-4">
                  <TextField name="username" label="Username" required value={form.username} onChange={handleChange} error={fieldErrors.username} />
                  <TextField name="email" type="email" label="Email" required value={form.email} onChange={handleChange} error={fieldErrors.email} />
                  <PasswordField name="password" label="Password" required value={form.password} onChange={handleChange} error={fieldErrors.password} />
                  <PasswordField name="confirm" label="Konfirmasi Password" required value={form.confirm} onChange={handleChange} error={fieldErrors.confirm} />

                  <AgreeCheckbox name="agree" checked={form.agree} onChange={handleChange} error={fieldErrors.agree}>
                    Saya menyetujui kebijakan privasi
                  </AgreeCheckbox>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="h-11 w-full rounded-lg border-[#e10600] text-[#e10600] hover:bg-red-50"
                >
                  Kembali
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                <Button
                  type="button"
                  onClick={() => { if (step === 3) return handleSubmit(); goNext(); }}
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-[#e10600] text-white hover:bg-[#c10500]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
                      Memproses...
                    </>
                  ) : step === 3 ? (
                    "Daftar"
                  ) : (
                    "Lanjut"
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterDosenPage;

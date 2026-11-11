import { ChangeEvent, DragEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { registerReviewer } from "./auth.api";
import { RegisterReviewerPayload } from "./auth.types";
import {
  ApiErrorResponse,
  RegisterReviewerForm,
} from "./RegisterReviewerPage.types";
import { Button } from "@/components/ui/button";

import bg from "@/assets/images/img-login.png";
import logo from "@/assets/images/logo.png";
import {
  AgreeCheckbox,
  FieldLabel,
  FormAlert,
  PasswordField,
  RegisterStepper,
  TextAreaField,
  TextField,
} from "./RegisterShared";

const MAX_CV_SIZE_MB = 5;
const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;
const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_CV_EXTENSIONS = ["pdf", "doc", "docx"];

const isValidCvFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isMimeAllowed = ALLOWED_CV_MIME_TYPES.includes(file.type);
  const isExtAllowed = ALLOWED_CV_EXTENSIONS.includes(extension);

  return isMimeAllowed || isExtAllowed;
};

const RegisterReviewerPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<RegisterReviewerForm>({
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target;
    const { name, value } = target;
    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : value;

    setError("");
    setForm({
      ...form,
      [name]: nextValue,
    });
  };

  const handleFile = (file: File) => {
    setError("");

    if (!isValidCvFile(file)) {
      setError(
        "Format file CV tidak didukung. Hanya PDF, DOC, atau DOCX yang diperbolehkan.",
      );
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setError(`Ukuran file CV maksimal ${MAX_CV_SIZE_MB} MB.`);
      return;
    }

    setForm({ ...form, file });
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    handleFile(selectedFile);
  };

  const handleDropFile = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (!selectedFile) return;
    handleFile(selectedFile);
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

  const handleSubmit = async () => {
    if (!isStep3Valid || !form.file) return;

    setLoading(true);
    setError("");

    const payload: RegisterReviewerPayload = {
      name: form.nama.trim(),
      email: form.email.trim(),
      nomor_hp: form.nohp.trim(),
      instansi: form.instansi.trim(),
      bidang_keahlian: form.bidang.trim(),
      pengalaman_review: form.pengalaman.trim(),
      cv: form.file,
      username: form.username.trim(),
      password: form.password,
      konfirmasi_password: form.confirm,
    };

    try {
      await registerReviewer(payload);
      setStep(4);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as ApiErrorResponse | undefined;

        if (responseData?.errors) {
          const firstEntry = Object.values(responseData.errors)[0];
          if (Array.isArray(firstEntry) && firstEntry.length > 0) {
            setError(firstEntry[0]);
          } else if (typeof firstEntry === "string") {
            setError(firstEntry);
          } else {
            setError(responseData.message || err.message);
          }
        } else {
          setError(responseData?.message || err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat registrasi reviewer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center bg-cover bg-center px-4 py-8 sm:py-10"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay — seragam dengan halaman pilih register */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

      {/* HEADER ber-logo — gaya RegisterPage */}
      <div className="relative z-10 mb-6 flex w-full max-w-2xl items-center gap-4 rounded-[28px] bg-white px-6 py-4 shadow-xl">
        <img src={logo} alt="" className="w-14 shrink-0" />
        <div>
          <h1 className="text-[20px] font-bold tracking-wide text-gray-800">
            SISTEM INFORMASI LPPM
          </h1>
          <p className="text-[13px] font-semibold text-[#e10600]">
            Universitas Muhammadiyah Cirebon
          </p>
          <p className="text-[11px] text-gray-500">
            Registrasi Reviewer Eksternal — silakan lengkapi 3 langkah berikut
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 sm:p-8">
        <FormAlert message={error} />

        {/* STEP */}
        {step <= 3 && (
          <RegisterStepper
            labels={["Identitas", "Informasi Profesional", "Akun Login"]}
            current={step}
          />
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              {...variants}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-[16px] font-semibold mb-4">Identitas</h2>

              <div className="space-y-4">
                <TextField
                  name="nama"
                  label="Nama Lengkap"
                  required
                  onChange={handleChange}
                />
                <TextField
                  name="email"
                  type="email"
                  label="Email"
                  required
                  onChange={handleChange}
                />
                <TextField
                  name="nohp"
                  label="Nomor HP"
                  required
                  onChange={handleChange}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              {...variants}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-[16px] font-semibold mb-4">
                Informasi Profesional
              </h2>

              <div className="space-y-4">
                <TextField
                  name="instansi"
                  label="Instansi"
                  required
                  onChange={handleChange}
                />
                <TextField
                  name="bidang"
                  label="Bidang Keahlian"
                  required
                  onChange={handleChange}
                />
                <TextAreaField
                  name="pengalaman"
                  label="Pengalaman Review"
                  required
                  onChange={handleChange}
                />

                {/* DRAG DROP */}
                <motion.div whileHover={{ scale: 1.01 }} className="transition">
                  <FieldLabel label="Upload CV" required />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDropFile}
                    className={`mt-2 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
                    ${dragging
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
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileInputChange}
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
            <motion.div
              key="step3"
              {...variants}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-[16px] font-semibold mb-4">Informasi Akun</h2>

              <div className="space-y-4">
                <TextField
                  name="username"
                  label="Username"
                  required
                  onChange={handleChange}
                />

                <PasswordField
                  label="Password"
                  name="password"
                  required
                  onChange={handleChange}
                />

                <PasswordField
                  label="Konfirmasi Password"
                  name="confirm"
                  required
                  onChange={handleChange}
                />

                <AgreeCheckbox name="agree" onChange={handleChange}>
                  Saya menyetujui kebijakan privasi
                </AgreeCheckbox>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BUTTON */}
        {step <= 3 && (
          <div className="flex gap-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full"
            >
              <Button
                type="button"
                variant="outline"
                onClick={back}
                className="h-11 w-full rounded-lg border-[#e10600] text-[#e10600] hover:bg-red-50"
              >
                Kembali
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full"
            >
              <Button
                type="button"
                onClick={() => (step === 3 ? void handleSubmit() : next())}
                disabled={
                  loading ||
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 3 && !isStep3Valid)
                }
                className={`h-11 w-full rounded-lg text-white transition ${(step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 3 && !isStep3Valid) ||
                  loading
                  ? "bg-gray-300"
                  : "bg-[#e10600]"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2
                      className="mr-1.5 h-4 w-4 animate-spin"
                      aria-hidden
                    />
                    Mendaftarkan...
                  </>
                ) : step === 3 ? (
                  "Daftar sebagai Reviewer"
                ) : (
                  "Lanjut"
                )}
              </Button>
            </motion.div>
          </div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>
            <h2 className="mb-2 text-xl font-semibold">Registrasi Berhasil</h2>
            <p className="mb-6 text-sm text-gray-500">
              Registrasi Reviewer Eksternal berhasil. Akun Anda sedang menunggu
              verifikasi oleh Ketua LPPM.
            </p>
            <Button
              type="button"
              className="h-11 w-full rounded-lg bg-[#e10600] text-white hover:bg-[#c10500]"
              onClick={() => navigate("/")}
            >
              Kembali ke Login
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegisterReviewerPage;

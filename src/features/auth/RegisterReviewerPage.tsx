import { ChangeEvent, DragEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { registerReviewer } from "./auth.api";
import { RegisterReviewerPayload } from "./auth.types";
import {
  ApiErrorResponse,
  FormInputProps,
  FormTextareaProps,
  PasswordInputProps,
  RegisterReviewerForm,
} from "./RegisterReviewerPage.types";
import Button from "@/components/ui/button";

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

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center py-10">
      <h1 className="text-[24px] font-semibold text-gray-800">
        Registrasi Reviewer Eksternal
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Sistem Informasi LPPM Universitas Muhammadiyah Cirebon
      </p>

      <div className="w-162.5 bg-white rounded-2xl shadow-md p-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
                        ${step > num
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
              },
            )}
          </div>
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
                <Input
                  name="nama"
                  label="Nama Lengkap*"
                  onChange={handleChange}
                />
                <Input name="email" label="Email*" onChange={handleChange} />
                <Input name="nohp" label="Nomor HP*" onChange={handleChange} />
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
                <Input
                  name="instansi"
                  label="Instansi*"
                  onChange={handleChange}
                />
                <Input
                  name="bidang"
                  label="Bidang Keahlian*"
                  onChange={handleChange}
                />
                <Textarea
                  name="pengalaman"
                  label="Pengalaman Review*"
                  onChange={handleChange}
                />

                {/* DRAG DROP */}
                <motion.div whileHover={{ scale: 1.01 }} className="transition">
                  <label className="text-sm text-gray-600">Upload CV*</label>

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
                <Input
                  name="username"
                  label="Username*"
                  onChange={handleChange}
                />

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
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full"
            >
              <Button
                type="button"
                variant="outline"
                onClick={back}
                className="w-full border-[#e10600] text-[#e10600] hover:bg-red-50"
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
                className={`w-full text-white transition ${(step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 3 && !isStep3Valid) ||
                  loading
                  ? "bg-gray-300"
                  : "bg-[#e10600]"
                  }`}
              >
                {step === 3
                  ? loading
                    ? "Mendaftarkan..."
                    : "Daftar sebagai Reviewer"
                  : "Lanjut"}
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
              verifikasi oleh Admin LPPM.
            </p>
            <Button
              type="button"
              className="w-full bg-[#e10600] text-white"
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

/* COMPONENTS */

const Input = ({ label, ...props }: FormInputProps) => (
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

const Textarea = ({ label, ...props }: FormTextareaProps) => (
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

const PasswordInput = ({
  label,
  show,
  toggle,
  ...props
}: PasswordInputProps) => (
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

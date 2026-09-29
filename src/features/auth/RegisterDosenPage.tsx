import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerDosen, getFakultas, getProdiByFakultas, MasterData } from "./auth.api";
import { RegisterDosenPayload } from "./auth.types";
import axios from "axios";
import { CheckCircle, ChevronsUpDown, Check } from "lucide-react";

// Import komponen shadcn (Sesuaikan path-nya jika berbeda)
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

import type { InputProps, RegisterDosenForm, TextareaProps } from "./RegisterDosenPage.types";

const RegisterDosenPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  };

  // Handler khusus untuk komponen Combobox Shadcn
  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Jika yang diganti adalah fakultas, reset prodi agar tidak nyangkut data lama
      ...(name === "fakultas" && { prodi: "" }),
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step === 1) return navigate("/register");
    setStep((prev) => prev - 1);
  };

  const isStep1Valid = Boolean(form.nama && form.tempat && form.tanggal && form.jk && form.alamat && form.nohp);
  const isStep2Valid = Boolean(form.nidn && form.fakultas && form.prodi);
  const isStep3Valid = Boolean(form.username && form.email.includes("@") && form.password && form.confirm && form.password === form.confirm && form.agree);

  const handleSubmit = async () => {
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
        setError(err.response?.data?.message || err.message);
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
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center py-10">
      {step !== 4 && (
        <>
          <h1 className="text-[24px] font-semibold text-gray-800">Registrasi Dosen</h1>
          <p className="text-gray-500 text-sm mb-6">Sistem Informasi LPPM Universitas Muhammadiyah Cirebon</p>

          <div className="flex justify-center items-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-300 ${step === s ? "bg-[#e10600] text-white scale-110" : step > s ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"}`}>
                  {step > s ? <CheckCircle size={16} /> : s}
                </div>
                {s !== 3 && <div className={`w-10 h-[2px] ${step > s ? "bg-green-400" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
        </>
      )}

      {step === 4 && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-[500px] bg-white rounded-2xl shadow-md p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-semibold mb-3">Registrasi Berhasil</h2>
          <p className="text-gray-500 text-sm mb-6">Silakan menunggu verifikasi dari Admin LPPM.</p>
          <button onClick={() => navigate("/")} className="w-full bg-[#e10600] text-white py-3 rounded-xl hover:scale-105 transition-transform">
            Kembali ke Beranda
          </button>
        </motion.div>
      )}

      {step !== 4 && (
        <div className="w-[500px] bg-white rounded-2xl shadow-md p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }} className="space-y-4">
                <Input name="nama" label="Nama Lengkap*" value={form.nama} onChange={handleChange}/>
                <Input name="tempat" label="Tempat Lahir*" value={form.tempat} onChange={handleChange}/>
                <Input name="tanggal" type="date" label="Tanggal Lahir*" value={form.tanggal} onChange={handleChange}/>
                
                <div>
                  <label className="text-sm text-gray-600">Jenis Kelamin*</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="jk" value="Laki-laki" checked={form.jk === "Laki-laki"} onChange={handleChange} className="accent-[#e10600]" />
                      <span className="text-sm">Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="jk" value="Perempuan" checked={form.jk === "Perempuan"} onChange={handleChange} className="accent-[#e10600]" />
                      <span className="text-sm">Perempuan</span>
                    </label>
                  </div>
                </div>

                <Textarea name="alamat" label="Alamat*" value={form.alamat} onChange={handleChange}/>
                <Input name="nohp" label="Nomor HP*" value={form.nohp} onChange={handleChange}/>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }} className="space-y-4">
                <Input name="nidn" label="NIDN*" value={form.nidn} onChange={handleChange}/>
                
                {/* Searchable Dropdown Fakultas */}
                <SearchableSelect 
                  label="Fakultas*" 
                  options={fakultasList} 
                  value={form.fakultas} 
                  onChange={(val) => handleSelectChange("fakultas", val)}
                  placeholder="Cari Fakultas..."
                />

                {/* Searchable Dropdown Prodi (Disabled jika fakultas belum dipilih) */}
                <SearchableSelect 
                  label="Program Studi*" 
                  options={prodiList} 
                  value={form.prodi} 
                  onChange={(val) => handleSelectChange("prodi", val)}
                  placeholder={isLoadingMaster ? "Memuat..." : "Cari Program Studi..."}
                  disabled={!form.fakultas}
                />

              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }} className="space-y-4">
                <Input name="username" label="Username*" value={form.username} onChange={handleChange}/>
                <Input name="email" type="email" label="Email*" value={form.email} onChange={handleChange}/>
                <Input name="password" type="password" label="Password*" value={form.password} onChange={handleChange}/>
                <Input name="confirm" type="password" label="Konfirmasi Password*" value={form.confirm} onChange={handleChange}/>

                <label className="flex gap-2 text-sm">
                  <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
                  Saya menyetujui kebijakan privasi
                </label>

                {error && <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-500 text-sm">{error}</motion.p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 mt-8">
            <button onClick={prevStep} className="w-full border border-[#e10600] text-[#e10600] py-2 rounded-xl hover:bg-red-50 transition-colors">
              Kembali
            </button>
            <button
              onClick={() => { if (step === 3) return handleSubmit(); nextStep(); }}
              disabled={loading || (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)}
              className="w-full py-2 rounded-xl text-white bg-[#e10600] disabled:opacity-50 hover:bg-[#c10500] transition-colors"
            >
              {loading ? "Memproses..." : step === 3 ? "Daftar" : "Lanjut"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterDosenPage;

/* ================= CUSTOM COMPONENTS ================= */

const Input = ({ label, ...props }: InputProps) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input
      {...props}
      className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9] focus:outline-none focus:ring-2 focus:ring-[#e10600]/30 focus:border-[#e10600] transition"
    />
  </div>
);

const Textarea = ({ label, ...props }: TextareaProps) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <textarea
      {...props}
      className="w-full mt-1 px-4 py-2 border rounded-xl bg-[#f9f9f9] focus:outline-none focus:ring-2 focus:ring-[#e10600]/30 focus:border-[#e10600] transition"
    />
  </div>
);

// Komponen baru pengganti <Select> standar, menggunakan Shadcn UI Combobox
const SearchableSelect = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder,
  disabled = false
}: { 
  label: string; 
  options: MasterData[]; 
  value: string; 
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between px-4 py-2 border rounded-xl bg-[#f9f9f9] transition text-left",
              "focus:outline-none focus:ring-2 focus:ring-[#e10600]/30 focus:border-[#e10600]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            role="combobox"
            aria-expanded={open}
          >
            {value
              ? options.find((opt) => opt.id.toString() === value)?.nama
              : <span className="text-gray-500">{placeholder}</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-w-[400px] border-none shadow-lg">
          <Command>
            <CommandInput placeholder="Cari..." className="focus:ring-0 border-none" />
            <CommandList>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={opt.nama} // cmdk mencari berdasarkan value ini
                    onSelect={() => {
                      onChange(opt.id.toString());
                      setOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.nama}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
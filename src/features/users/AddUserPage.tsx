import {
  ArrowLeft,
  Save,
  CheckCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createUser } from "./Users.api";
import { CreateUserPayload, CreateUserRole } from "./users.types";
import axios from "axios";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CREATE_ROLE_OPTIONS: CreateUserRole[] = [
  "ADMIN_LPPM",
  "STAFF_LPPM",
  "DOSEN",
  "REVIEWER",
  "REVIEWER_EKSTERNAL",
];

export default function AddUserPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    username?: string;
    nidn_nip?: string;
  }>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
    roles: "" as CreateUserRole | "",
    nidn_nip: "",
    fakultas: "",
    program_studi: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: "",
    nomor_hp: "",
    is_active: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "email" || name === "username" || name === "nidn_nip") {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleRoleSelect = (role: CreateUserRole) => {
    setForm((prev) => ({
      ...prev,
      roles: role,
    }));
  };

  const validateForm = (): boolean => {
    setFieldErrors({});

    const trimmedName = form.name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setError("Nama lengkap minimal 3 karakter");
      return false;
    }

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail.includes("@")) {
      setError("Email tidak valid");
      return false;
    }

    if (!form.password || form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }

    if (form.password !== form.passwordConfirm) {
      setError("Password dan konfirmasi password tidak cocok");
      return false;
    }

    if (!form.roles) {
      setError("Pilih role pengguna");
      return false;
    }

    if (form.username && form.username.trim().length < 3) {
      setError("Username minimal 3 karakter");
      return false;
    }

    if (
      form.jenis_kelamin &&
      form.jenis_kelamin !== "Laki-laki" &&
      form.jenis_kelamin !== "Perempuan"
    ) {
      setError("Jenis kelamin harus Laki-laki atau Perempuan");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload: CreateUserPayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        roles: form.roles as CreateUserRole,
        username: form.username.trim() || undefined,
        nidn_nip: form.nidn_nip.trim() || undefined,
        fakultas: form.fakultas.trim() || undefined,
        program_studi: form.program_studi.trim() || undefined,
        tempat_lahir: form.tempat_lahir.trim() || undefined,
        tanggal_lahir: form.tanggal_lahir || undefined,
        jenis_kelamin: form.jenis_kelamin || undefined,
        alamat: form.alamat.trim() || undefined,
        nomor_hp: form.nomor_hp.trim() || undefined,
        is_active: form.is_active,
      };

      await createUser(payload);
      setSuccessMessage({
        name: form.name,
        email: form.email,
      });
      setShowSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as
          | {
            message?: string;
            errors?: Array<{ field?: string; message?: string }>;
            error?: { code?: string; field?: string };
          }
          | undefined;

        const message = responseData?.message || err.message;

        if (responseData?.errors?.length) {
          const nextFieldErrors: {
            email?: string;
            username?: string;
            nidn_nip?: string;
          } = {};

          responseData.errors.forEach((item) => {
            if (item.field === "email") {
              nextFieldErrors.email = item.message || "Email tidak valid";
            }
            if (item.field === "username") {
              nextFieldErrors.username = item.message || "Username tidak valid";
            }
            if (item.field === "nidn_nip") {
              nextFieldErrors.nidn_nip = item.message || "NIDN/NIP tidak valid";
            }
          });

          setFieldErrors(nextFieldErrors);
        } else if (err.response?.status === 409) {
          const conflictField = responseData?.error?.field;

          if (conflictField === "email") {
            setFieldErrors((prev) => ({
              ...prev,
              email: message || "Email sudah digunakan.",
            }));
          } else if (conflictField === "username") {
            setFieldErrors((prev) => ({
              ...prev,
              username: message || "Username sudah digunakan.",
            }));
          } else if (conflictField === "nidn_nip") {
            setFieldErrors((prev) => ({
              ...prev,
              nidn_nip: message || "NIDN/NIP sudah digunakan.",
            }));
          } else {
            const lowerMsg = (message || "").toLowerCase();
            if (lowerMsg.includes("email")) {
              setFieldErrors((prev) => ({
                ...prev,
                email: message || "Email sudah digunakan.",
              }));
            }
            if (lowerMsg.includes("username")) {
              setFieldErrors((prev) => ({
                ...prev,
                username: message || "Username sudah digunakan.",
              }));
            }
            if (lowerMsg.includes("nidn") || lowerMsg.includes("nip")) {
              setFieldErrors((prev) => ({
                ...prev,
                nidn_nip: message || "NIDN/NIP sudah digunakan.",
              }));
            }
          }
        } else if (err.response?.status === 400 && !responseData?.message) {
          setError("Data tidak valid. Periksa kembali input Anda.");
          return;
        }

        setError(message);
      } else {
        setError("Terjadi kesalahan saat membuat pengguna");
      }
      console.error("Error creating user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate("/users");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-12 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Pengguna Berhasil Ditambahkan!
          </h2>

          <p className="text-gray-500 text-sm mb-2">{successMessage?.name}</p>

          <p className="text-gray-400 text-xs mb-6">{successMessage?.email}</p>

          <p className="text-gray-500 text-xs">
            Mengalihkan ke daftar pengguna...
          </p>

          <div className="mt-6 flex justify-center">
            <Loader2 size={20} className="text-green-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 w-full max-w-3xl">
        <button
          onClick={() => navigate("/users")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Tambah Pengguna
          </h1>
          <p className="text-sm text-gray-500">
            Tambahkan akun pengguna baru ke sistem LPPM
          </p>
        </div>
      </div>

      {/* CARD FORM */}
      <Card className="w-full max-w-3xl rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <CardContent className="p-10">
          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAMA */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>

              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Dr. Ahmad Dahlan, M.Kom"
                className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>

              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@umc.ac.id"
                className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-invalid={Boolean(fieldErrors.email)}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* USERNAME */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username <span className="text-gray-400">(Opsional)</span>
              </label>

              <Input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="nama_pengguna"
                className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-invalid={Boolean(fieldErrors.username)}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* NIDN / NIP */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                NIDN / NIP <span className="text-gray-400">(Opsional)</span>
              </label>

              <Input
                type="text"
                name="nidn_nip"
                value={form.nidn_nip}
                onChange={handleChange}
                placeholder="Nomor Induk Dosen / Pegawai"
                className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-invalid={Boolean(fieldErrors.nidn_nip)}
              />
              {fieldErrors.nidn_nip && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.nidn_nip}
                </p>
              )}
            </div>

            {/* ROLE */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full justify-between bg-gray-50 font-normal border-red-800"
                  >
                    <span
                      className={form.roles ? "text-gray-900" : "text-gray-500"}
                    >
                      {form.roles
                        ? form.roles.replaceAll("_", " ")
                        : "Pilih Role"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  align="start"
                >
                  {CREATE_ROLE_OPTIONS.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onSelect={() => handleRoleSelect(role)}
                      className="cursor-pointer"
                    >
                      {role.replaceAll("_", " ")}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <input type="hidden" name="roles" value={form.roles} required />

              <p className="text-xs text-gray-400 mt-1">
                Hak akses akan disesuaikan dengan peran yang dipilih.
              </p>
            </div>

            {/* STATUS AKUN */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status Akun
              </label>

              <div className="flex gap-6 mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="radio"
                    name="is_active"
                    checked={form.is_active === true}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, is_active: true }))
                    }
                  />
                  Active
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="radio"
                    name="is_active"
                    checked={form.is_active === false}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, is_active: false }))
                    }
                  />
                  Non-Active
                </label>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>

                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 karakter"
                  className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>

                <Input
                  type="password"
                  name="passwordConfirm"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  required
                />
              </div>
            </div>

            {/* ADDITIONAL FIELDS */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Informasi Tambahan{" "}
                <span className="text-gray-400">(Opsional)</span>
              </h3>

              <div className="space-y-4">
                {/* FAKULTAS */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Fakultas
                  </label>

                  <Input
                    type="text"
                    name="fakultas"
                    value={form.fakultas}
                    onChange={handleChange}
                    placeholder="Contoh: Teknik"
                    className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                </div>

                {/* PROGRAM STUDI */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Program Studi
                  </label>

                  <Input
                    type="text"
                    name="program_studi"
                    value={form.program_studi}
                    onChange={handleChange}
                    placeholder="Contoh: Teknik Informatika"
                    className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                </div>

                {/* TEMPAT LAHIR */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tempat Lahir
                  </label>

                  <Input
                    type="text"
                    name="tempat_lahir"
                    value={form.tempat_lahir}
                    onChange={handleChange}
                    className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                </div>

                {/* TANGGAL LAHIR */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tanggal Lahir
                  </label>

                  <Input
                    type="date"
                    name="tanggal_lahir"
                    value={form.tanggal_lahir}
                    onChange={handleChange}
                    className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                </div>

                {/* JENIS KELAMIN */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Jenis Kelamin
                  </label>

                  <select
                    name="jenis_kelamin"
                    value={form.jenis_kelamin}
                    onChange={handleChange}
                    className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* ALAMAT */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Alamat
                  </label>

                  <Input
                    type="text"
                    name="alamat"
                    value={form.alamat}
                    onChange={handleChange}
                    placeholder="Jl. Merdeka No. 1"
                    className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                </div>

                {/* NOMOR HP */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nomor HP
                  </label>

                  <Input
                    type="text"
                    name="nomor_hp"
                    value={form.nomor_hp}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className="mt-2 w-full bg-gray-50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/users")}
                disabled={isLoading}
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Menyimpan..." : "Simpan Pengguna"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

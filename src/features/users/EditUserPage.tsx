import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, ChevronDown } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { updateUser, getUserById } from "./Users.api";
import { getFakultas, getProdiByFakultas, MasterData } from "@/features/auth/auth.api";
import { AppRole, APP_ROLES } from "@/constant/roles";
import { CreateUserPayload, User } from "./users.types";

const ROLE_OPTIONS: AppRole[] = [
  APP_ROLES.ADMIN_LPPM,
  APP_ROLES.STAFF_LPPM,
  APP_ROLES.DOSEN,
  APP_ROLES.REVIEWER,
  APP_ROLES.REVIEWER_EKSTERNAL,
];

export default function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = Number(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    roles: "" as AppRole | "",
    nidn_nip: "",
    // Disimpan sebagai STRING id ("1"), bukan nama, bukan objek {id,nama}
    fakultas: "",
    program_studi: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: "",
    nomor_hp: "",
    is_active: true,
  });

  // Data master fakultas / prodi (value = id, label = nama)
  const [fakultasList, setFakultasList] = useState<MasterData[]>([]);
  const [prodiList, setProdiList] = useState<MasterData[]>([]);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterError, setMasterError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchFakultas = async () => {
      try {
        const data = await getFakultas();
        if (!cancelled) setFakultasList(data);
      } catch {
        if (!cancelled) setMasterError("Gagal memuat daftar fakultas.");
      }
    };
    void fetchFakultas();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ambil prodi tiap fakultas berubah (termasuk saat prefill dari data user)
  useEffect(() => {
    if (!form.fakultas) {
      setProdiList([]);
      return;
    }
    let cancelled = false;
    const fetchProdi = async () => {
      setMasterLoading(true);
      try {
        const data = await getProdiByFakultas(Number(form.fakultas));
        if (!cancelled) {
          setProdiList(data);
          setMasterError(null);
        }
      } catch {
        if (!cancelled) setMasterError("Gagal memuat daftar program studi.");
      } finally {
        if (!cancelled) setMasterLoading(false);
      }
    };
    void fetchProdi();
    return () => {
      cancelled = true;
    };
  }, [form.fakultas]);

  useEffect(() => {
    if (!Number.isInteger(userId)) {
      setError("ID user tidak valid.");
      setIsLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await getUserById(userId);
        const user: User = res.data;
        setForm({
          name: user.name || "",
          email: user.email || "",
          username: user.username || "",
          password: "",
          roles: user.roles.roles || "",
          nidn_nip: user.nidn || "",
          // Prefill dari bentuk baru { id, nama } | null → simpan ID-nya sebagai string
          fakultas: user.fakultas ? String(user.fakultas.id) : "",
          program_studi: user.program_studi ? String(user.program_studi.id) : "",
          tempat_lahir: user.tempat_lahir || "",
          // BE mengirim ISO (1999-01-01T00:00:00.000Z); <input type="date"> butuh YYYY-MM-DD
          tanggal_lahir: user.tanggal_lahir
            ? String(user.tanggal_lahir).slice(0, 10)
            : "",
          jenis_kelamin: user.jenis_kelamin || "",
          alamat: user.alamat || "",
          nomor_hp: user.nomor_hp || "",
          is_active: user.is_active,
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Gagal mengambil detail user.",
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Gagal mengambil detail user.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, [userId]);

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
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Ganti fakultas → prodi lama tidak relevan
    if (name === "fakultas") {
      setForm((prev) => ({ ...prev, fakultas: value, program_studi: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // PUT /users/:id mewajibkan tanggal_lahir valid (YYYY-MM-DD).
    // Tanpa ini, simpan selalu 400 "Validation failed.".
    if (!form.tanggal_lahir.trim()) {
      setError("Tanggal lahir wajib diisi (format YYYY-MM-DD) — wajib oleh API untuk menyimpan user.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tanggal_lahir.trim())) {
      setError("Tanggal lahir harus format YYYY-MM-DD");
      return;
    }

    const payload: CreateUserPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      username: form.username.trim() || undefined,
      password: form.password || "",
      roles: form.roles as AppRole,
      nidn_nip: form.nidn_nip.trim() || undefined,
      // ID string; "" artinya cabut fakultas/prodi — dikirim eksplisit (lihat filter di bawah)
      fakultas: form.fakultas,
      program_studi: form.program_studi,
      tempat_lahir: form.tempat_lahir.trim() || undefined,
      // Wajib menurut validasi runtime BE (PUT /users/:id)
      tanggal_lahir: form.tanggal_lahir.trim(),
      jenis_kelamin: form.jenis_kelamin || undefined,
      alamat: form.alamat.trim() || undefined,
      nomor_hp: form.nomor_hp.trim() || undefined,
      is_active: form.is_active,
    };

    const updatePayload = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => {
        // fakultas/program_studi selalu ikut walau "" ("" = cabut menurut API)
        if (key === "fakultas" || key === "program_studi") return typeof value === "string";
        if (typeof value === "string") return value.length > 0;
        return value !== undefined && value !== null;
      }),
    ) as Partial<CreateUserPayload>;

    setIsSaving(true);
    try {
      await updateUser(userId, updatePayload);
      navigate("/users");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as
          | {
            message?: string;
            errors?: Array<{ field?: string; message?: string }>;
            error?: { field?: string };
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
            if (item.field === "email") nextFieldErrors.email = item.message;
            if (item.field === "username")
              nextFieldErrors.username = item.message;
            if (item.field === "nidn_nip")
              nextFieldErrors.nidn_nip = item.message;
          });
          setFieldErrors(nextFieldErrors);
        } else if (err.response?.status === 409) {
          const conflictField = responseData?.error?.field;
          if (conflictField === "email")
            setFieldErrors((prev) => ({ ...prev, email: message }));
          if (conflictField === "username")
            setFieldErrors((prev) => ({ ...prev, username: message }));
          if (conflictField === "nidn_nip")
            setFieldErrors((prev) => ({ ...prev, nidn_nip: message }));
        }
        setError(message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal memperbarui user.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat data user...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Edit Pengguna
          </h1>
          <p className="text-sm text-gray-500">
            Perbarui data user berdasarkan ID.
          </p>
        </div>
      </div>

      <Card className="w-full bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Informasi Pengguna</CardTitle>
          <CardDescription>
            Field bersifat opsional dan dapat diubah sebagian.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-10 pt-0">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.email)}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Username
              </label>
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.username)}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password Baru
              </label>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                placeholder="Kosongkan jika tidak diubah"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
              <div className="relative">
                <select
                  name="roles"
                  value={form.roles}
                  onChange={handleChange}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">Pilih Role</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  NIDN / NIP
                </label>
                <Input
                  name="nidn_nip"
                  value={form.nidn_nip}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.nidn_nip)}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                {fieldErrors.nidn_nip && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.nidn_nip}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status Akun
                </label>
                <div className="relative">
                  <select
                    name="is_active"
                    value={form.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_active: e.target.value === "true",
                      }))
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fakultas
                </label>
                <div className="relative">
                  <select
                    name="fakultas"
                    value={form.fakultas}
                    onChange={handleChange}
                    className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="">Pilih Fakultas</option>
                    {fakultasList.map((fak) => (
                      <option key={fak.id} value={String(fak.id)}>
                        {fak.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Program Studi
                </label>
                <div className="relative">
                  <select
                    name="program_studi"
                    value={form.program_studi}
                    onChange={handleChange}
                    disabled={!form.fakultas}
                    className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">
                      {!form.fakultas
                        ? "Pilih Fakultas terlebih dahulu"
                        : masterLoading
                          ? "Memuat program studi..."
                          : "Pilih Program Studi"}
                    </option>
                    {prodiList.map((prodi) => (
                      <option key={prodi.id} value={String(prodi.id)}>
                        {prodi.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
                {masterLoading && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <Loader2 size={11} className="animate-spin" /> Memuat program studi...
                  </p>
                )}
              </div>
            </div>

            {masterError && (
              <p className="text-xs text-red-600">{masterError}</p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/users")}
                disabled={isSaving}
                className="bg-gray-100 text-gray-700 rounded-xl px-6"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6"
              >
                <Save className="h-4 w-4" />{" "}
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

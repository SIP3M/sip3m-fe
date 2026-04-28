import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import axios from "axios";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { updateUser, getUserById } from "./Users.api";
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
    fakultas: "",
    program_studi: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: "",
    nomor_hp: "",
    is_active: true,
  });

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
          fakultas: user.fakultas || "",
          program_studi: user.program_studi || "",
          tempat_lahir: user.tempat_lahir || "",
          tanggal_lahir: user.tanggal_lahir || "",
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const payload: CreateUserPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      username: form.username.trim() || undefined,
      password: form.password || "",
      roles: form.roles as AppRole,
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

    const updatePayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => {
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
    <div className="flex flex-col items-center space-y-6 p-8">
      <div className="flex items-start gap-3 w-full max-w-3xl">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Edit Pengguna
          </h1>
          <p className="text-sm text-gray-500">
            Perbarui data user berdasarkan ID.
          </p>
        </div>
      </div>

      <Card className="w-full max-w-3xl rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-4">
          <CardTitle>Informasi Pengguna</CardTitle>
          <CardDescription>
            Field bersifat opsional dan dapat diubah sebagian.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.email)}
                className="mt-2 bg-gray-50"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.username)}
                className="mt-2 bg-gray-50"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password Baru
              </label>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-2 bg-gray-50"
                placeholder="Kosongkan jika tidak diubah"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                name="roles"
                value={form.roles}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm"
              >
                <option value="">Pilih Role</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  NIDN / NIP
                </label>
                <Input
                  name="nidn_nip"
                  value={form.nidn_nip}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.nidn_nip)}
                  className="mt-2 bg-gray-50"
                />
                {fieldErrors.nidn_nip && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.nidn_nip}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status Akun
                </label>
                <select
                  name="is_active"
                  value={form.is_active ? "true" : "false"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: e.target.value === "true",
                    }))
                  }
                  className="mt-2 w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/users")}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
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

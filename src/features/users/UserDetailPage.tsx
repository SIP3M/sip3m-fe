import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserById } from "./Users.api";
import { User } from "./users.types";

export default function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      setError("ID user tidak valid.");
      setIsLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await getUserById(userId);
        setUser(res.data);
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
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Memuat detail pengguna...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-red-600">
          {error || "User tidak ditemukan."}
        </p>
        <Button variant="outline" onClick={() => navigate("/users")}>
          Kembali
        </Button>
      </div>
    );
  }

  const details = [
    ["Nama", user.name],
    ["Email", user.email],
    ["Username", user.username || "-"],
    ["Role", user.roles.roles],
    ["NIDN/NIP", user.nidn || "-"],
    ["Fakultas", user.fakultas || "-"],
    ["Program Studi", user.program_studi || "-"],
    ["Tempat Lahir", user.tempat_lahir || "-"],
    ["Tanggal Lahir", user.tanggal_lahir || "-"],
    ["Jenis Kelamin", user.jenis_kelamin || "-"],
    ["Alamat", user.alamat || "-"],
    ["Nomor HP", user.nomor_hp || "-"],
    ["Status", user.is_active ? "Active" : "Inactive"],
  ] as const;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Detail Pengguna
          </h1>
          <p className="text-sm text-gray-500">
            Informasi lengkap akun pengguna.
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

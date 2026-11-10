import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Loader2,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  createRole,
  deleteRole,
  getPermissions,
  getRolePermissions,
  getRoles,
  PermissionItem,
  RoleItem,
} from "../roles/roles.api";
import RolePermissionDetail from "./RolePermissionDetail";

type View =
  | { mode: "list" }
  | { mode: "detail"; roleId: number }
  | { mode: "create" }
  | { mode: "full" };

/** Warna badge per role bawaan (role baru memakai abu-abu). */
const BADGE_CLASS: Record<string, string> = {
  ADMIN_LPPM: "bg-red-100 text-red-700",
  ADMIN_SISTEM: "bg-gray-100 text-gray-700",
  STAFF_LPPM: "bg-blue-100 text-blue-700",
  DOSEN: "purple-50 text-purple-700",
  REVIEWER: "bg-amber-50 text-amber-700",
  REVIEWER_EKSTERNAL: "bg-orange-50 text-orange-700",
  MAHASISWA: "bg-green-50 text-green-700",
};

const badgeFor = (nama: string) =>
  BADGE_CLASS[nama] || "bg-slate-100 text-slate-700";

/**
 * Master Data — Role & Permission.
 * - Daftar role (card grid) + jumlah pengguna/izin
 * - Detail: matriks toggle izin per grup (PUT /roles/:id/permissions)
 * - Buat role baru (nama format A-Z0-9_, salin izin dari role lain)
 * - Matriks Penuh: tabel read-only role × seluruh izin
 */
export default function RolePermission() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Form buat role ──────────────────────────────────────────────────
  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    salin_dari_role_id: "",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Matriks penuh (read-only) ──────────────────────────────────────
  const [fullLoading, setFullLoading] = useState(false);
  const [fullError, setFullError] = useState<string | null>(null);
  const [fullPermissions, setFullPermissions] = useState<PermissionItem[]>([]);
  const [fullMatrix, setFullMatrix] = useState<
    Record<number, Set<string>>
  >({});

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat daftar role.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  // Muat matriks penuh saat masuk view "full"
  useEffect(() => {
    if (view.mode !== "full") return;
    let cancelled = false;
    setFullLoading(true);
    setFullError(null);
    (async () => {
      try {
        const [perms, roleList] = await Promise.all([
          getPermissions(),
          roles.length > 0 ? Promise.resolve(roles) : getRoles(),
        ]);
        const matrices = await Promise.all(
          roleList.map((role) =>
            getRolePermissions(role.id).then((m) => ({
              id: role.id,
              aktif: new Set(
                m.permissions.filter((p) => p.aktif).map((p) => p.kode),
              ),
            })),
          ),
        );
        if (cancelled) return;
        const matrix: Record<number, Set<string>> = {};
        for (const m of matrices) matrix[m.id] = m.aktif;
        setFullPermissions(perms);
        setFullMatrix(matrix);
      } catch (err: any) {
        if (!cancelled) {
          setFullError(
            err?.response?.data?.message || "Gagal memuat matriks penuh.",
          );
        }
      } finally {
        if (!cancelled) setFullLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view.mode, roles]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nama = form.nama.trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9_]*$/.test(nama)) {
      setFormError(
        "Nama role huruf besar, angka, dan underscore saja (contoh: KETUA_LPPM).",
      );
      return;
    }

    setCreating(true);
    try {
      const res = await createRole({
        nama,
        deskripsi: form.deskripsi.trim() || null,
        salin_dari_role_id: form.salin_dari_role_id
          ? Number(form.salin_dari_role_id)
          : null,
      });
      await fetchRoles();
      setForm({ nama: "", deskripsi: "", salin_dari_role_id: "" });
      setView({ mode: "detail", roleId: res.data.id });
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Gagal membuat role.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (role: RoleItem) => {
    const ok = window.confirm(
      `Hapus role "${role.nama}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!ok) return;
    setError(null);
    try {
      await deleteRole(role.id);
      await fetchRoles();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menghapus role.");
    }
  };

  // ═════════════════════════ VIEW: DETAIL ═══════════════════════════
  if (view.mode === "detail") {
    return (
      <RolePermissionDetail
        roleId={view.roleId}
        onBack={() => setView({ mode: "list" })}
        onSaved={() => void fetchRoles()}
      />
    );
  }

  // ═════════════════════════ VIEW: BUAT ROLE ════════════════════════
  if (view.mode === "create") {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <button
            type="button"
            onClick={() => setView({ mode: "list" })}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer mb-2"
          >
            <ArrowLeft size={16} /> Kembali ke daftar role
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Buat Role Baru</h1>
          <p className="text-sm text-gray-500 mt-1">
            Role baru otomatis memakai tampilan External dan hak aksesnya
            diatur lewat matriks izin.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5"
        >
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Nama Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nama: e.target.value }))
              }
              placeholder="contoh: KETUA_LPPM"
              className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono uppercase"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Huruf besar, angka, dan underscore saja (minimal 3 karakter).
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              value={form.deskripsi}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
              }
              placeholder="Jelaskan peran dan tanggung jawab role ini..."
              rows={3}
              maxLength={255}
              className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Salin Izin Dari Role (opsional)
            </label>
            <select
              value={form.salin_dari_role_id}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  salin_dari_role_id: e.target.value,
                }))
              }
              className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">— Tanpa salinan (mulai dari nol) —</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nama} ({role.jumlah_izin} izin)
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Izin hasil salinan bisa disesuaikan lagi lewat matriks izin.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {creating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Buat Role
            </button>
            <button
              type="button"
              onClick={() => setView({ mode: "list" })}
              className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-xl shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ═════════════════════════ VIEW: MATRIKS PENUH ════════════════════
  if (view.mode === "full") {
    return (
      <div className="space-y-5">
        <div>
          <button
            type="button"
            onClick={() => setView({ mode: "list" })}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer mb-2"
          >
            <ArrowLeft size={16} /> Kembali ke daftar role
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Matriks Penuh</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan seluruh izin × role (read-only). Klik Detail pada kartu
            role untuk mengubah izinnya.
          </p>
        </div>

        {fullLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            <p className="text-sm text-gray-500">Memuat matriks penuh...</p>
          </div>
        )}

        {fullError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {fullError}
          </div>
        )}

        {!fullLoading && !fullError && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 min-w-64">
                    Izin
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className="px-3 py-3 font-semibold text-gray-700 text-center min-w-28"
                    >
                      {role.nama}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fullPermissions.map((perm) => (
                  <tr key={perm.kode} className="border-b border-gray-50">
                    <td className="px-4 py-2.5">
                      <span className="block text-gray-900">{perm.nama}</span>
                      <span className="block text-xs text-gray-400 font-mono">
                        {perm.kode}
                      </span>
                    </td>
                    {roles.map((role) => {
                      const on = fullMatrix[role.id]?.has(perm.kode);
                      return (
                        <td key={role.id} className="px-3 py-2.5 text-center">
                          {on ? (
                            <ShieldCheck
                              size={16}
                              className="inline text-red-600"
                            />
                          ) : (
                            <span className="inline-block w-4 text-gray-300">
                              –
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════ VIEW: DAFTAR (LIST) ════════════════════
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role & Permission</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola role dan izin akses pengguna dalam sistem LPPM
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setView({ mode: "full" })}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-xl shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Eye size={16} />
            Matriks Penuh
          </button>
          <button
            type="button"
            onClick={() => setView({ mode: "create" })}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Tambah Role
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          <p className="text-sm text-gray-500">Memuat daftar role...</p>
        </div>
      )}

      {/* DAFTAR ROLE */}
      {!loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                  {role.is_system ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <Shield size={18} />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeFor(role.nama)}`}
                  >
                    {role.nama}
                  </span>
                  {!role.is_system && role.jumlah_pengguna === 0 && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(role)}
                      title="Hapus role"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-4 min-h-[40px] text-sm leading-relaxed text-gray-500">
                {role.deskripsi || "Tanpa deskripsi"}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    <span className="font-bold text-gray-900">
                      {role.jumlah_pengguna.toLocaleString("id-ID")}
                    </span>{" "}
                    pengguna
                  </span>
                  <span>
                    <span className="font-bold text-gray-900">
                      {role.jumlah_izin}
                    </span>{" "}
                    izin
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setView({ mode: "detail", roleId: role.id })}
                  className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Detail
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && roles.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
          Belum ada role.
        </div>
      )}
    </div>
  );
}

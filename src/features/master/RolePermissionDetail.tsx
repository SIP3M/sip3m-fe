import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Save,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  getRolePermissions,
  updateRolePermissions,
  RoleMatrixResponse,
} from "../roles/roles.api";

interface Props {
  roleId: number;
  onBack: () => void;
  onSaved?: () => void;
}

interface PermissionGroup {
  grup: string;
  items: Array<{ kode: string; nama: string; aktif: boolean }>;
}

/**
 * Matriks izin satu role — toggle per izin, dikelompokkan per grup.
 * Simpan → PUT /roles/:id/permissions (replace seluruh set izin).
 */
export default function RolePermissionDetail({ roleId, onBack, onSaved }: Props) {
  const [data, setData] = useState<RoleMatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRolePermissions(roleId)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setSelected(
          new Set(
            res.permissions.filter((p) => p.aktif).map((p) => p.kode),
          ),
        );
        setDirty(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Gagal memuat matriks izin.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roleId]);

  const groups: PermissionGroup[] = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, PermissionGroup>();
    for (const p of data.permissions) {
      let group = map.get(p.grup);
      if (!group) {
        group = { grup: p.grup, items: [] };
        map.set(p.grup, group);
      }
      group.items.push({ kode: p.kode, nama: p.nama, aktif: p.aktif });
    }
    return [...map.values()];
  }, [data]);

  const toggle = (kode: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kode)) next.delete(kode);
      else next.add(kode);
      return next;
    });
    setDirty(true);
  };

  const toggleGroup = (group: PermissionGroup) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = group.items.every((item) => next.has(item.kode));
      for (const item of group.items) {
        if (allOn) next.delete(item.kode);
        else next.add(item.kode);
      }
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateRolePermissions(roleId, [...selected]);
      setDirty(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
      onSaved?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan izin role.");
    } finally {
      setSaving(false);
    }
  };

  const role = data?.role;
  const readOnly = Boolean(role?.is_system);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        <p className="text-sm text-gray-500">Memuat matriks izin...</p>
      </div>
    );
  }

  if (!data || !role) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <ArrowLeft size={16} /> Kembali ke daftar role
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error || "Role tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer mb-2"
          >
            <ArrowLeft size={16} /> Kembali ke daftar role
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-red-600" size={22} />
            {role.nama}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {role.deskripsi || "Tanpa deskripsi"}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={14} />
              <span className="font-bold text-gray-900">
                {role.jumlah_pengguna}
              </span>{" "}
              pengguna
            </span>
            <span>
              <span className="font-bold text-gray-900">{selected.size}</span>{" "}
              dari {data.permissions.length} izin aktif
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-xl shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving || readOnly}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* INFO */}
      {readOnly && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
          Role sistem tidak dapat diubah — ADMIN_SISTEM selalu memiliki
          seluruh izin (superuser).
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {savedFlash && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Check size={16} /> Izin role berhasil disimpan.
        </div>
      )}
      {dirty && !readOnly && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
          Ada perubahan yang belum disimpan.
        </div>
      )}

      {/* GRUP IZIN */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {groups.map((group) => {
          const allOn = group.items.every((item) => selected.has(item.kode));
          const onCount = group.items.filter((item) =>
            selected.has(item.kode),
          ).length;

          return (
            <div
              key={group.grup}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {group.grup}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {onCount}/{group.items.length} izin aktif
                  </p>
                </div>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleGroup(group)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                    allOn
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {allOn ? "Matikan semua" : "Nyalakan semua"}
                </button>
              </div>

              <div className="mt-3 space-y-1">
                {group.items.map((item) => {
                  const on = selected.has(item.kode);
                  return (
                    <button
                      key={item.kode}
                      type="button"
                      disabled={readOnly}
                      onClick={() => toggle(item.kode)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer disabled:cursor-not-allowed ${
                        on ? "bg-red-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        <span
                          className={`block text-sm ${on ? "text-gray-900 font-medium" : "text-gray-600"}`}
                        >
                          {item.nama}
                        </span>
                        <span className="block text-xs text-gray-400 font-mono">
                          {item.kode}
                        </span>
                      </span>
                      <span
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                          on ? "bg-red-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            on ? "translate-x-[18px]" : "translate-x-[2px]"
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

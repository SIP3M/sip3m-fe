import { api } from "@/services/api";

// ─── Types (sinkron dengan src/roles/ di backend) ──────────────────────

export interface RoleItem {
  id: number;
  nama: string;
  deskripsi: string | null;
  is_system: boolean;
  dashboard_path: string | null;
  jumlah_pengguna: number;
  jumlah_izin: number;
}

export interface PermissionItem {
  id: number;
  kode: string;
  nama: string;
  grup: string;
}

/** Permission + status aktif untuk satu role (matriks izin). */
export interface RolePermissionItem extends PermissionItem {
  aktif: boolean;
}

export interface CreateRolePayload {
  nama: string;
  deskripsi?: string | null;
  salin_dari_role_id?: number | null;
  permissions?: string[];
}

export interface RoleMatrixResponse {
  role: RoleItem;
  permissions: RolePermissionItem[];
}

// ─── Roles ─────────────────────────────────────────────────────────────

/** Daftar role (untuk dropdown User Management & halaman Role & Permission). */
export const getRoles = async (): Promise<RoleItem[]> => {
  const res = await api.get<{ message?: string; data: RoleItem[] }>("/roles");
  return res.data.data ?? [];
};

export const createRole = async (payload: CreateRolePayload) => {
  const res = await api.post<{ message?: string; data: RoleItem }>(
    "/roles",
    payload,
  );
  return res.data;
};

export const updateRole = async (
  id: number,
  payload: { nama?: string; deskripsi?: string | null; dashboard_path?: string | null },
) => {
  const res = await api.patch<{ message?: string; data: RoleItem }>(
    `/roles/${id}`,
    payload,
  );
  return res.data;
};

export const deleteRole = async (id: number) => {
  const res = await api.delete<{ message?: string; data: unknown }>(
    `/roles/${id}`,
  );
  return res.data;
};

// ─── Permission catalog & matriks ──────────────────────────────────────

export const getPermissions = async (): Promise<PermissionItem[]> => {
  const res = await api.get<{ message?: string; data: PermissionItem[] }>(
    "/permissions",
  );
  return res.data.data ?? [];
};

/** Matriks izin satu role: SELURUH katalog izin + flag `aktif` per izin. */
export const getRolePermissions = async (
  roleId: number,
): Promise<RoleMatrixResponse> => {
  const res = await api.get<{ message?: string; data: RoleMatrixResponse }>(
    `/roles/${roleId}/permissions`,
  );
  return res.data.data;
};

/** Replace seluruh set izin role (kirim daftar kode yang aktif). */
export const updateRolePermissions = async (
  roleId: number,
  permissions: string[],
) => {
  const res = await api.put<{ message?: string; data: unknown }>(
    `/roles/${roleId}/permissions`,
    { permissions },
  );
  return res.data;
};

import { useCallback } from "react";
import { useAuthStore } from "./auth.store";
import { PermissionKode } from "@/constant/permissions";

/**
 * Hak akses berbasis permission dinamis (dari GET /auth/me / login).
 *
 * - ADMIN_SISTEM = superuser: backend mengirim seluruh kode izin,
 *   jadi hasPermission() otomatis true untuk semua izin.
 * - Role lain: izin sesuai tabel role_permissions (hasil edit di
 *   halaman Role & Permission).
 *
 * Contoh:
 *   const { hasPermission } = usePermission();
 *   if (!hasPermission(PERMISSIONS.PENGGUNA_TAMBAH)) return null;
 */
export const usePermission = () => {
  const user = useAuthStore((state) => state.user);
  const permissions = user?.permissions;

  const hasPermission = useCallback(
    (kode: PermissionKode | string): boolean => {
      if (!permissions || permissions.length === 0) return false;
      return permissions.includes(kode);
    },
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (kodes: Array<PermissionKode | string>): boolean => {
      if (!permissions || permissions.length === 0) return false;
      return kodes.some((kode) => permissions.includes(kode));
    },
    [permissions],
  );

  return { hasPermission, hasAnyPermission, permissions: permissions ?? [] };
};

export default usePermission;

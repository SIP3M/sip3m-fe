import { User } from "./auth.types";

/**
 * Penentu halaman tujuan setelah login (dipakai LoginPage & OauthCallback).
 *
 * Sumber utama: `roles.dashboard_path` dari database — diatur admin lewat
 * halaman Role & Permission, jadi role baru TIDAK perlu perubahan kode.
 *
 * Cadangan bila `dashboard_path` kosong: diturunkan dari izin yang dimiliki
 * user (bukan dari nama role). Urutan penting — dashboard manajerial dulu,
 * lalu domain paling spesifik, dan `proposal.review` sebelum `proposal.lihat`.
 */
const PERMISSION_FALLBACK: Array<{ kodes: string[]; path: string }> = [
  { kodes: ["dashboard.admin"], path: "/admin-dashboard" },
  { kodes: ["dashboard.staff"], path: "/staff-lppm/staff-dashboard" },
  {
    kodes: [
      "keuangan.lihat",
      "keuangan.cairkan",
      "keuangan.setujui",
      "keuangan.export",
    ],
    path: "/keuangan-dashboard",
  },
  { kodes: ["proposal.saya", "dosen.profil"], path: "/dosen-dashboard" },
  {
    kodes: ["kkm.kelompok.saya", "kkm.logbook.saya"],
    path: "/mahasiswa-dashboard",
  },
  { kodes: ["proposal.review"], path: "/reviewer-dashboard" },
  { kodes: ["proposal.lihat"], path: "/reviewer-eksternal-dashboard" },
];

/** Tujuan akhir bila role belum punya dashboard dan izinnya tidak dikenali. */
export const DASHBOARD_PATH_UNSET =
  "/unauthorized?reason=dashboard-belum-diatur";

export const resolveDashboardPath = (
  user?: Partial<Pick<User, "roles" | "permissions">> | null,
): string => {
  const stored = user?.roles?.dashboard_path?.trim();
  if (stored) return stored.startsWith("/") ? stored : `/${stored}`;

  const permissions = user?.permissions ?? [];
  if (permissions.length > 0) {
    for (const rule of PERMISSION_FALLBACK) {
      if (rule.kodes.some((kode) => permissions.includes(kode))) {
        return rule.path;
      }
    }
  }

  return DASHBOARD_PATH_UNSET;
};

export default resolveDashboardPath;

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Activity,
  Wallet,
  Globe,
  ClipboardList,
  ClipboardCheck,
  Settings,
  FlaskConical,
  ChevronDown,
  LogOut,
  Calendar,
  MapPin,
  UserPlus,
  Megaphone,
  CheckSquare,
  Upload,
  User,
  History,
  Construction,
  BookOpen,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { APP_ROLES } from "@/constant/roles";

type Tab = "penelitian" | "kkm";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  // Path lain yang juga dianggap "aktif" untuk menu ini (mis. halaman tambah/detail)
  alsoActive?: string[];
}

interface MenuGroup {
  key: string;
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}

interface ModuleConfig {
  dashboard?: MenuItem;
  // Awalan URL yang menandakan user sedang berada di modul ini (dipakai menentukan tab aktif)
  prefixes?: string[];
  groups: MenuGroup[];
}

interface RoleConfig {
  penelitian: ModuleConfig;
  // Jika kosong, toggle Penelitian/KKM disembunyikan untuk role tersebut
  kkm?: ModuleConfig;
  // Menu yang tampil di kedua tab (mis. Profil Saya)
  common?: MenuItem[];
}

// =====================================================================
// KONFIGURASI MENU PER ROLE
// Menambah/mengubah menu cukup di sini, komponen Sidebar di bawah tidak
// perlu diubah.
// =====================================================================
const ROLE_CONFIGS: Record<string, RoleConfig> = {
  // ---------------------------------------------------------------- ADMIN
  [APP_ROLES.ADMIN_LPPM]: {
    penelitian: {
      dashboard: { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
      groups: [
        {
          key: "research",
          label: "MANAJEMEN PENELITIAN",
          icon: FlaskConical,
          items: [
            { name: "Manajemen Pengguna", icon: Users, path: "/users" },
            { name: "Daftar Proposal", icon: FileText, path: "/proposals" },
            { name: "Plotting Reviewer", icon: UserCheck, path: "/plotting-reviewer" },
            { name: "Monitoring Proyek", icon: Activity, path: "/monitoring-project" },
            { name: "Keuangan & Hibah", icon: Wallet, path: "/finance" },
            { name: "Repository Publik", icon: Globe, path: "/repository-publik" },
            { name: "Audit Logs", icon: ClipboardList, path: "/logs" },
          ],
        },
        {
          key: "system",
          label: "SYSTEM",
          icon: Settings,
          items: [{ name: "Pengaturan Sistem", icon: Settings, path: "/settings" }],
        },
      ],
    },
    kkm: {
      dashboard: {
        name: "Dashboard KKM",
        icon: LayoutDashboard,
        path: "/admin-dashboard/kkm/dashboard",
      },
      // "/kkm" ikut dihitung karena halaman tambah/detail periode memakai path /kkm/periode/...
      prefixes: ["/admin-dashboard/kkm", "/kkm"],
      groups: [
        {
          key: "kkm",
          label: "MANAJEMEN KKM",
          icon: Users,
          items: [
            {
              name: "Periode KKM",
              icon: Calendar,
              path: "/admin-dashboard/kkm/periode",
              alsoActive: ["/kkm/periode"],
            },
            { name: "Peserta KKM", icon: Users, path: "/admin-dashboard/kkm/peserta" },
            { name: "Kelompok KKM", icon: UserCheck, path: "/admin-dashboard/kkm/kelompok" },
            { name: "Lokasi / Desa KKM", icon: MapPin, path: "/admin-dashboard/kkm/lokasi" },
            { name: "DPL KKM", icon: UserPlus, path: "/admin-dashboard/kkm/dpl" },
            { name: "Generate Kelompok", icon: CheckSquare, path: "/admin-dashboard/kkm/generate" },
            { name: "Monitoring KKM", icon: Activity, path: "/admin-dashboard/kkm/monitoring" },
            { name: "Laporan KKM", icon: FileText, path: "/admin-dashboard/kkm/laporan" },
            { name: "Pengumuman KKM", icon: Megaphone, path: "/admin-dashboard/kkm/pengumuman" },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------- STAFF
  [APP_ROLES.STAFF_LPPM]: {
    penelitian: {
      dashboard: {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/staff-lppm/staff-dashboard",
      },
      groups: [
        {
          key: "research",
          label: "MANAJEMEN PENELITIAN",
          icon: FlaskConical,
          items: [
            { name: "Verifikasi Proposal", icon: ClipboardCheck, path: "/staff-lppm/verifikasi-proposal" },
            { name: "Plotting Reviewer", icon: UserCheck, path: "/staff-lppm/plotting-reviewer" },
            { name: "Monitoring Proyek", icon: Activity, path: "/staff-lppm/monitoring-project" },
            { name: "Keuangan & Hibah", icon: Wallet, path: "/staff-lppm/finance" },
            { name: "Repository Publik", icon: Globe, path: "/staff-lppm/repository-publik" },
            { name: "Audit Logs", icon: ClipboardList, path: "/staff-lppm/logs" },
          ],
        },
      ],
    },
    // Menu KKM staff belum ditentukan — tab tampil dengan placeholder
    kkm: {
      groups: [],
    },
  },

  // ---------------------------------------------------------------- DOSEN
  [APP_ROLES.DOSEN]: {
    penelitian: {
      dashboard: { name: "Dashboard", icon: LayoutDashboard, path: "/dosen-dashboard" },
      groups: [
        {
          key: "research",
          label: "PENELITIAN SAYA",
          icon: FlaskConical,
          items: [
            { name: "Proposal Saya", icon: FileText, path: "/dosen-dashboard/proposals" },
            { name: "Proyek Saya", icon: Activity, path: "/dosen-dashboard/project-dosen" },
            { name: "Laporan Penelitian", icon: Upload, path: "/dosen-dashboard/laporan" },
          ],
        },
      ],
    },
    kkm: {
      dashboard: {
        name: "Dashboard KKM",
        icon: LayoutDashboard,
        path: "/dosen-dashboard/kkm/dashboard",
      },
      prefixes: ["/dosen-dashboard/kkm"],
      groups: [
        {
          key: "kkm",
          label: "BIMBINGAN KKM",
          icon: Users,
          items: [
            { name: "Kelompok Bimbingan", icon: Users, path: "/dosen-dashboard/kkm/kelompok-bimbingan" },
            { name: "Monitoring KKM", icon: ClipboardCheck, path: "/dosen-dashboard/kkm/monitoring" },
            { name: "Validasi Logbook", icon: BookOpen, path: "/dosen-dashboard/kkm/validasi-logbook" },
            { name: "Laporan KKM", icon: FileText, path: "/dosen-dashboard/kkm/laporan" },
            { name: "Penilaian Mahasiswa", icon: Star, path: "/dosen-dashboard/kkm/penilaian" },
            { name: "Pengumuman", icon: Megaphone, path: "/dosen-dashboard/kkm/pengumuman" },
          ],
        },
      ],
    },
    common: [{ name: "Profil Saya", icon: User, path: "/dosen-dashboard/profile" }],
  },

  // ------------------------------------------------------------- REVIEWER
  // SESUAIKAN: label & ikon di bawah saya ambil dari nama route di router.tsx.
  // Kalau menu reviewer di sidebar lama kamu berbeda, salin dari situ.
  [APP_ROLES.REVIEWER]: {
    penelitian: {
      dashboard: { name: "Dashboard", icon: LayoutDashboard, path: "/reviewer-dashboard" },
      groups: [
        {
          key: "review",
          label: "REVIEW",
          icon: FlaskConical,
          items: [
            { name: "Proposal Saya", icon: FileText, path: "/reviewer-dashboard/proposal-saya" },
            { name: "Riwayat Review", icon: History, path: "/reviewer-dashboard/riwayat-review" },
          ],
        },
      ],
    },
  },

  // ------------------------------------------------------ REVIEWER EKSTERNAL
  // SESUAIKAN: sama seperti reviewer, label diambil dari nama route.
  [APP_ROLES.REVIEWER_EKSTERNAL]: {
    penelitian: {
      dashboard: {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/reviewer-eksternal-dashboard",
      },
      groups: [
        {
          key: "review",
          label: "REVIEW",
          icon: FlaskConical,
          items: [
            { name: "Daftar Review", icon: FileText, path: "/reviewer-eksternal-dashboard/reviews" },
          ],
        },
      ],
    },
  },
};

// Dipakai jika role belum punya konfigurasi: sidebar tetap tampil, minimal tombol Keluar
const EMPTY_CONFIG: RoleConfig = { penelitian: { groups: [] } };

const matchesPath = (current: string, path: string) =>
  current === path || current.startsWith(`${path}/`);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const roleKey = user?.roles?.roles;
  const config: RoleConfig = (roleKey && ROLE_CONFIGS[roleKey]) || EMPTY_CONFIG;

  const isKkmPath = (current: string) =>
    Boolean(config.kkm?.prefixes?.some((prefix) => matchesPath(current, prefix)));

  const isCommonPath = (current: string) =>
    Boolean(config.common?.some((item) => matchesPath(current, item.path)));

  // Tab awal ditentukan dari URL, jadi refresh di halaman KKM tidak balik ke tab Penelitian
  const [activeTab, setActiveTab] = useState<Tab>(
    isKkmPath(location.pathname) ? "kkm" : "penelitian",
  );
  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({});

  // Sinkronkan tab jika user pindah halaman lewat URL/back button.
  // Halaman yang dipakai bersama kedua tab (mis. Profil) tidak mengubah tab.
  useEffect(() => {
    const current = location.pathname;
    if (isKkmPath(current)) {
      setActiveTab("kkm");
    } else if (!isCommonPath(current)) {
      setActiveTab("penelitian");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, roleKey]);

  const hasKkm = Boolean(config.kkm);
  const currentTab: Tab = activeTab === "kkm" && hasKkm ? "kkm" : "penelitian";
  const activeModule: ModuleConfig =
    currentTab === "kkm" && config.kkm ? config.kkm : config.penelitian;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const target =
      tab === "kkm" ? config.kkm?.dashboard?.path : config.penelitian.dashboard?.path;
    if (target) navigate(target);
  };

  const toggleGroup = (key: string) =>
    setClosedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const isItemActive = (item: MenuItem, exact = false) => {
    const paths = [item.path, ...(item.alsoActive ?? [])];
    return paths.some((path) =>
      exact ? location.pathname === path : matchesPath(location.pathname, path),
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const renderMenuItem = (item: MenuItem, nested: boolean) => {
    const Icon = item.icon;
    const active = isItemActive(item);

    return (
      <div
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`flex items-center gap-3 rounded-lg text-sm cursor-pointer transition-colors ${
          nested ? "px-3 py-2" : "px-4 py-2"
        } ${
          active
            ? "bg-red-50 text-red-600 font-medium"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Icon size={nested ? 17 : 18} />
        {item.name}
      </div>
    );
  };

  const dashboard = activeModule.dashboard;
  const showKkmPlaceholder = currentTab === "kkm" && activeModule.groups.length === 0;

  return (
    <div className="w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 -translate-x-full peer-checked:translate-x-0 lg:translate-x-0">
      {/* TOP */}
      <div className="flex-1 overflow-y-auto">
        {/* LOGO */}
        <div className="flex flex-col px-6 pt-6 pb-4">
          <img
            src="/src/assets/images/Logo LPPM UMC 2.png"
            alt="Logo LPPM UMC"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* TAB SWITCH — hanya untuk role yang punya modul KKM */}
        {hasKkm && (
          <div className="px-4 mb-4">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                type="button"
                onClick={() => handleTabChange("penelitian")}
                className={`flex-1 text-sm font-medium py-1.5 rounded-full transition-colors cursor-pointer ${
                  currentTab === "penelitian"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Penelitian
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("kkm")}
                className={`flex-1 text-sm font-medium py-1.5 rounded-full transition-colors cursor-pointer ${
                  currentTab === "kkm"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                KKM
              </button>
            </div>
          </div>
        )}

        {/* BADGE MODUL */}
        <div className="px-4 mb-4">
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
            Modul: {currentTab === "penelitian" ? "Penelitian" : "KKM"}
          </span>
        </div>

        {/* DASHBOARD (dinamis sesuai role & tab) */}
        {dashboard && (
          <div className="px-3 mb-4">
            <div
              onClick={() => navigate(dashboard.path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer border-l-4 transition-colors ${
                isItemActive(dashboard, true)
                  ? "bg-red-50 text-red-600 font-medium border-red-600"
                  : "text-gray-600 hover:bg-gray-100 border-transparent"
              }`}
            >
              <dashboard.icon size={18} />
              {dashboard.name}
            </div>
          </div>
        )}

        {/* GROUP MENU */}
        {activeModule.groups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = !closedGroups[group.key];

          return (
            <div key={group.key} className="px-3 mb-2">
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <GroupIcon size={16} />
                  {group.label}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
                  {group.items.map((item) => renderMenuItem(item, true))}
                </div>
              )}
            </div>
          );
        })}

        {/* PLACEHOLDER — modul KKM yang menunya belum ditentukan */}
        {showKkmPlaceholder && (
          <div className="px-4">
            <div className="flex flex-col items-center text-center gap-2 py-8 px-3 rounded-xl border border-dashed border-gray-200 text-gray-400">
              <Construction size={22} />
              <p className="text-xs font-medium">Menu KKM lainnya segera tersedia</p>
            </div>
          </div>
        )}

        {/* MENU UMUM (tampil di kedua tab) */}
        {config.common && config.common.length > 0 && (
          <div className="px-3 mt-3 space-y-1">
            {config.common.map((item) => renderMenuItem(item, false))}
          </div>
        )}
      </div>

      {/* LOGOUT */}
      <div className="px-4 pb-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-500 hover:text-red-600 text-sm cursor-pointer transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
}
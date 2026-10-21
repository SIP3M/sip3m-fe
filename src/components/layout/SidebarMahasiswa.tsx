import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  BookOpen,
  FileText,
  Star,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";

interface MenuItem {
  name: string;
  icon: typeof LayoutGrid;
  path: string;
  /**
   * true = hanya aktif jika path persis sama.
   * false (default) = aktif juga untuk path anak (mis. /logbook/:id).
   */
  exact?: boolean;
}

// =====================================================================
// MENU MAHASISWA
// Semua menu aktif (bisa diklik). Halaman masih kosong —
// ganti element di router.tsx dengan halaman masing-masing.
// =====================================================================
const MENU_ITEMS: MenuItem[] = [
  {
    name: "Dashboard KKM",
    icon: LayoutGrid,
    path: "/mahasiswa-dashboard",
    exact: true,
  },
  {
    name: "Kelompok Saya",
    icon: Users,
    path: "/mahasiswa-dashboard/kelompok",
  },
  {
    name: "Logbook Kegiatan",
    icon: BookOpen,
    path: "/mahasiswa-dashboard/logbook",
  },
  {
    name: "Laporan KKM",
    icon: FileText,
    path: "/mahasiswa-dashboard/laporan",
  },
  {
    name: "Nilai & Evaluasi",
    icon: Star,
    path: "/mahasiswa-dashboard/nilai",
  },
  {
    name: "Pengumuman",
    icon: Bell,
    path: "/mahasiswa-dashboard/pengumuman",
  },
  {
    name: "Profil Saya",
    icon: User,
    path: "/mahasiswa-dashboard/profile",
  },
];

export default function SidebarMahasiswa() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const isActive = (item: MenuItem) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div
      data-print-hide
      className="w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 -translate-x-full peer-checked:translate-x-0 lg:translate-x-0"
    >
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

        {/* BADGE MODUL */}
        <div className="px-4 mb-4">
          <span className="inline-block text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-md">
            Modul: KKM
          </span>
        </div>

        {/* MENU */}
        <div className="px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                  active
                    ? "bg-red-50 text-red-600 font-medium border-l-4 border-red-600 pl-3"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {item.name}
              </div>
            );
          })}
        </div>
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

import {
  ClipboardList,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Megaphone,
  User,
  LogOut,
  Lock,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

/**
 * Sidebar portal mahasiswa — desain "Pilih Skema KKM".
 * Menu terkunci (🔒) = fitur langkah 2-4 & modul menyusul; tidak bisa diklik.
 */
export default function SidebarMahasiswa() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menus: {
    name: string;
    icon: typeof Users;
    path?: string;
    locked?: boolean;
  }[] = [
    { name: "Pilih Skema KKM", icon: ClipboardList, path: "/mahasiswa-dashboard" },
    { name: "Kelompok Saya", icon: Users, locked: true },
    { name: "Logbook Kegiatan", icon: BookOpen, locked: true },
    { name: "Laporan KKM", icon: FileText, locked: true },
    { name: "Nilai & Evaluasi", icon: BarChart3, locked: true },
    { name: "Pengumuman", icon: Megaphone, locked: true },
    { name: "Profile Saya", icon: User, locked: true },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 -translate-x-full peer-checked:translate-x-0 lg:translate-x-0">
      {/* TOP */}
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 py-5">
          <img
            src="/src/assets/images/Logo LPPM UMC 2.png"
            alt="Logo LPPM UMC"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* MODUL */}
        <div className="px-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-semibold">
            Modul: KKM
          </span>
        </div>

        {/* MENU */}
        <div className="mt-4 space-y-1.5 px-3">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = Boolean(
              menu.path && location.pathname.startsWith(menu.path),
            );

            if (menu.locked) {
              return (
                <div
                  key={menu.name}
                  title="Segera hadir"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed select-none"
                >
                  <Icon size={18} />
                  <span className="flex-1">{menu.name}</span>
                  <Lock size={13} className="text-gray-300" />
                </div>
              );
            }

            return (
              <div
                key={menu.name}
                onClick={() => menu.path && navigate(menu.path)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                  active
                    ? "bg-red-50 text-red-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {menu.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* LOGOUT */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-500 hover:text-red-600 text-sm cursor-pointer"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
}

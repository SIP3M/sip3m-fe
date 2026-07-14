import {
  LayoutDashboard,
  FileText,
  Activity,
  LogOut,
  Upload,
  User,
  ChevronDown,
  FlaskConical,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  // state lokal hanya untuk tampilan (collapse group), tidak memengaruhi fungsi/data
  const [isResearchOpen, setIsResearchOpen] = useState(true);

  const dashboardMenu = {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dosen-dashboard",
  };

  const researchMenus = [
    {
      name: "Proposal Saya",
      icon: FileText,
      path: "/dosen-dashboard/proposals",
    },
    {
      name: "Proyek Saya",
      icon: Activity,
      path: "/dosen-dashboard/project-dosen",
    },
    {
      name: "Laporan Penelitian",
      icon: Upload,
      path: "/dosen-dashboard/laporan",
    },
  ];

  // Path baru, belum ada sebelumnya di code lama — sesuaikan kalau path aslinya beda
  const profileMenu = {
    name: "Profil Saya",
    icon: User,
    path: "/dosen-dashboard/profile",
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string, exact = false) =>
    exact
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <div className="w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 -translate-x-full peer-checked:translate-x-0 lg:translate-x-0">
      {/* TOP */}
      <div className="flex-1 overflow-y-auto">
        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 py-6">
          <img
            src="/src/assets/images/Logo LPPM UMC 2.png"
            alt="Logo LPPM UMC"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* TAB (statis, hanya modul Penelitian) */}
        <div className="px-4 mb-4">
          <div className="bg-gray-100 rounded-full p-1">
            <div className="text-center text-sm font-medium py-1.5 rounded-full bg-white text-red-600 shadow-sm">
              Penelitian
            </div>
          </div>
        </div>

        {/* BADGE MODUL */}
        <div className="px-4 mb-4">
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
            Modul: Penelitian
          </span>
        </div>

        {/* DASHBOARD */}
        <div className="px-3 mb-4">
          <div
            onClick={() => navigate(dashboardMenu.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer border-l-4
              ${
                isActive(dashboardMenu.path, true)
                  ? "bg-red-50 text-red-600 font-medium border-red-600"
                  : "text-gray-600 hover:bg-gray-100 border-transparent"
              }`}
          >
            <dashboardMenu.icon size={18} />
            {dashboardMenu.name}
          </div>
        </div>

        {/* GROUP: PENELITIAN SAYA */}
        <div className="px-3 mb-2">
          <button
            type="button"
            onClick={() => setIsResearchOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FlaskConical size={16} />
              PENELITIAN SAYA
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                isResearchOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isResearchOpen && (
            <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
              {researchMenus.map((menu, index) => {
                const Icon = menu.icon;
                const active = isActive(menu.path);

                return (
                  <div
                    key={index}
                    onClick={() => navigate(menu.path)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer
                    ${
                      active
                        ? "bg-red-50 text-red-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={17} />
                    {menu.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PROFIL SAYA (di luar group) */}
        <div className="px-3 mt-3">
          <div
            onClick={() => navigate(profileMenu.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer
            ${
              isActive(profileMenu.path)
                ? "bg-red-50 text-red-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <profileMenu.icon size={18} />
            {profileMenu.name}
          </div>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="px-4 pb-6 pt-4 border-t border-gray-100">
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
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Activity,
  Wallet,
  Globe,
  ClipboardList,
  Settings,
  FlaskConical,
  ChevronDown,
  LogOut,
  Calendar,
  MapPin,
  UserPlus,
  Megaphone,
  CheckSquare,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  // state lokal hanya untuk tampilan (collapse group & tab aktif), tidak memengaruhi fungsi/data
  const [activeTab, setActiveTab] = useState<"penelitian" | "kkm">("penelitian");
  const [isResearchOpen, setIsResearchOpen] = useState(true);
  const [isSystemOpen, setIsSystemOpen] = useState(true);
  const [isKkmOpen, setIsKkmOpen] = useState(true);

  // Auto navigate ke dashboard yang sesuai saat tab berubah
  useEffect(() => {
    if (activeTab === "penelitian") {
      navigate("/admin-dashboard");
    } else {
      navigate("/admin-dashboard/kkm/dashboard");
    }
  }, [activeTab, navigate]);

  // Dashboard menu dinamis berdasarkan tab aktif
  const getDashboardMenu = () => {
    if (activeTab === "penelitian") {
      return {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin-dashboard",
      };
    } else {
      return {
        name: "Dashboard KKM",
        icon: LayoutDashboard,
        path: "/admin-dashboard/kkm/dashboard",
      };
    }
  };

  const researchMenus = [
    {
      name: "Manajemen Pengguna",
      icon: Users,
      path: "/users",
    },
    {
      name: "Daftar Proposal",
      icon: FileText,
      path: "/proposals",
    },
    {
      name: "Plotting Reviewer",
      icon: UserCheck,
      path: "/plotting-reviewer",
    },
    {
      name: "Monitoring Proyek",
      icon: Activity,
      path: "/monitoring-project",
    },
    {
      name: "Keuangan & Hibah",
      icon: Wallet,
      path: "/finance",
    },
    {
      name: "Repository Publik",
      icon: Globe,
      path: "/repository-publik",
    },
    {
      name: "Audit Logs",
      icon: ClipboardList,
      path: "/logs",
    },
  ];

  const systemMenus = [
    {
      name: "Pengaturan Sistem",
      icon: Settings,
      path: "/settings",
    },
  ];

  // Menu KKM untuk admin
  const kkmMenus = [
    {
      name: "Periode KKM",
      icon: Calendar,
      path: "/admin-dashboard/kkm/periode",
    },
    {
      name: "Peserta KKM",
      icon: Users,
      path: "/admin-dashboard/kkm/peserta",
    },
    {
      name: "Kelompok KKM",
      icon: UserCheck,
      path: "/admin-dashboard/kkm/kelompok",
    },
    {
      name: "Lokasi / Desa KKM",
      icon: MapPin,
      path: "/admin-dashboard/kkm/lokasi",
    },
    {
      name: "DPL KKM",
      icon: UserPlus,
      path: "/admin-dashboard/kkm/dpl",
    },
    {
      name: "Generate Kelompok",
      icon: CheckSquare,
      path: "/admin-dashboard/kkm/generate",
    },
    {
      name: "Monitoring KKM",
      icon: Activity,
      path: "/admin-dashboard/kkm/monitoring",
    },
    {
      name: "Laporan KKM",
      icon: FileText,
      path: "/admin-dashboard/kkm/laporan",
    },
    {
      name: "Pengumuman KKM",
      icon: Megaphone,
      path: "/admin-dashboard/kkm/pengumuman",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => {
    const current = location.pathname;
    return current === path || current.startsWith(`${path}/`);
  };

  // Cek apakah dashboard aktif
  const isDashboardActive = () => {
    const dashboardMenu = getDashboardMenu();
    return isActive(dashboardMenu.path);
  };

  // Render menu berdasarkan activeTab
  const renderMenuContent = () => {
    if (activeTab === "penelitian") {
      return (
        <>
          {/* GROUP: MANAJEMEN PENELITIAN */}
          <div className="px-3 mb-2">
            <button
              type="button"
              onClick={() => setIsResearchOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FlaskConical size={16} />
                MANAJEMEN PENELITIAN
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
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

          {/* GROUP: SYSTEM */}
          <div className="px-3 mb-2">
            <button
              type="button"
              onClick={() => setIsSystemOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings size={16} />
                SYSTEM
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isSystemOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSystemOpen && (
              <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
                {systemMenus.map((menu, index) => {
                  const Icon = menu.icon;
                  const active = isActive(menu.path);

                  return (
                    <div
                      key={index}
                      onClick={() => navigate(menu.path)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
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
        </>
      );
    }

    // Tab KKM
    return (
      <>
        {/* GROUP: MANAJEMEN KKM */}
        <div className="px-3 mb-2">
          <button
            type="button"
            onClick={() => setIsKkmOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Users size={16} />
              MANAJEMEN KKM
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isKkmOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isKkmOpen && (
            <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
              {kkmMenus.map((menu, index) => {
                const Icon = menu.icon;
                const active = isActive(menu.path);

                return (
                  <div
                    key={index}
                    onClick={() => navigate(menu.path)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
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
      </>
    );
  };

  const dashboardMenu = getDashboardMenu();
  const isDashboardActiveNow = isDashboardActive();

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

        {/* TAB SWITCH */}
        <div className="px-4 mb-4">
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => setActiveTab("penelitian")}
              className={`flex-1 text-sm font-medium py-1.5 rounded-full transition-colors cursor-pointer
                ${
                  activeTab === "penelitian"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Penelitian
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kkm")}
              className={`flex-1 text-sm font-medium py-1.5 rounded-full transition-colors cursor-pointer
                ${
                  activeTab === "kkm"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              KKM
            </button>
          </div>
        </div>

        {/* BADGE MODUL */}
        <div className="px-4 mb-4">
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
            Modul: {activeTab === "penelitian" ? "Penelitian" : "KKM"}
          </span>
        </div>

        {/* DASHBOARD - Active state diperbaiki */}
        <div className="px-3 mb-4">
          <div
            onClick={() => navigate(dashboardMenu.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer border-l-4 transition-colors
              ${
                isDashboardActiveNow
                  ? "bg-red-50 text-red-600 font-medium border-red-600"
                  : "text-gray-600 hover:bg-gray-100 border-transparent"
              }`}
          >
            <dashboardMenu.icon size={18} />
            {dashboardMenu.name}
          </div>
        </div>

        {/* MENU CONTENT (berdasarkan tab aktif) */}
        {renderMenuContent()}
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
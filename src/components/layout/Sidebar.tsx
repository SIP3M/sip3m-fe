import { useState } from "react";
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

  const dashboardMenu = {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin-dashboard",
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
      path: "/repository",
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

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)]">
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
                    : "text-gray-500"
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
                    : "text-gray-500"
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

        {/* DASHBOARD */}
        <div className="px-3 mb-4">
          <div
            onClick={() => navigate(dashboardMenu.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer border-l-4
              ${
                isActive(dashboardMenu.path)
                  ? "bg-red-50 text-red-600 font-medium border-red-600"
                  : "text-gray-600 hover:bg-gray-100 border-transparent"
              }`}
          >
            <dashboardMenu.icon size={18} />
            {dashboardMenu.name}
          </div>
        </div>

        {/* GROUP: MANAJEMEN PENELITIAN */}
        <div className="px-3 mb-2">
          <button
            type="button"
            onClick={() => setIsResearchOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FlaskConical size={16} />
              MANAJEMEN PENELITIAN
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

        {/* GROUP: SYSTEM */}
        <div className="px-3 mb-2">
          <button
            type="button"
            onClick={() => setIsSystemOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings size={16} />
              SYSTEM
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
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
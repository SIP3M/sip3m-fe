import {
  LayoutDashboard,
  LogOut,
  CheckSquare,
  FileCheck,
  Menu,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menus = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/reviewer-dashboard",
    },
    {
      name: "Tugas Review",
      icon: CheckSquare,
      path: "/reviewer-dashboard/proposal-saya",
    },
    {
      name: "Riwayat Review",
      icon: FileCheck,
      path: "/reviewer-dashboard/riwayat-review",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => {
    const current = location.pathname;
    
    // Untuk dashboard, harus exact match
    if (path === "/reviewer-dashboard") {
      return current === path;
    }
    
    // Untuk menu lain, cek apakah current path dimulai dengan path menu
    return current === path || current.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* TOP SECTION */}
        <div className="flex-1 overflow-y-auto">
          {/* HEADER - Logo & Institution */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/src/assets/images/Logo LPPM UMC 2.png"
                alt="Logo LPPM UMC"
                className="h-14 w-auto object-contain"
              />
            </div>
          </div>

          {/* MENU */}
          <div className="px-3 py-4 space-y-1">
            {menus.map((menu, index) => {
              const Icon = menu.icon;
              const active = isActive(menu.path);

              return (
                <div
                  key={index}
                  onClick={() => {
                    navigate(menu.path);
                    setIsMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer border-l-4
                  ${
                    active
                      ? "bg-red-50 text-red-600 font-medium border-red-600"
                      : "text-gray-600 hover:bg-gray-100 border-transparent"
                  }`}
                >
                  <Icon size={18} className={active ? "text-red-600" : "text-gray-500"} />
                  <span className="text-sm">{menu.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM - Logout */}
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
    </>
  );
}
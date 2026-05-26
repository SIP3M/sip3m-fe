import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Activity,
  Wallet,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menus = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin-dashboard",
    },
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
      name: "Audit Logs",
      icon: ClipboardList,
      path: "/logs",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)]">
      {/* TOP */}
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="w-8 h-8 text-white flex items-center justify-center rounded font-bold">
            <img src="/src/assets/images/logo.png" alt="" />
          </div>

          <div>
            <p className="font-semibold text-sm">LPPM UMC</p>
            <p className="text-xs text-gray-500">Research Management</p>
          </div>
        </div>

        {/* MENU */}
        <div className="mt-6 space-y-2 px-3">
          {menus.map((menu, index) => {
            const Icon = menu.icon;
            const active = location.pathname === menu.path;

            return (
              <div
                key={index}
                onClick={() => navigate(menu.path)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer
                ${
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
          className="flex items-center gap-3 text-gray-500 hover:text-red-600 text-sm"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
}

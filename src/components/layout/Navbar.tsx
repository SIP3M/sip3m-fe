import { Bell, Search, Menu, LogOut, Shield } from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const displayName = user?.name || "Guest User";
  const displayRole = user?.roles?.roles || "GUEST";

  return (
    <div data-print-hide className="w-full bg-white px-4 sm:px-8 py-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)] gap-4">
      
      {/* SEARCH & HAMBURGER */}
      <div className="flex items-center gap-4 flex-1">
        <label
          htmlFor="sidebar-toggle"
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </label>

        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Cari proposal, peneliti, atau dokumen..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg outline-none text-sm"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <Bell size={18} className="text-gray-600 cursor-pointer" />

        <div className="relative flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 sm:gap-3 text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-gray-500">{displayRole}</p>
            </div>
            <img
              src="https://i.pravatar.cc/40"
              alt={displayName}
              className="w-9 h-9 rounded-full shrink-0"
            />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
              <Link
                to="/settings/sessions"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Shield className="w-4 h-4" /> Kelola Perangkat
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
          {open && <button type="button" aria-label="close" onClick={() => setOpen(false)} className="fixed inset-0 z-40" />}
        </div>
      </div>
    </div>
  );
}
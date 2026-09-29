import { Bell, Search, Menu } from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);

  const displayName = user?.name || "Guest User";
  const displayRole = user?.roles?.roles || "GUEST";

  return (
    <div className="w-full bg-white px-4 sm:px-8 py-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)] gap-4">
      
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

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-gray-500">{displayRole}</p>
          </div>

          <img
            src="https://i.pravatar.cc/40"
            alt={displayName}
            className="w-9 h-9 rounded-full shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
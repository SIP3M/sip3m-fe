import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);

  const displayName = user?.name || "Guest User";
  const displayRole = user?.roles?.roles || "GUEST";

  return (
    <div className="w-full bg-white px-8 py-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      
      {/* SEARCH */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Cari proposal, peneliti, atau dokumen..."
          className="w-100 pl-9 pr-4 py-2 bg-gray-100 rounded-lg outline-none text-sm"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <Bell size={18} className="text-gray-600" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-gray-500">{displayRole}</p>
          </div>

          <img
            src="https://i.pravatar.cc/40"
            alt={displayName}
            className="w-9 h-9 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Search, Menu, LogOut, GraduationCap } from "lucide-react";
import SidebarMahasiswa from "@/components/layout/SidebarMahasiswa";
import { useAuthStore } from "@/features/auth/auth.store";

/** Topbar portal mahasiswa (desain mockup): search + pill role + user + keluar. */
function MahasiswaTopbar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const displayName = user?.name || "Mahasiswa";
  const role = user?.roles?.roles || "MAHASISWA";
  const isMahasiswa = role === "MAHASISWA";
  const roleLabel = isMahasiswa ? "Mahasiswa KKM" : role;
  // Untuk mahasiswa `username` = NIM (mis. "210411010")
  const subLabel = isMahasiswa && user?.username ? `${roleLabel} (${user.username})` : roleLabel;
  const initial = displayName.trim().charAt(0).toUpperCase() || "M";

  return (
    <div
      data-print-hide
      className="w-full bg-white px-4 sm:px-8 py-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)] gap-4"
    >
      {/* SEARCH & HAMBURGER */}
      <div className="flex items-center gap-4 flex-1">
        <label
          htmlFor="sidebar-toggle"
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </label>

        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari skema KKM, panduan, atau informasi..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg outline-none text-sm focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold">
          <GraduationCap size={14} />
          {roleLabel}
        </span>

        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{displayName}</p>
          <p className="text-xs text-gray-500">{subLabel}</p>
        </div>

        <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          {initial}
        </div>

        <button
          type="button"
          title="Keluar"
          onClick={() => {
            logout();
            navigate("/", { replace: true });
          }}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

/**
 * Layout portal mahasiswa: sidebar + topbar (search client-side dikirim
 * ke halaman lewat Outlet context) + Outlet.
 */
export default function MahasiswaLayout() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
      <input type="checkbox" id="sidebar-toggle" className="peer hidden" />
      <SidebarMahasiswa />
      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 bg-black/40 z-40 hidden peer-checked:block lg:peer-checked:hidden cursor-pointer"
      />

      <div className="flex-1 lg:ml-65 bg-gray-50 min-h-screen w-full min-w-0 transition-all duration-300 flex flex-col">
        <MahasiswaTopbar search={search} setSearch={setSearch} />

        <div className="p-4 sm:p-6 flex-1">
          <Outlet context={{ search }} />
        </div>
      </div>
    </div>
  );
}

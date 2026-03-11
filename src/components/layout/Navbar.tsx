import { Bell } from "lucide-react";

export default function Navbar() {
  return (
    <div className="w-full bg-white px-8 py-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)]">

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Cari proposal, peneliti, atau dokumen..."
        className="w-100 px-4 py-2 bg-gray-100 rounded-lg outline-none text-sm"
      />

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        <Bell size={18} className="text-gray-600" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">Dr. Admin Fauzi, M.Kom</p>
            <p className="text-xs text-gray-500">ADMIN</p>
          </div>

          <img
            src="https://i.pravatar.cc/40"
            className="w-9 h-9 rounded-full"
          />
        </div>

      </div>
    </div>
  );
}
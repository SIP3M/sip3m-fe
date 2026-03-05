import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Activity,
  Wallet,
  ClipboardList,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-[260px] h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)]">

      {/* TOP */}
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center rounded font-bold">
            U
          </div>

          <div>
            <p className="font-semibold text-sm">LPPM UMC</p>
            <p className="text-xs text-gray-500">Research Management</p>
          </div>
        </div>

        {/* MENU */}
        <div className="mt-6 space-y-2 px-3">

          <MenuItem icon={<LayoutDashboard size={18} />} active>
            Dashboard
          </MenuItem>

          <MenuItem icon={<Users size={18} />}>
            Manajemen Pengguna
          </MenuItem>

          <MenuItem icon={<FileText size={18} />}>
            Daftar Proposal
          </MenuItem>

          <MenuItem icon={<UserCheck size={18} />}>
            Plotting Reviewer
          </MenuItem>

          <MenuItem icon={<Activity size={18} />}>
            Monitoring Proyek
          </MenuItem>

          <MenuItem icon={<Wallet size={18} />}>
            Keuangan & Hibah
          </MenuItem>

          <MenuItem icon={<ClipboardList size={18} />}>
            Audit Logs
          </MenuItem>

        </div>
      </div>

      {/* LOGOUT */}
      <div className="px-4 pb-6">
        <button className="flex items-center gap-3 text-gray-500 hover:text-red-600 text-sm">
          <LogOut size={18} />
          Keluar
        </button>
      </div>

    </div>
  );
}

function MenuItem({ icon, children, active }: any) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer
      ${active
        ? "bg-red-50 text-red-600 font-medium"
        : "text-gray-600 hover:bg-gray-100"}`}
    >
      {icon}
      {children}
    </div>
  );
}
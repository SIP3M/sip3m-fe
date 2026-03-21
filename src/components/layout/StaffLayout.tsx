import SidebarStaff from "@/components/layout/SidebarStaff";
import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";

export default function StaffLayout() {
  return (
    <div className="flex">
      <SidebarStaff />

      <div className="flex-1 ml-65 bg-gray-50 min-h-screen">
        <Navbar />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

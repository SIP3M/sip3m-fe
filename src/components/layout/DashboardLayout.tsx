import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
      <input type="checkbox" id="sidebar-toggle" className="peer hidden" />
      <Sidebar />
      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 bg-black/40 z-40 hidden peer-checked:block lg:peer-checked:hidden cursor-pointer"
      />

      <div className="flex-1 lg:ml-65 bg-gray-50 min-h-screen w-full min-w-0 transition-all duration-300 flex flex-col">
        <Navbar />

        <div className="p-4 sm:p-6 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

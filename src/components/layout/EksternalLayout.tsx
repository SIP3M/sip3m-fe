import SidebarEksternal from "@/components/layout/SidebarEksternal";
import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";

export default function ExternalLayout() {
  return (
    <div className="flex">
      <SidebarEksternal />

      <div className="flex-1 ml-65 bg-gray-50 min-h-screen">
        <Navbar />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

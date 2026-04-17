import SidebarReviewer from "@/components/layout/SidebarReviewer";
import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";

export default function ReviewerLayout() {
  return (
    <div className="flex">
      <SidebarReviewer />

      <div className="flex-1 ml-65 bg-gray-50 min-h-screen">
        <Navbar />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

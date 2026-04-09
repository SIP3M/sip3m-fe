import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";

export default function RoleLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}

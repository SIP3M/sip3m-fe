import { useState } from "react";
import SidebarMahasiswa from "@/components/layout/SidebarMahasiswa";
import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";

/**
 * Layout portal mahasiswa: sidebar + topbar + Outlet.
 *
 * `search` dari topbar diteruskan ke halaman lewat Outlet context
 * (dipakai halaman Pilih Skema KKM untuk filter client-side).
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
        <Navbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari proposal, peneliti, atau dokumen..."
        />

        <div className="p-4 sm:p-6 flex-1">
          <Outlet context={{ search }} />
        </div>
      </div>
    </div>
  );
}

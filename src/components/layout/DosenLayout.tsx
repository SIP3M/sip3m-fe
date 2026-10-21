import { useEffect } from "react";
import SidebarDosen from "@/components/layout/SidebarDosen";
import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";
import { useKkmDplStore } from "@/features/kkm/kkmDpl.store";

const NOTICE_DURATION_MS = 4500;

export default function DosenLayout() {
  const notice = useKkmDplStore((state) => state.notice);
  const setNotice = useKkmDplStore((state) => state.setNotice);
  const fetchDplStatus = useKkmDplStore((state) => state.fetchDplStatus);

  // Cek status DPL sekali saat layout dosen dimuat.
  useEffect(() => {
    void fetchDplStatus();
  }, [fetchDplStatus]);

  // Auto-hide notifikasi (mis. "Anda belum ditugaskan sebagai DPL KKM").
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notice, setNotice]);

  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
      <input type="checkbox" id="sidebar-toggle" className="peer hidden" />
      <SidebarDosen />
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

      {/* Toast notifikasi global dosen (status DPL, dsb.) */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-lg"
        >
          {notice}
        </div>
      )}
    </div>
  );
}

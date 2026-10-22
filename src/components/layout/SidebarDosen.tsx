import {
  LayoutDashboard,
  FileText,
  Activity,
  LogOut,
  User,
  ChevronDown,
  FlaskConical,
  Users,
  ClipboardCheck,
  BookOpen,
  Star,
  Megaphone,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import LogoLPPM from "@/assets/images/Logo LPPM UMC 2.png";
import {
  DPL_DENIED_NOTICE,
  useKkmDplStore,
} from "@/features/kkm/kkmDpl.store";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const isDplAktif = useKkmDplStore((state) => state.isDplAktif);
  const setNotice = useKkmDplStore((state) => state.setNotice);

  // Dosen non-DPL tidak boleh membuka modul KKM (status masih null = belum tahu,
  // akses sementara dibiarkan sampai cek status selesai).
  const isKkmBlocked = isDplAktif === false;

  const isKkmPath = (path: string) => path.startsWith("/dosen-dashboard/kkm");

  // state lokal untuk tab & collapse group
  const [activeTab, setActiveTab] = useState<"penelitian" | "kkm">(
    isKkmPath(location.pathname) ? "kkm" : "penelitian"
  );
  const [isResearchOpen, setIsResearchOpen] = useState(true);
  const [isKkmOpen, setIsKkmOpen] = useState(true);

  // Sinkronkan tab jika user berpindah halaman via route / back button
  useEffect(() => {
    if (isKkmPath(location.pathname) && !isKkmBlocked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkronisasi tab dengan lokasi URL
      setActiveTab("kkm");
    } else if (!location.pathname.startsWith("/dosen-dashboard/profile")) {
      setActiveTab("penelitian");
    }
  }, [location.pathname, isKkmBlocked]);

  const handleTabChange = (tab: "penelitian" | "kkm") => {
    if (tab === "kkm" && isKkmBlocked) {
      // Tab tetap tampil, tapi akses ditolak + notifikasi.
      setNotice(DPL_DENIED_NOTICE);
      return;
    }

    setActiveTab(tab);
    if (tab === "penelitian") {
      navigate("/dosen-dashboard");
    } else {
      navigate("/dosen-dashboard/kkm/dashboard");
    }
  };

  const dashboardMenu = {
    name: activeTab === "penelitian" ? "Dashboard" : "Dashboard KKM",
    icon: LayoutDashboard,
    path:
      activeTab === "penelitian"
        ? "/dosen-dashboard"
        : "/dosen-dashboard/kkm/dashboard",
  };

  const researchMenus = [
    {
      name: "Proposal Saya",
      icon: FileText,
      path: "/dosen-dashboard/proposals",
    },
    {
      name: "Proyek Saya",
      icon: Activity,
      path: "/dosen-dashboard/project-dosen",
    },
  ];

  // Menu KKM sesuai desain
  const kkmMenus = [
    {
      name: "Kelompok Bimbingan",
      icon: Users,
      path: "/dosen-dashboard/kkm/kelompok-bimbingan",
    },
    {
      name: "Monitoring KKM",
      icon: ClipboardCheck,
      path: "/dosen-dashboard/kkm/monitoring",
    },
    {
      name: "Validasi Logbook",
      icon: BookOpen,
      path: "/dosen-dashboard/kkm/validasi-logbook",
    },
    {
      name: "Laporan KKM",
      icon: FileText,
      path: "/dosen-dashboard/kkm/laporan",
    },
    {
      name: "Penilaian Mahasiswa",
      icon: Star,
      path: "/dosen-dashboard/kkm/penilaian",
    },
    {
      name: "Pengumuman",
      icon: Megaphone,
      path: "/dosen-dashboard/kkm/pengumuman",
    },
  ];

  const profileMenu = {
    name: "Profil Saya",
    icon: User,
    path: "/dosen-dashboard/profile",
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string, exact = false) =>
    exact
      ? location.pathname === path
      : location.pathname.startsWith(path);

  // Render menu berdasarkan activeTab
  const renderMenuContent = () => {
    if (activeTab === "penelitian") {
      return (
        <>
          {/* GROUP: PENELITIAN SAYA */}
          <div className="px-3 mb-2">
            <button
              type="button"
              onClick={() => setIsResearchOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FlaskConical size={16} />
                PENELITIAN SAYA
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isResearchOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isResearchOpen && (
              <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
                {researchMenus.map((menu, index) => {
                  const Icon = menu.icon;
                  const active = isActive(menu.path);

                  return (
                    <div
                      key={index}
                      onClick={() => navigate(menu.path)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
                      ${
                        active
                          ? "bg-red-50 text-red-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={17} />
                      {menu.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      );
    }

    // Tab KKM
    return (
      <>
        {/* GROUP: BIMBINGAN KKM */}
        <div className="px-3 mb-2">
          <button
            type="button"
            onClick={() => setIsKkmOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:text-gray-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Users size={16} />
              BIMBINGAN KKM
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isKkmOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isKkmOpen && (
            <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
              {kkmMenus.map((menu, index) => {
                const Icon = menu.icon;
                const active = isActive(menu.path);

                return (
                  <div
                    key={index}
                    onClick={() => navigate(menu.path)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
                    ${
                      active
                        ? "bg-red-50 text-red-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={17} />
                    {menu.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 -translate-x-full peer-checked:translate-x-0 lg:translate-x-0">
      {/* TOP SECTION */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col px-6 pt-6 pb-4">
          <img
            src={LogoLPPM}
            alt="Logo LPPM UMC"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* TAB SWITCH */}
        <div className="px-4 mb-4">
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => handleTabChange("penelitian")}
              className={`flex-1 text-sm font-medium py-1.5 rounded-full transition-colors cursor-pointer
                ${
                  activeTab === "penelitian"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Penelitian
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("kkm")}
              title={
                isKkmBlocked
                  ? "Anda belum ditugaskan sebagai DPL KKM"
                  : undefined
              }
              className={`flex-1 text-sm font-medium py-1.5 rounded-full transition-colors inline-flex items-center justify-center gap-1.5
                ${
                  activeTab === "kkm"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }
                ${isKkmBlocked ? "opacity-60" : ""}`}
            >
              {isKkmBlocked && <Lock size={13} />}
              KKM
            </button>
          </div>
        </div>

        {/* BADGE MODUL */}
        <div className="px-4 mb-4">
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
            Modul: {activeTab === "penelitian" ? "Penelitian" : "KKM"}
          </span>
        </div>

        {/* DASHBOARD */}
        <div className="px-3 mb-4">
          <div
            onClick={() => navigate(dashboardMenu.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer border-l-4 transition-colors
              ${
                isActive(dashboardMenu.path, true)
                  ? "bg-red-50 text-red-600 font-medium border-red-600"
                  : "text-gray-600 hover:bg-gray-100 border-transparent"
              }`}
          >
            <dashboardMenu.icon size={18} />
            {dashboardMenu.name}
          </div>
        </div>

        {/* MENU CONTENT (berdasarkan tab aktif) */}
        {renderMenuContent()}

        {/* PROFIL SAYA - Selalu tampil di bagian bawah menu */}
        <div className="px-3 mt-3">
          <div
            onClick={() => navigate(profileMenu.path)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors
            ${
              isActive(profileMenu.path)
                ? "bg-red-50 text-red-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <profileMenu.icon size={18} />
            {profileMenu.name}
          </div>
        </div>
      </div>

      {/* LOGOUT - BOTTOM */}
      <div className="px-4 pb-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-500 hover:text-red-600 text-sm cursor-pointer transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
}
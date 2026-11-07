import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  BookOpen,
  FileText,
  Star,
  Bell,
  User,
  LogOut,
  Lock,
  ClipboardList,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { useKkmMahasiswaAccessStore } from "@/features/kkm/kkmMahasiswaAccess.store";
import { useKkmJabatanStore } from "@/features/kkm/kkmJabatan.store";
import LogoLPPM from "@/assets/images/Logo LPPM UMC 2.png";

interface SubMenuItem {
  name: string;
  path: string;
  requiresAccess?: boolean;
  /**
   * Hanya Ketua/Sekretaris yang boleh membuka (Logbook Kelompok &
   * Laporan Kelompok). Menu tetap bisa diklik — dikasih feedback gembok.
   */
  onlyKetuaSekretaris?: boolean;
}

interface MenuItem {
  name: string;
  icon: typeof LayoutGrid;
  path: string;
  exact?: boolean;
  requiresAccess?: boolean;
  children?: SubMenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    name: "Dashboard KKM",
    icon: LayoutGrid,
    path: "/mahasiswa-dashboard",
    exact: true,
    requiresAccess: false,
  },
  {
    // Langkah 1 portal KKM: pemilihan skema (live API /kkm/skema).
    // Bagian pendaftaran — tetap bisa dibuka walau akses KKM belum aktif.
    name: "Pilih Skema KKM",
    icon: ClipboardList,
    path: "/mahasiswa-dashboard/pilih-skema",
    requiresAccess: false,
  },
  {
    name: "Kelompok Saya",
    icon: Users,
    path: "/mahasiswa-dashboard/kelompok",
    requiresAccess: true,
  },
  {
    name: "Logbook Kegiatan",
    icon: BookOpen,
    path: "/mahasiswa-dashboard/logbook",
    requiresAccess: true,
    children: [
      {
        name: "Logbook Individu",
        path: "/mahasiswa-dashboard/logbook/individu",
        requiresAccess: true,
      },
      {
        name: "Logbook Kelompok",
        path: "/mahasiswa-dashboard/logbook/kelompok",
        requiresAccess: true,
        onlyKetuaSekretaris: true,
      },
    ],
  },
  {
    name: "Laporan KKM",
    icon: FileText,
    path: "/mahasiswa-dashboard/laporan",
    requiresAccess: true,
    children: [
      {
        name: "Laporan Individu",
        path: "/mahasiswa-dashboard/laporan/individu",
        requiresAccess: true,
      },
      {
        name: "Laporan Kelompok",
        path: "/mahasiswa-dashboard/laporan/kelompok",
        requiresAccess: true,
        onlyKetuaSekretaris: true,
      },
    ],
  },
  {
    name: "Nilai & Evaluasi",
    icon: Star,
    path: "/mahasiswa-dashboard/nilai",
    requiresAccess: true,
  },
  {
    name: "Pengumuman",
    icon: Bell,
    path: "/mahasiswa-dashboard/pengumuman",
    requiresAccess: false,
  },
  {
    name: "Profile Saya",
    icon: User,
    path: "/mahasiswa-dashboard/profile",
    requiresAccess: false,
  },
];

const FEEDBACK_KELOMPOK =
  "Halaman ini hanya bisa diakses Ketua dan Sekretaris kelompok. Silakan hubungi ketua/sekretaris Anda untuk mengunggah logbook & laporan kelompok.";

export default function SidebarMahasiswa() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const hasAccess = useKkmMahasiswaAccessStore((state) => state.hasAccess);
  const loadJabatan = useKkmJabatanStore((state) => state.load);
  const bolehUnggah = useKkmJabatanStore((state) => state.bolehUnggah);
  const jabatanLabel = useKkmJabatanStore((state) => state.label);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  // Jabatan dibutuhkan untuk mengunci submenu kelompok — muat sekali.
  useEffect(() => {
    if (hasAccess) void loadJabatan();
  }, [hasAccess, loadJabatan]);

  // Feedback gembok hilang sendiri.
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const isActive = (path: string, exact?: boolean) =>
    exact
      ? location.pathname === path
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`);

  // Submenu terbuka otomatis bila rute aktif berada di dalamnya.
  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const item of MENU_ITEMS) {
        if (item.children?.some((child) => isActive(child.path))) {
          next[item.path] = true;
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const lockedByAccess = (requiresAccess?: boolean) =>
    !hasAccess && Boolean(requiresAccess);

  const lockedByJabatan = (only?: boolean) =>
    Boolean(only) && !bolehUnggah;

  const handleItemClick = (item: MenuItem) => {
    if (item.children?.length) {
      setExpanded((prev) => ({ ...prev, [item.path]: !prev[item.path] }));
      return;
    }
    if (lockedByAccess(item.requiresAccess)) {
      navigate("/mahasiswa-dashboard");
      return;
    }
    navigate(item.path);
  };

  const handleChildClick = (item: MenuItem, child: SubMenuItem) => {
    if (lockedByAccess(child.requiresAccess)) {
      navigate("/mahasiswa-dashboard");
      return;
    }
    // Gembok jabatan: menu tetap diklik, halaman menampilkan state terkunci,
    // dan pengguna mendapat feedback singkat.
    if (lockedByJabatan(child.onlyKetuaSekretaris)) {
      setFeedback(FEEDBACK_KELOMPOK);
      navigate(child.path);
      return;
    }
    navigate(child.path);
  };

  const jabatanBadge = useMemo(() => {
    if (!hasAccess) return null;
    if (jabatanLabel === "Ketua" || jabatanLabel === "Sekretaris") return jabatanLabel;
    return null;
  }, [hasAccess, jabatanLabel]);

  return (
    <div
      data-print-hide
      className="w-65 h-screen bg-white fixed left-0 top-0 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 -translate-x-full peer-checked:translate-x-0 lg:translate-x-0"
    >
      {/* TOP */}
      <div className="flex-1 overflow-y-auto">
        {/* LOGO */}
        <div className="flex flex-col px-6 pt-6 pb-4">
          <img
            src={LogoLPPM}
            alt="Logo LPPM UMC"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* BADGE MODUL */}
        <div className="px-4 mb-4 flex items-center gap-2 flex-wrap">
          <span className="inline-block text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-md">
            Modul: KKM
          </span>
          {jabatanBadge && (
            <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {jabatanBadge}
            </span>
          )}
        </div>

        {/* MENU */}
        <div className="px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const parentLocked = lockedByAccess(item.requiresAccess);
            const hasChildren = Boolean(item.children?.length);
            const isExpanded = Boolean(expanded[item.path]);
            const Icon = parentLocked && !hasChildren ? Lock : item.icon;
            const active =
              !hasChildren && isActive(item.path, item.exact);

            return (
              <div key={item.path}>
                <div
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    active
                      ? "bg-red-50 text-red-600 font-medium border-l-4 border-red-600 pl-3"
                      : parentLocked && !hasChildren
                        ? "text-gray-400 hover:bg-gray-50 hover:text-gray-500"
                        : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title={
                    parentLocked && !hasChildren
                      ? "Akses modul KKM belum aktif (Menunggu verifikasi admin LPPM)"
                      : undefined
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1 truncate">{item.name}</span>
                  {hasChildren && (
                    <ChevronDown
                      size={15}
                      className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>

                {/* SUBMENU (parent + 2 anak untuk Logbook & Laporan) */}
                {hasChildren && isExpanded && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-gray-100 pl-3">
                    {item.children?.map((child) => {
                      const childLockedAccess = lockedByAccess(child.requiresAccess);
                      const childLockedJabatan = lockedByJabatan(child.onlyKetuaSekretaris);
                      const childActive = isActive(child.path);
                      const ChildIcon =
                        childLockedAccess || childLockedJabatan ? Lock : item.icon;

                      return (
                        <div
                          key={child.path}
                          onClick={() => handleChildClick(item, child)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                            childActive
                              ? "bg-red-50 text-red-600 font-medium"
                              : childLockedAccess || childLockedJabatan
                                ? "text-gray-400 hover:bg-gray-50 hover:text-gray-500"
                                : "text-gray-600 hover:bg-gray-100"
                          }`}
                          title={
                            childLockedAccess
                              ? "Akses modul KKM belum aktif (Menunggu verifikasi admin LPPM)"
                              : childLockedJabatan
                                ? "Hanya bisa diakses Ketua & Sekretaris"
                                : undefined
                          }
                        >
                          <ChildIcon size={15} className="shrink-0" />
                          <span className="flex-1 truncate">{child.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK GEMBOK (anggota biasa klik menu kelompok) */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="mx-3 mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-700 shadow-sm"
        >
          <ShieldAlert size={15} className="mt-0.5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* LOGOUT */}
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

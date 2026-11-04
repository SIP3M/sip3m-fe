import { Bell, Search, Menu, LogOut, Shield, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getNotifications,
  markNotificationRead,
  type NotificationItem,
} from "@/features/notifications/notifications.api";
import { formatTanggalPengumuman, formatJamPengumuman } from "@/utils/pengumuman";

interface NavbarProps {
  /** Placeholder input pencarian */
  searchPlaceholder?: string;
  /** Nilai pencarian (controlled). Bila diisi, input jadi controlled. */
  search?: string;
  /** Callback saat nilai pencarian berubah */
  onSearchChange?: (value: string) => void;
}

/** Halaman pengumuman per role — dipakai saat notifikasi pengumuman diklik. */
const pengumumanPathFor = (role?: string): string | null => {
  switch (role) {
    case "ADMIN_LPPM":
      return "/admin-dashboard/kkm/pengumuman";
    case "STAFF_LPPM":
      return "/staff-lppm/kkm/pengumuman";
    case "DOSEN":
      return "/dosen-dashboard/kkm/pengumuman";
    case "MAHASISWA":
      return "/mahasiswa-dashboard/pengumuman";
    default:
      return null;
  }
};

/**
 * Lonceng notifikasi: badge jumlah belum dibaca, dropdown daftar terbaru,
 * tandai terbaca per item, dan tautan ke halaman pengumuman bila notifikasi
 * berasal dari pengumuman KKM.
 */
function NotificationBell({ role }: { role?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications();
      setItems(res.data.notifications);
      setUnread(res.data.unread_count);
      loadedOnce.current = true;
    } catch {
      if (!loadedOnce.current) setError("Gagal memuat notifikasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  // muat badge saat pertama kali tampil
  useEffect(() => {
    void load();
  }, [load]);

  const handleClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)),
        );
        setUnread((prev) => Math.max(0, prev - 1));
      } catch {
        // biarkan tetap terbuka walau gagal menandai
      }
    }

    setOpen(false);
    if (item.pengumuman_id) {
      const path = pengumumanPathFor(role);
      if (path) navigate(path);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifikasi"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void load();
        }}
        className="relative p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell size={18} className="text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-full mt-3 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">
                Notifikasi
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin text-red-600" />
                  Memuat notifikasi...
                </div>
              ) : error ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  {error}
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="mt-2 block mx-auto text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Belum ada notifikasi.
                </div>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void handleClick(item)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors ${
                      item.is_read
                        ? "bg-white hover:bg-gray-50"
                        : "bg-red-50/60 hover:bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!item.is_read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                      )}
                      <div className={item.is_read ? "min-w-0" : "min-w-0 flex-1"}>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          {item.message}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {formatTanggalPengumuman(item.created_at)},{" "}
                          {formatJamPengumuman(item.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar({
  searchPlaceholder = "Cari proposal, peneliti, atau dokumen...",
  search,
  onSearchChange,
}: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const displayName = user?.name || "Guest User";
  const displayRole = user?.roles?.roles || "GUEST";

  return (
    <div data-print-hide className="w-full bg-white px-4 sm:px-8 py-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)] gap-4">
      
      {/* SEARCH & HAMBURGER */}
      <div className="flex items-center gap-4 flex-1">
        <label
          htmlFor="sidebar-toggle"
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </label>

        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg outline-none text-sm"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <NotificationBell role={displayRole} />

        <div className="relative flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 sm:gap-3 text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-gray-500">{displayRole}</p>
            </div>
            <img
              src="https://i.pravatar.cc/40"
              alt={displayName}
              className="w-9 h-9 rounded-full shrink-0"
            />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
              <Link
                to="/settings/sessions"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Shield className="w-4 h-4" /> Kelola Perangkat
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
          {open && <button type="button" aria-label="close" onClick={() => setOpen(false)} className="fixed inset-0 z-40" />}
        </div>
      </div>
    </div>
  );
}

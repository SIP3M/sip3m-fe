import { useEffect, useState, useCallback } from "react";
import { getSessions, revokeSessionByDeviceId, revokeSessionPost } from "@/features/auth/auth.api";
import type { UserSession } from "@/features/auth/auth.api";
import { getDeviceId } from "@/utils/device";
import { Monitor, Smartphone, LogOut, Trash2, Shield, Info } from "lucide-react";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function parseUa(ua: string): string {
  const lower = ua.toLowerCase();
  let browser = "Browser";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome") && !lower.includes("chromium")) browser = "Chrome";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  let os = "";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad")) os = "iOS";
  else if (lower.includes("mac os")) os = "macOS";
  else if (lower.includes("linux")) os = "Linux";
  return [browser, os].filter(Boolean).join(" · ");
}

export default function AuthSessionsPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const currentDeviceId = (() => {
    try {
      return getDeviceId();
    } catch {
      return "";
    }
  })();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSessions();
      setSessions(res.data || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat sesi";
      const axiosMsg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(axiosMsg || msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (deviceId: string) => {
    setRevoking(deviceId);
    setError(null);
    try {
      try {
        await revokeSessionByDeviceId(deviceId);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          // try fallback POST
          await revokeSessionPost(deviceId);
        } else {
          throw err;
        }
      }
      setToast("Sesi perangkat berhasil dicabut.");
      setTimeout(() => setToast(null), 2500);
      await fetchSessions();
    } catch (e: unknown) {
      const axiosMsg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const msg = axiosMsg || (e instanceof Error ? e.message : "Gagal mencabut sesi");
      setError(msg);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-600" />
          Sesi Aktif / Kelola Perangkat
        </h1>
        <p className="text-sm text-gray-600 mt-1">Lihat perangkat yang sedang login dengan akun kamu.</p>
        <div className="mt-3 flex items-start gap-2 text-xs bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Maksimal <strong>3 perangkat aktif</strong>. Perangkat ke-4 akan menghapus yang tertua. Satu browser = satu sesi — login ulang di browser yang sama akan menggantikan sesi lama di browser itu.
          </span>
        </div>
      </div>

      {toast && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">{toast}</div>}

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          <Monitor className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-sm">Tidak ada sesi aktif selain perangkat ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const deviceId = (s.device_id || s.deviceId || "") as string;
            const ua = (s.user_agent || s.userAgent || "") as string;
            const expiresAt = (s.expires_at || s.expiresAt || "") as string;
            const createdAt = (s.created_at || s.createdAt || "") as string;
            const isCurrent = deviceId && currentDeviceId && deviceId === currentDeviceId;
            return (
              <div
                key={s.id || s.jti}
                className={`rounded-xl border bg-white p-4 flex items-start justify-between gap-4 ${isCurrent ? "border-red-300 ring-1 ring-red-100" : "border-gray-200"}`}
              >
                <div className="flex gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {ua.toLowerCase().includes("android") || ua.toLowerCase().includes("iphone") ? (
                      <Smartphone className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Monitor className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-700 truncate" title={deviceId}>
                        {deviceId ? `${deviceId.slice(0, 8)}…${deviceId.slice(-4)}` : s.id?.slice(0, 12)}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">Perangkat ini</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1 truncate" title={ua}>
                      {ua ? parseUa(ua) : "Perangkat tidak dikenal"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono truncate" title={ua}>
                      {ua || "-"}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>IP: {s.ip || "-"}</span>
                      <span>•</span>
                      <span>Masuk: {createdAt ? formatDate(createdAt) : "-"}</span>
                      <span>•</span>
                      <span>Berlaku sampai: {expiresAt ? formatDate(expiresAt) : "-"}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => void handleRevoke(deviceId)}
                  disabled={revoking === deviceId}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed
                    {isCurrent ? 'border-gray-200 text-gray-700 hover:bg-gray-50' : 'border-red-200 text-red-700 hover:bg-red-50'}"
                  title={isCurrent ? "Cabut sesi perangkat ini" : "Cabut sesi perangkat ini"}
                >
                  {revoking === deviceId ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : isCurrent ? (
                    <LogOut className="w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Cabut
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => void fetchSessions()}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Muat ulang
        </button>
      </div>
    </div>
  );
}

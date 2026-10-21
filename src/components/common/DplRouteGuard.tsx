import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  DPL_DENIED_NOTICE,
  useKkmDplStore,
} from "@/features/kkm/kkmDpl.store";

/**
 * Membungkus seluruh route modul KKM di dosen-dashboard.
 *
 * Dosen yang berstatus bukan DPL akan di-redirect ke dashboard dan
 * notifikasi DPL_DENIED_NOTICE ditampilkan lewat DosenLayout.
 * Selama status belum pasti (loading/gagal cek), akses diteruskan
 * agar tidak menghalangi dosen yang sebenarnya berhak.
 */
export default function DplRouteGuard() {
  const fetchDplStatus = useKkmDplStore((state) => state.fetchDplStatus);
  const [decision, setDecision] = useState<"pending" | "allow" | "deny">(
    "pending",
  );

  useEffect(() => {
    let mounted = true;

    void (async () => {
      await fetchDplStatus();

      const status = useKkmDplStore.getState().isDplAktif;
      if (!mounted) return;

      if (status === false) {
        // Atur notifikasi SEBELUM redirect agar pesan tampil di halaman tujuan.
        useKkmDplStore.getState().setNotice(DPL_DENIED_NOTICE);
        setDecision("deny");
      } else {
        setDecision("allow");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchDplStatus]);

  if (decision === "deny") {
    return <Navigate to="/dosen-dashboard" replace />;
  }

  if (decision === "pending") {
    return (
      <div className="py-16 text-center text-sm text-gray-500">
        Memuat modul KKM…
      </div>
    );
  }

  return <Outlet />;
}

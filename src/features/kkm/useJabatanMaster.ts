import { useEffect, useState } from "react";
import { jabatanMasterAPI } from "./jabatanMaster.api";
import type { JabatanKelompokMaster } from "./jabatanMaster.types";

export function useJabatanMaster() {
  const [jabatanList, setJabatanList] = useState<JabatanKelompokMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await jabatanMasterAPI.getAll();
        setJabatanList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat jabatan");
        setJabatanList([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { jabatanList, loading, error };
}

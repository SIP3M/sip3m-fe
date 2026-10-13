import { useEffect, useState } from "react";
import axios from "axios";
import { X, Loader2, CheckCircle, Clock, XCircle, MapPin, Users } from "lucide-react";
import { getKkmPesertaById } from "./kkmPeserta.api";

interface Props {
  open: boolean;
  pesertaId: number | null;
  onClose: () => void;
}

export default function KkmPesertaDetailModal({ open, pesertaId, onClose }: Props) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getKkmPesertaById>>["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || pesertaId == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    void (async () => {
      try {
        const res = await getKkmPesertaById(pesertaId);
        if (!cancelled) setData(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 404) setError("Peserta tidak ditemukan.");
          else if (status === 401) setError("Sesi habis. Silakan login ulang.");
          else setError((err.response?.data as { message?: string })?.message || err.message);
        } else setError(err instanceof Error ? err.message : "Gagal memuat detail.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, pesertaId]);

  if (!open) return null;

  const user = (data as unknown as { user?: { nim: string; nama: string; email: string; semester: number | null; fakultas: string | null; prodi: string | null; nomor_hp?: string | null; alamat?: string | null } })?.user || null;
  const nim = user?.nim || (data as unknown as { nim?: string })?.nim || "-";
  const nama = user?.nama || (data as unknown as { nama?: string })?.nama || "-";
  const fakultas = user?.fakultas || (data as unknown as { fakultas?: string | null })?.fakultas || "-";
  const prodi = user?.prodi || (data as unknown as { prodi?: string | null })?.prodi || "-";
  const semester = user?.semester ?? (data as unknown as { semester?: number | null })?.semester ?? null;

  const StatusIcon = data?.status === "VERIFIED" ? CheckCircle : data?.status === "REJECTED" ? XCircle : Clock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Detail Peserta</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2"><Loader2 size={18} className="animate-spin" /> Memuat...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">NIM</p>
                  <p className="font-mono font-medium text-gray-800">{nim}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Semester</p>
                  <p className="font-medium text-gray-800">{semester != null ? `SEM. ${semester}` : "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Nama</p>
                  <p className="font-semibold text-gray-800">{nama}</p>
                  <p className="text-xs text-gray-500">{prodi} — {fakultas}</p>
                  {user?.email && <p className="text-xs text-gray-400">{user.email}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Status Verifikasi</p>
                  <span
                    className={`inline-flex mt-1 items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${data.status === "VERIFIED" ? "bg-green-50 text-green-700 border-green-200" : data.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}
                  >
                    <StatusIcon size={12} /> {data.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Status Kelompok</p>
                  {data.kelompok ? (
                    <span className="inline-flex mt-1 items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <Users size={12} /> {data.kelompok.nama} {data.kelompok.desa ? `· ${data.kelompok.desa}` : ""}
                    </span>
                  ) : (
                    <span className="inline-flex mt-1 items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                      <MapPin size={12} /> Belum Ditempatkan
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Periode</span><span className="font-medium text-gray-700">{data.periode ? `${data.periode.nama_periode}` : `Periode #${(data as unknown as { periode_id: number }).periode_id}`}</span></div>
                {user?.nomor_hp && <div className="flex justify-between"><span className="text-gray-500">No HP</span><span className="font-medium text-gray-700">{user.nomor_hp}</span></div>}
                {user?.alamat && <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-gray-700 text-right max-w-[60%]">{user.alamat}</span></div>}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

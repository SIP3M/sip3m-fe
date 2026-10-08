import { useEffect, useState } from "react";
import axios from "axios";
import { X, MapPin, Edit, Trash2, Loader2 } from "lucide-react";
import type { KkmLocation } from "./kkmLocation.types";
import { deleteKkmLocation, getKkmLocationById } from "./kkmLocation.api";

interface Props {
  open: boolean;
  locationId: number | null;
  onClose: () => void;
  onEdit: (loc: KkmLocation) => void;
  onDeleted: () => void;
  isAdmin: boolean;
}

export default function KkmLocationDetailModal({ open, locationId, onClose, onEdit, onDeleted, isAdmin }: Props) {
  const [data, setData] = useState<KkmLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || locationId == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    void (async () => {
      try {
        const res = await getKkmLocationById(locationId);
        if (!cancelled) setData(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 404) setError("Lokasi tidak ditemukan.");
          else if (status === 401) setError("Sesi habis. Silakan login ulang.");
          else setError((err.response?.data as { message?: string })?.message || err.message);
        } else {
          setError(err instanceof Error ? err.message : "Gagal memuat lokasi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, locationId]);

  if (!open) return null;

  const handleDelete = async () => {
    if (!data) return;
    const ok = window.confirm(`Hapus lokasi Desa "${data.desa}" (Kec. ${data.kecamatan})?`);
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteKkmLocation(data.id);
      onDeleted();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("Hanya ADMIN LPPM yang boleh menghapus lokasi.");
      } else {
        setError(axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : "Gagal menghapus lokasi.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPin size={18} className="text-red-600" />
            Detail Lokasi
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
              <Loader2 size={18} className="animate-spin" />
              Memuat lokasi...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Desa</p>
                  <p className="font-medium text-gray-800">{data.desa}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Kecamatan</p>
                  <p className="font-medium text-gray-800">{data.kecamatan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Kabupaten</p>
                  <p className="font-medium text-gray-800">{data.kabupaten}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Kuota</p>
                  <p className="font-medium text-gray-800">{data.kuota}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Terisi</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-300 rounded-full" style={{ width: `${Math.min(100, (data.terisi / Math.max(1, data.kuota)) * 100)}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">
                      {data.terisi}/{data.kuota}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Status</p>
                  <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${data.status === "Penuh" ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>{data.status}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Periode</span>
                  <span className="font-medium text-gray-800">
                    {data.periode ? `${data.periode.nama_periode} • ${data.periode.tahun_akademik}` : `Periode #${data.periode_id}`}
                  </span>
                </div>
                {data.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dibuat</span>
                    <span className="font-medium text-gray-600">{new Date(data.created_at).toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => onEdit(data)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Edit size={16} /> Edit
                  </button>
                  <button onClick={() => void handleDelete()} disabled={deleting} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50">
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Hapus
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

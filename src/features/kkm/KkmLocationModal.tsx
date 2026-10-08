import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import type { KkmLocation, CreateKkmLocationPayload, UpdateKkmLocationPayload } from "./kkmLocation.types";
import type { KkmPeriod } from "./kkmPeriod.types";
import { createKkmLocation, updateKkmLocation } from "./kkmLocation.api";
import { getKkmPeriods } from "./kkmPeriod.api";

type Mode = "create" | "edit";

interface Props {
  mode: Mode;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  periodeLockedId?: number | null;
  location?: KkmLocation | null;
}

function errorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first[0]) return first[0];
      if (typeof first === "string") return first;
    }
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function KkmLocationModal({ mode, open, onClose, onSuccess, periodeLockedId, location }: Props) {
  const isEdit = mode === "edit";

  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);
  const [periodeId, setPeriodeId] = useState<string>(periodeLockedId ? String(periodeLockedId) : "");
  const [kabupaten, setKabupaten] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [desa, setDesa] = useState("");
  const [kuota, setKuota] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load period options for create
  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      let cancelled = false;
      const fetchPeriods = async () => {
        try {
          const res = await getKkmPeriods({ page: 1, limit: 50 });
          if (!cancelled) setPeriodes(res.data || []);
        } catch {
          // ignore
        }
      };
      void fetchPeriods();
      return () => {
        cancelled = true;
      };
    }
  }, [open, isEdit]);

  // Sync locked periode
  useEffect(() => {
    if (!open) return;
    if (periodeLockedId) setPeriodeId(String(periodeLockedId));
  }, [open, periodeLockedId]);

  // Pre-fill edit
  useEffect(() => {
    if (!open) return;
    if (isEdit && location) {
      setPeriodeId(String(location.periode_id));
      setKabupaten(location.kabupaten);
      setKecamatan(location.kecamatan);
      setDesa(location.desa);
      setKuota(String(location.kuota));
    } else if (!isEdit) {
      // reset create (keep locked periode if any)
      if (!periodeLockedId) setPeriodeId("");
      setKabupaten("");
      setKecamatan("");
      setDesa("");
      setKuota("");
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [open, isEdit, location, periodeLockedId]);

  if (!open) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!isEdit && !periodeId) errs.periode_id = "Periode wajib dipilih";
    if (!kabupaten.trim() || kabupaten.trim().length < 2) errs.kabupaten = "Kabupaten minimal 2 karakter";
    else if (kabupaten.trim().length > 100) errs.kabupaten = "Kabupaten maksimal 100 karakter";
    if (!kecamatan.trim() || kecamatan.trim().length < 2) errs.kecamatan = "Kecamatan minimal 2 karakter";
    else if (kecamatan.trim().length > 100) errs.kecamatan = "Kecamatan maksimal 100 karakter";
    if (!desa.trim() || desa.trim().length < 2) errs.desa = "Desa minimal 2 karakter";
    else if (desa.trim().length > 100) errs.desa = "Desa maksimal 100 karakter";
    const n = Number(kuota);
    if (!kuota.trim()) errs.kuota = "Kuota wajib diisi";
    else if (Number.isNaN(n) || !Number.isInteger(n)) errs.kuota = "Kuota harus bilangan bulat";
    else if (n < 1 || n > 1000) errs.kuota = "Kuota harus 1-1000";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setGeneralError(Object.values(errs)[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setGeneralError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit && location) {
        const payload: UpdateKkmLocationPayload = {
          kabupaten: kabupaten.trim(),
          kecamatan: kecamatan.trim(),
          desa: desa.trim(),
          kuota: Number(kuota),
        };
        await updateKkmLocation(location.id, payload);
      } else {
        const payload: CreateKkmLocationPayload = {
          periode_id: Number(periodeId),
          kabupaten: kabupaten.trim(),
          kecamatan: kecamatan.trim(),
          desa: desa.trim(),
          kuota: Number(kuota),
        };
        await createKkmLocation(payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { message?: string; errors?: Record<string, string[] | string> } | undefined;
        if (status === 401) {
          setGeneralError("Sesi habis. Silakan login ulang.");
          return;
        }
        if (status === 403) {
          setGeneralError("Hanya ADMIN LPPM yang boleh menambah/mengubah lokasi.");
          return;
        }
        if (status === 409) {
          setGeneralError(data?.message || "Desa sudah ada di periode ini.");
          return;
        }
        if (status === 400 && data?.errors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.errors)) mapped[k] = Array.isArray(v) ? v[0] : String(v);
          setFieldErrors(mapped);
          setGeneralError(Object.values(mapped)[0] || data.message || "Validasi gagal.");
          return;
        }
        if (status === 404) {
          setGeneralError(data?.message || "Periode/Lokasi tidak ditemukan.");
          return;
        }
      }
      setGeneralError(errorMessage(err, "Gagal menyimpan lokasi."));
    } finally {
      setSubmitting(false);
    }
  };

  const lockedPeriodeLabel = (() => {
    if (!periodeLockedId) return null;
    const p = periodes.find((x) => x.id === periodeLockedId) || location?.periode;
    if (p) return `${p.nama_periode} (${p.tahun_akademik})`;
    return `Periode #${periodeLockedId}`;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? "Edit Lokasi KKM" : "Tambah Lokasi KKM"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {generalError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</div>}

          {/* Periode */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Periode <span className="text-red-500">*</span>
            </label>
            {isEdit ? (
              <>
                <input
                  value={lockedPeriodeLabel || (location?.periode ? `${location.periode.nama_periode} (${location.periode.tahun_akademik})` : `Periode #${location?.periode_id}`)}
                  disabled
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">Periode tidak bisa diganti saat edit.</p>
              </>
            ) : periodeLockedId ? (
              <>
                <input value={lockedPeriodeLabel || String(periodeLockedId)} disabled className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500" />
                <p className="text-xs text-gray-400 mt-1">Terkunci ke periode yang dipilih di list.</p>
                {fieldErrors.periode_id && <p className="text-xs text-red-600 mt-1">{fieldErrors.periode_id}</p>}
              </>
            ) : (
              <>
                <select
                  value={periodeId}
                  onChange={(e) => setPeriodeId(e.target.value)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.periode_id ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
                >
                  <option value="">Pilih periode</option>
                  {periodes.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.nama_periode} • {p.tahun_akademik} {p.status === "AKTIF" ? "(Aktif)" : ""}
                    </option>
                  ))}
                </select>
                {fieldErrors.periode_id && <p className="text-xs text-red-600 mt-1">{fieldErrors.periode_id}</p>}
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Kabupaten <span className="text-red-500">*</span>
            </label>
            <input
              value={kabupaten}
              onChange={(e) => setKabupaten(e.target.value)}
              placeholder="Kabupaten"
              maxLength={100}
              className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.kabupaten ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
            />
            {fieldErrors.kabupaten && <p className="text-xs text-red-600 mt-1">{fieldErrors.kabupaten}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Kecamatan <span className="text-red-500">*</span>
            </label>
            <input
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              placeholder="Kecamatan"
              maxLength={100}
              className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.kecamatan ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
            />
            {fieldErrors.kecamatan && <p className="text-xs text-red-600 mt-1">{fieldErrors.kecamatan}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Desa <span className="text-red-500">*</span>
            </label>
            <input
              value={desa}
              onChange={(e) => setDesa(e.target.value)}
              placeholder="Desa"
              maxLength={100}
              className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.desa ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
            />
            {fieldErrors.desa && <p className="text-xs text-red-600 mt-1">{fieldErrors.desa}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Kuota Mahasiswa <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={kuota}
              onChange={(e) => setKuota(e.target.value)}
              placeholder="80"
              min={1}
              max={1000}
              className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.kuota ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
            />
            {fieldErrors.kuota ? <p className="text-xs text-red-600 mt-1">{fieldErrors.kuota}</p> : <p className="text-xs text-gray-400 mt-1">1 - 1000</p>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} disabled={submitting} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

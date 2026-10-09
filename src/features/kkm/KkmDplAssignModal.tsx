import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, X, CheckCircle, MapPin, Users, Info, AlertCircle, Loader2, User } from "lucide-react";
import type { KkmDplKelompokItem, KkmDplDosenOption, KkmDplRow } from "./kkmDpl.types";
import type { KkmPeriod } from "./kkmPeriod.types";
import { getKkmPeriods } from "./kkmPeriod.api";
import { assignKkmDpl, getKkmDplDosen, getKkmDplKelompok } from "./kkmDpl.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  periodeLockedId: number | null;
  periodes: KkmPeriod[];
  preselectedDosen?: KkmDplDosenOption | KkmDplRow["dosen"] | null;
  preselectedRow?: KkmDplRow | null;
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

function avatarInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  // Spec: 2 huruf pertama nama — ambil huruf pertama dari 2 kata pertama, e.g. "Dr. Ahmad" -> "DA"
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase() || name.slice(0, 2).toUpperCase();
}

export default function KkmDplAssignModal({ open, onClose, onSuccess, periodeLockedId, periodes: periodesProp, preselectedDosen, preselectedRow }: Props) {
  const isEdit = !!preselectedRow && preselectedRow.is_dpl_aktif;

  const [periodes, setPeriodes] = useState<KkmPeriod[]>(periodesProp);
  const [periodeId, setPeriodeId] = useState<string>(periodeLockedId ? String(periodeLockedId) : "");

  const [dosenSearch, setDosenSearch] = useState("");
  const [dosenOptions, setDosenOptions] = useState<KkmDplDosenOption[]>([]);
  const [dosenLoading, setDosenLoading] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState<KkmDplDosenOption | null>(null);

  const [kelompokSearch, setKelompokSearch] = useState("");
  const [kelompokList, setKelompokList] = useState<KkmDplKelompokItem[]>([]);
  const [kelompokLoading, setKelompokLoading] = useState(false);
  const [selectedKelompok, setSelectedKelompok] = useState<number[]>([]);
  const [maksKelompok, setMaksKelompok] = useState<string>("3");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lock periode to filter
  useEffect(() => {
    if (!open) return;
    if (periodeLockedId) setPeriodeId(String(periodeLockedId));
  }, [open, periodeLockedId]);

  // Initialize periodes if parent didn't provide many
  useEffect(() => {
    if (!open) return;
    if (periodesProp.length > 0) {
      setPeriodes(periodesProp);
      return;
    }
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await getKkmPeriods({ page: 1, limit: 50 });
        if (!cancelled) setPeriodes(res.data || []);
      } catch {
        // ignore
      }
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [open, periodesProp]);

  // Preselect dosen when modal opens via row
  useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setGeneralError(null);
    if (preselectedDosen) {
      const opt: KkmDplDosenOption = {
        id: preselectedDosen.id,
        name: preselectedDosen.name,
        nidn_nip: (preselectedDosen as KkmDplDosenOption).nidn_nip ?? (preselectedDosen as KkmDplRow["dosen"]).nidn_nip,
        fakultas: preselectedDosen.fakultas ?? null,
        prodi: (preselectedDosen as KkmDplDosenOption).prodi ?? (preselectedDosen as KkmDplRow["dosen"]).prodi ?? null,
      };
      setSelectedDosen(opt);
      setDosenSearch(opt.name);
      setDosenOptions([opt]);
    } else {
      setSelectedDosen(null);
      setDosenSearch("");
      setDosenOptions([]);
    }
    // Maksimal default
    if (preselectedRow?.kelompok?.maksimal) {
      setMaksKelompok(String(preselectedRow.kelompok.maksimal));
    } else {
      const p = periodesProp.find((x) => String(x.id) === String(periodeLockedId ?? periodeId)) || periodes.find((x) => String(x.id) === String(periodeLockedId ?? periodeId));
      if (p?.maks_kelompok_per_dosen) setMaksKelompok(String(p.maks_kelompok_per_dosen));
      else setMaksKelompok("3");
    }
    // Selected kelompok for edit: check existing assignment later after kelompok fetch
    setSelectedKelompok([]);
    setKelompokSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preselectedDosen, preselectedRow]);

  // Debounced dosen search
  useEffect(() => {
    if (!open) return;
    if (selectedDosen && dosenSearch === selectedDosen.name) return; // already selected, don't refetch
    let cancelled = false;
    const t = setTimeout(async () => {
      setDosenLoading(true);
      try {
        const res = await getKkmDplDosen({ search: dosenSearch.trim() || undefined, limit: 20 });
        if (!cancelled) setDosenOptions(res.data || []);
      } catch {
        if (!cancelled) setDosenOptions([]);
      } finally {
        if (!cancelled) setDosenLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, dosenSearch, selectedDosen]);

  // Fetch kelompok when periode changes
  useEffect(() => {
    if (!open) return;
    const pid = Number(periodeId);
    if (!pid) {
      setKelompokList([]);
      return;
    }
    let cancelled = false;
    const fetch = async () => {
      setKelompokLoading(true);
      try {
        const unassignedOnly = !isEdit; // create / belum ditugaskan -> only unassigned
        const res = await getKkmDplKelompok({ periode_id: pid, unassigned_only: unassignedOnly, search: kelompokSearch.trim() || undefined });
        if (cancelled) return;
        setKelompokList(res.data || []);
        // For edit, auto-check kelompok owned by this dosen
        if (isEdit && preselectedDosen) {
          const owned = (res.data || []).filter((k) => k.dpl_id === preselectedDosen.id).map((k) => k.id);
          if (owned.length > 0) setSelectedKelompok((prev) => (prev.length === 0 ? owned : prev));
        }
      } catch {
        if (!cancelled) setKelompokList([]);
      } finally {
        if (!cancelled) setKelompokLoading(false);
      }
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [open, periodeId, kelompokSearch, isEdit, preselectedDosen]);

  const periodeSelected = useMemo(() => periodes.find((p) => String(p.id) === periodeId) || null, [periodes, periodeId]);

  const maksNumber = Number(maksKelompok);
  const periodeMaks = periodeSelected?.maks_kelompok_per_dosen ?? null;

  // For edit, existing count contributes to beban
  const existingCount = preselectedRow?.kelompok?.count ?? 0;
  const totalAfter = isEdit ? existingCount + selectedKelompok.filter((id) => !kelompokList.find((k) => k.id === id && k.dpl_id === preselectedDosen?.id)).length : selectedKelompok.length;
  // Simpler: total selected + existing if editing and we show owned as checked, totalAfter = selectedKelompok.length
  // But if owned already counted, selectedKelompok includes owned. So totalAfterSelected = selectedKelompok.length for edit, but need to consider max.
  const bebanTotal = isEdit ? selectedKelompok.length : selectedKelompok.length;
  const bebanMaks = Number.isFinite(maksNumber) && maksNumber > 0 ? maksNumber : 0;

  const toggleKelompok = (id: number) => {
    setSelectedKelompok((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      // Enforce maks
      if (bebanMaks > 0 && prev.length >= bebanMaks) {
        setGeneralError(`Maksimal kelompok ${bebanMaks} sudah tercapai.`);
        return prev;
      }
      if (periodeMaks && prev.length + (isEdit ? 0 : 0) >= periodeMaks) {
        setGeneralError(`Maksimal kelompok untuk periode ini adalah ${periodeMaks}.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedDosen) errs.dosen_id = "Dosen wajib dipilih";
    if (!periodeId) errs.periode_id = "Periode wajib dipilih";
    if (selectedKelompok.length === 0) errs.kelompok_ids = "Pilih minimal 1 kelompok";
    const n = Number(maksKelompok);
    if (!maksKelompok.trim()) errs.maksimal_kelompok = "Maksimal kelompok wajib diisi";
    else if (!Number.isInteger(n) || n < 1 || n > 20) errs.maksimal_kelompok = "Maksimal harus 1-20";
    else if (periodeMaks && n > periodeMaks) errs.maksimal_kelompok = `Maksimal kelompok untuk periode ini adalah ${periodeMaks}`;
    else if (n < selectedKelompok.length) errs.maksimal_kelompok = "Maksimal tidak boleh kurang dari jumlah kelompok terpilih";
    else if (isEdit && n < bebanTotal) errs.maksimal_kelompok = "Maksimal tidak boleh kurang dari total bimbingan";

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
    if (!selectedDosen) return;
    const pid = Number(periodeId);
    setSubmitting(true);
    try {
      await assignKkmDpl({
        dosen_id: selectedDosen.id,
        periode_id: pid,
        kelompok_ids: selectedKelompok,
        maksimal_kelompok: Number(maksKelompok),
      });
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
          setGeneralError("Hanya ADMIN LPPM yang boleh menugaskan DPL.");
          return;
        }
        if (status === 409) {
          setGeneralError(data?.message || "Kelompok sudah ditugaskan ke DPL lain.");
          return;
        }
        if (status === 400) {
          if (data?.errors) {
            const mapped: Record<string, string> = {};
            for (const [k, v] of Object.entries(data.errors)) mapped[k] = Array.isArray(v) ? v[0] : String(v);
            setFieldErrors(mapped);
            setGeneralError(Object.values(mapped)[0] || data.message || "Validasi gagal.");
            return;
          }
          setGeneralError(data?.message || "Validasi gagal.");
          return;
        }
        if (status === 404) {
          setGeneralError(data?.message || "Periode/Dosen/Kelompok tidak ditemukan.");
          return;
        }
      }
      setGeneralError(errorMessage(err, "Gagal menugaskan DPL."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const isDosenLocked = !!preselectedDosen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{isEdit ? "Edit Penugasan DPL KKM" : "Tugaskan DPL Baru"}</h2>
            <p className="text-sm text-gray-500">{isEdit ? "Ubah penugasan kelompok untuk DPL ini" : "Tugaskan dosen sebagai pembimbing lapangan"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {generalError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={14} /> {generalError}</div>}

          {/* Pilih Dosen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Dosen <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama dosen..."
                value={dosenSearch}
                onChange={(e) => {
                  if (isDosenLocked) return;
                  setDosenSearch(e.target.value);
                  if (selectedDosen && e.target.value !== selectedDosen.name) setSelectedDosen(null);
                }}
                disabled={isDosenLocked}
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${fieldErrors.dosen_id ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
              />
            </div>
            {fieldErrors.dosen_id && <p className="text-xs text-red-600 mt-1">{fieldErrors.dosen_id}</p>}
            {!isDosenLocked ? (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-1 bg-white">
                {dosenLoading ? (
                  <div className="px-3 py-6 text-center text-sm text-gray-400 flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Memuat dosen...</div>
                ) : dosenOptions.length > 0 ? (
                  dosenOptions.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setSelectedDosen(d);
                        setDosenSearch(d.name);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${selectedDosen?.id === d.id ? "bg-red-50 border border-red-200" : "hover:bg-gray-50 border border-transparent"}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                        {avatarInitials(d.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                        <p className="text-xs text-gray-500 truncate">{d.nidn_nip} · {d.fakultas || "-"} · {d.prodi || "-"}</p>
                      </div>
                      {selectedDosen?.id === d.id && <CheckCircle size={16} className="text-red-600 flex-shrink-0" />}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">Tidak ada dosen ditemukan</div>
                )}
              </div>
            ) : selectedDosen ? (
              <div className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-600">{avatarInitials(selectedDosen.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{selectedDosen.name}</p>
                  <p className="text-xs text-gray-500">{selectedDosen.nidn_nip} · {selectedDosen.fakultas || "-"} {selectedDosen.prodi ? `· ${selectedDosen.prodi}` : ""}</p>
                </div>
                <CheckCircle size={16} className="text-red-600" />
              </div>
            ) : null}
          </div>

          {/* Periode KKM */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Periode KKM <span className="text-red-500">*</span>
            </label>
            {periodeLockedId ? (
              <>
                <input
                  value={periodeSelected ? `${periodeSelected.nama_periode} • ${periodeSelected.tahun_akademik} ${periodeSelected.status === "AKTIF" ? "(Aktif)" : `(${periodeSelected.status})`}` : `Periode #${periodeLockedId}`}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">Terkunci ke periode di filter.</p>
              </>
            ) : (
              <select
                value={periodeId}
                onChange={(e) => setPeriodeId(e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.periode_id ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
              >
                <option value="">Pilih periode</option>
                {periodes.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nama_periode} • {p.tahun_akademik} {p.status === "AKTIF" ? "(Aktif)" : `(${p.status})`}
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.periode_id && <p className="text-xs text-red-600 mt-1">{fieldErrors.periode_id}</p>}
          </div>

          {/* Kelompok KKM */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kelompok KKM <span className="text-red-500">*</span> {selectedKelompok.length > 0 && <span className="text-gray-500 font-normal">({selectedKelompok.length} dipilih)</span>}
              </label>
              <div className="relative w-40">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Cari desa..."
                  value={kelompokSearch}
                  onChange={(e) => setKelompokSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
            {fieldErrors.kelompok_ids && <p className="text-xs text-red-600 mb-1">{fieldErrors.kelompok_ids}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50/50">
              {kelompokLoading ? (
                <div className="col-span-2 py-8 text-center text-sm text-gray-400 flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Memuat kelompok...</div>
              ) : kelompokList.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-sm text-gray-500">Tidak ada kelompok tersedia untuk periode ini</div>
              ) : (
                kelompokList.map((k) => {
                  const checked = selectedKelompok.includes(k.id);
                  const desa = k.lokasi?.desa || k.desa || "-";
                  const kuota = k.lokasi?.kuota ?? k.kuota ?? "-";
                  const isOwned = isEdit && k.dpl_id === preselectedDosen?.id;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => toggleKelompok(k.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${checked ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"} ${isOwned ? "ring-1 ring-amber-200" : ""}`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? "bg-red-600 border-red-600" : "border-gray-300 bg-white"}`}>
                        {checked && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{k.nama || `Kelompok ${String(k.id).padStart(2, "0")}`}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={12} className="flex-shrink-0" />
                          <span className="truncate">{desa}</span>
                          <span>·</span>
                          <Users size={12} className="flex-shrink-0" />
                          <span>{kuota}</span>
                          {isOwned && <span className="text-amber-600">· milik Anda</span>}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{isEdit ? "Kelompok milik Anda berlabel · milik Anda. Pilih tambahan, uncheck untuk melepas (BE akan assign ulang)." : "Hanya kelompok tanpa DPL yang tampil."}</p>
          </div>

          {/* Maksimal Kelompok */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Maksimal Kelompok</label>
            <input
              type="number"
              min={1}
              max={20}
              value={maksKelompok}
              onChange={(e) => setMaksKelompok(e.target.value)}
              placeholder="3"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${fieldErrors.maksimal_kelompok ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
            />
            {fieldErrors.maksimal_kelompok ? <p className="text-xs text-red-600 mt-1">{fieldErrors.maksimal_kelompok}</p> : <p className="text-xs text-gray-400 mt-1">1 - 20 {periodeMaks ? `· maksimal periode: ${periodeMaks}` : ""}</p>}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Beban Bimbingan</span>
                <span className="font-semibold text-green-600">{bebanTotal} dari {bebanMaks || "?"} kelompok</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${bebanMaks > 0 ? Math.min(100, (bebanTotal / bebanMaks) * 100) : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Info boxes */}
          <div className="space-y-2">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Aktifkan akses menu KKM otomatis</p>
                <p className="text-xs text-blue-600">Dosen akan otomatis memperoleh akses fitur KKM pada akun mereka.</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Role tetap DOSEN.</p>
                <p className="text-xs text-amber-700">Dosen memperoleh akses KKM berdasarkan penugasan aktif oleh LPPM. Akses otomatis dicabut saat penugasan berakhir.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 flex-shrink-0">
          <button onClick={onClose} disabled={submitting} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting || !selectedDosen || !periodeId || selectedKelompok.length === 0}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Menugaskan..." : "Tugaskan Sebagai DPL"}
          </button>
        </div>
      </div>
    </div>
  );
}

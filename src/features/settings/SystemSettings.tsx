import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Save,
} from "lucide-react";

// =====================================================================
// State & data di bawah ini murni UI (belum terhubung ke API/backend).
// Ganti dengan data asli begitu endpoint pengaturan sistem tersedia.
// =====================================================================

type ToggleKey =
  | "notifikasiEmail"
  | "notifikasiSistem"
  | "bukaPendaftaranKkm"
  | "modeMaintenance";

export default function SystemSettings() {
  const [tahunAkademik, setTahunAkademik] = useState("2025/2026");
  const [maksProposalPerDosen, setMaksProposalPerDosen] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    notifikasiEmail: true,
    notifikasiSistem: true,
    bukaPendaftaranKkm: true,
    modeMaintenance: false,
  });

  const infoSistem = {
    versiAplikasi: "v2.1.0",
    integrasiSso: "Aktif",
    database: "Online",
    lastBackup: "14 Juni 2026, 03:00",
  };

  const handleToggle = (key: ToggleKey) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: sambungkan ke API simpan pengaturan sistem, contoh:
      // await updateSystemSettings({
      //   tahunAkademik,
      //   maksProposalPerDosen,
      //   ...toggles,
      // });
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-sm text-gray-500 mt-1">
          Konfigurasi global Sistem Informasi LPPM UMC
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PENGATURAN UMUM */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100">
              <Settings size={16} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Pengaturan Umum</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Tahun Akademik Aktif
              </label>
              <select
                value={tahunAkademik}
                onChange={(e) => setTahunAkademik(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200 cursor-pointer"
              >
                <option value="2024/2025">2024/2025</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Maks. Proposal Per Dosen
              </label>
              <input
                type="number"
                min={1}
                value={maksProposalPerDosen}
                onChange={(e) =>
                  setMaksProposalPerDosen(Number(e.target.value))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
          </div>
        </div>

        {/* NOTIFIKASI */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-100">
              <Bell size={16} className="text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Notifikasi</h2>
          </div>

          <div className="space-y-5">
            <ToggleRow
              title="Notifikasi Email"
              desc="Kirim email untuk setiap update proposal"
              checked={toggles.notifikasiEmail}
              onChange={() => handleToggle("notifikasiEmail")}
            />
            <ToggleRow
              title="Notifikasi Sistem"
              desc="Tampilkan notifikasi in-app"
              checked={toggles.notifikasiSistem}
              onChange={() => handleToggle("notifikasiSistem")}
            />
          </div>
        </div>

        {/* AKSES & KEAMANAN */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100">
              <Shield size={16} className="text-red-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Akses & Keamanan</h2>
          </div>

          <div className="space-y-5">
            <ToggleRow
              title="Buka Pendaftaran KKM"
              desc="Izinkan mahasiswa mendaftar KKM"
              checked={toggles.bukaPendaftaranKkm}
              onChange={() => handleToggle("bukaPendaftaranKkm")}
            />
            <ToggleRow
              title="Mode Maintenance"
              desc="Nonaktifkan akses publik sementara"
              checked={toggles.modeMaintenance}
              onChange={() => handleToggle("modeMaintenance")}
            />
          </div>
        </div>

        {/* INFO SISTEM */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100">
              <Database size={16} className="text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Info Sistem</h2>
          </div>

          <div className="space-y-4">
            <InfoRow label="Versi Aplikasi" value={infoSistem.versiAplikasi} />
            <InfoRow
              label="Integrasi SSO"
              value={infoSistem.integrasiSso}
              success
            />
            <InfoRow label="Database" value={infoSistem.database} success />
            <InfoRow label="Last Backup" value={infoSistem.lastBackup} />
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 cursor-pointer transition-colors"
        >
          <Save size={16} />
          {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
          checked ? "bg-red-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
  success,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span
        className={`font-medium ${
          success ? "text-gray-800" : "text-gray-800"
        }`}
      >
        {value}
        {success && <span className="text-green-500 ml-1">✓</span>}
      </span>
    </div>
  );
}
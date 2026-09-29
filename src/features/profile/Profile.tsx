import { useState } from "react";
import {
  Pencil,
  User,
  ShieldCheck,
  Building2,
  BookOpen,
  Mail,
  Phone,
  Bell,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { APP_ROLES } from "@/constant/roles";

// =====================================================================
// Preferensi notifikasi — UI ONLY, state lokal (belum tersimpan ke server).
// Ganti dengan pemanggilan API begitu endpoint simpan preferensi tersedia.
// =====================================================================
type NotifKey = "email" | "sistem" | "reminder";

export default function Profile() {
  const user = useAuthStore((state) => state.user);

  const [notifPrefs, setNotifPrefs] = useState<Record<NotifKey, boolean>>({
    email: true,
    sistem: true,
    reminder: true,
  });

  const toggleNotif = (key: NotifKey) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const namaLengkap = user?.name || "-";
  const nidn = user?.nidn_nip || "-";
  const roleKey = user?.roles?.roles;
  const isDosen = roleKey === APP_ROLES.DOSEN;

  // Field di bawah ini BELUM DIPASTIKAN ada di object `user` dari useAuthStore.
  const fakultas = (user as any)?.fakultas || "-";
  const programStudi = (user as any)?.program_studi || "-";
  const emailUmc = (user as any)?.email || "-";
  const noHandphone = (user as any)?.phone || "-";

  // Section "Penugasan DPL KKM" — belum ada API/data untuk ini.
  const dplAssignment: {
    periode: string;
    jumlahKelompok: number;
    totalMahasiswa: number;
    statusAktif: boolean;
  } | null = null;

  const isDplKkm = !!dplAssignment;

  const initial = namaLengkap !== "-" ? namaLengkap.trim().charAt(0).toUpperCase() : "?";

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola informasi akun dan preferensi notifikasi.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 cursor-pointer"
        >
          <Pencil size={15} />
          Edit Profil
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white mb-6">
        <div className="h-3 bg-red-600" />

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initial}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{namaLengkap}</h2>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {isDosen && (
                  <span className="inline-block text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                    Dosen
                  </span>
                )}
                {isDplKkm && (
                  <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    DPL KKM
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 border-t border-gray-100">
            <ProfileRow icon={User} label="Nama Lengkap" value={namaLengkap} />
            <ProfileRow icon={ShieldCheck} label="NIDN" value={nidn} />
            <ProfileRow icon={Building2} label="Fakultas" value={fakultas} />
            <ProfileRow icon={BookOpen} label="Program Studi" value={programStudi} />
            <ProfileRow icon={Mail} label="Email UMC" value={emailUmc} />
            <ProfileRow icon={Phone} label="No. Handphone" value={noHandphone} />
            <ProfileRow
              icon={ShieldCheck}
              label="Role Sistem"
              value={isDosen ? (isDplKkm ? "Dosen + DPL KKM" : "Dosen") : roleKey || "-"}
            />
          </div>
        </div>
      </div>

      {dplAssignment && (
        <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-6 mb-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
            <ShieldCheck size={16} className="text-red-500" />
            Penugasan DPL KKM
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400">Periode KKM</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{dplAssignment.periode}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400">Jumlah Kelompok</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{dplAssignment.jumlahKelompok} Kelompok</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400">Total Mahasiswa</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{dplAssignment.totalMahasiswa} Mahasiswa</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400">Status Penugasan</p>
              <p className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1">
                {dplAssignment.statusAktif ? "Aktif" : "Tidak Aktif"}
                {dplAssignment.statusAktif && <span className="text-green-500">✓</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
          <Bell size={16} className="text-red-500" />
          Preferensi Notifikasi
        </h3>

        <div className="space-y-5">
          <NotifRow
            title="Notifikasi Email"
            desc="Terima update via email UMC"
            checked={notifPrefs.email}
            onChange={() => toggleNotif("email")}
          />
          <NotifRow
            title="Notifikasi Sistem"
            desc="Tampilkan notifikasi dalam aplikasi"
            checked={notifPrefs.sistem}
            onChange={() => toggleNotif("sistem")}
          />
          <NotifRow
            title="Reminder Deadline"
            desc="Pengingat batas pengumpulan logbook"
            checked={notifPrefs.reminder}
            onChange={() => toggleNotif("reminder")}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function NotifRow({
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
import MasterUsers from "./MasterUsers";
import { APP_ROLES } from "@/constant/roles";

/** Angkatan diturunkan dari 2 digit pertama NIM (mis. NIM 2305... → 2023). */
function deriveAngkatan(nim?: string | null): string {
  if (nim && /^\d{2}/.test(nim)) return `20${nim.slice(0, 2)}`;
  return "-";
}

/** Master Data — Mahasiswa (user role MAHASISWA). Status hanya Aktif/Nonaktif. */
export default function MasterMahasiswa() {
  return (
    <MasterUsers
      role={APP_ROLES.MAHASISWA}
      title="Master Mahasiswa"
      subtitle="Daftar seluruh mahasiswa terdaftar dalam sistem SIP3M"
      identityLabel="NIM"
      extraColumns={[
        {
          header: "Angkatan",
          render: (user) => (
            <span className="font-medium text-gray-700">
              {deriveAngkatan(user.nidn)}
            </span>
          ),
        },
      ]}
    />
  );
}

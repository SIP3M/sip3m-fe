import MasterUsers from "./MasterUsers";
import { APP_ROLES } from "@/constant/roles";

/** Master Data — Dosen (user role DOSEN). */
export default function MasterDosen() {
  return (
    <MasterUsers
      role={APP_ROLES.DOSEN}
      title="Master Dosen"
      subtitle="Daftar seluruh dosen terdaftar dalam sistem SIP3M"
      identityLabel="NIDN/NIP"
    />
  );
}

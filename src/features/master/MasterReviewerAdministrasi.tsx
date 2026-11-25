import MasterUsers from "./MasterUsers";
import { APP_ROLES } from "@/constant/roles";

/** Master Data — Reviewer Administrasi (user role REVIEWER_ADMINISTRASI). */
export default function MasterReviewerAdministrasi() {
  return (
    <MasterUsers
      role={APP_ROLES.REVIEWER_ADMINISTRASI}
      title="Master Reviewer Administrasi"
      subtitle="Akun verifikator administrasi yang memeriksa kelengkapan berkas proposal dan pendaftaran peserta KKM"
      identityLabel="NIP"
      searchPlaceholder="Cari nama, email, atau NIP verifikator..."
    />
  );
}

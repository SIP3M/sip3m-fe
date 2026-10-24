import MasterUsers from "./MasterUsers";
import { APP_ROLES } from "@/constant/roles";

/** Master Data — Reviewer (user role REVIEWER). */
export default function MasterReviewer() {
  return (
    <MasterUsers
      role={APP_ROLES.REVIEWER}
      title="Master Reviewer"
      subtitle="Daftar reviewer beserta bidang keahlian dan beban review"
      identityLabel="NIDN"
      extraColumns={[
        {
          header: "Bidang Keahlian",
          render: (user) => user.bidang_keahlian || "-",
        },
        {
          header: "Beban Review",
          render: (user) => (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50">
              {user.beban_review ?? 0} penugasan
            </span>
          ),
        },
      ]}
    />
  );
}

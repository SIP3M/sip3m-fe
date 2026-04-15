import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { User as UserIcon } from "lucide-react";
import ProposalReviewerRow from "./components/ProposalReviewerRow";
import { ReviewProposal, ReviewerOption } from "./review.types";
import { getAllProposals } from "@/features/proposals/proposal.api";
import { APP_ROLES, AppRole } from "@/constant/roles";
import { getUsers } from "@/features/users/Users.api";
import { User } from "@/features/users/users.types";
import { assignReviewers } from "./review.api";

const ACTIVE_STATUS = "active" as const;

const mapProposalStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const mapReviewProposal = (proposal: {
  id: number;
  title: string;
  skema: string;
  status: string;
}): ReviewProposal => ({
  id: proposal.id,
  title: proposal.title,
  category: proposal.skema,
  status: mapProposalStatusLabel(proposal.status),
  reviewer: "",
});

const mapReviewerOption = (user: User): ReviewerOption | null => {
  const role = user.roles.roles;

  if (role !== APP_ROLES.REVIEWER && role !== APP_ROLES.REVIEWER_EKSTERNAL) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
  };
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
};

const fetchAllUsersByRole = async (role: AppRole): Promise<User[]> => {
  const first = await getUsers({ page: 1, roles: role, status: ACTIVE_STATUS });
  const users = [...first.data];
  const totalPages = first.pagination?.total_pages || 1;

  if (totalPages > 1) {
    const requests: ReturnType<typeof getUsers>[] = [];
    for (let page = 2; page <= totalPages; page++) {
      requests.push(getUsers({ page, roles: role, status: ACTIVE_STATUS }));
    }

    const rest = await Promise.all(requests);
    rest.forEach((res) => users.push(...res.data));
  }

  return users;
};

export default function ReviewList() {
  const [proposals, setProposals] = useState<ReviewProposal[]>([]);
  const [reviewers, setReviewers] = useState<ReviewerOption[]>([]);

  const [selectedProposal, setSelectedProposal] =
    useState<ReviewProposal | null>(null);
  const [reviewerA, setReviewerA] = useState("");
  const [reviewerB, setReviewerB] = useState("");

  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProposals = async () => {
    setIsLoadingProposals(true);
    try {
      const first = await getAllProposals({ page: 1 });
      const allProposals = [...first.data];
      const totalPages = first.meta.totalPages || 1;

      if (totalPages > 1) {
        const requests: ReturnType<typeof getAllProposals>[] = [];
        for (let page = 2; page <= totalPages; page++) {
          requests.push(getAllProposals({ page }));
        }

        const rest = await Promise.all(requests);
        rest.forEach((res) => allProposals.push(...res.data));
      }

      const mapped = allProposals.map((item) =>
        mapReviewProposal({
          id: item.id,
          title: item.title,
          skema: item.skema,
          status: item.status,
        }),
      );

      setProposals(mapped);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal memuat daftar proposal."));
    } finally {
      setIsLoadingProposals(false);
    }
  };

  const loadReviewers = async () => {
    setIsLoadingReviewers(true);
    try {
      const [internalReviewers, externalReviewers] = await Promise.all([
        fetchAllUsersByRole(APP_ROLES.REVIEWER),
        fetchAllUsersByRole(APP_ROLES.REVIEWER_EKSTERNAL),
      ]);

      const merged = [...internalReviewers, ...externalReviewers]
        .map(mapReviewerOption)
        .filter((item): item is ReviewerOption => item !== null);

      const unique = Array.from(new Map(merged.map((x) => [x.id, x])).values());
      setReviewers(unique);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal memuat daftar reviewer."));
    } finally {
      setIsLoadingReviewers(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadProposals(), loadReviewers()]);
  }, []);

  const handleSelectProposal = (proposal: ReviewProposal) => {
    setSelectedProposal(proposal);
    setReviewerA("");
    setReviewerB("");
    setSuccessMessage(null);
    setError(null);
  };

  const isEligibleProposal =
    selectedProposal?.status?.toUpperCase() === "ADMIN VERIFIED";

  const reviewerBOptions = useMemo(
    () => reviewers.filter((r) => String(r.id) !== reviewerA),
    [reviewers, reviewerA],
  );

  const handleAssign = async () => {
    if (!selectedProposal) return;

    setError(null);
    setSuccessMessage(null);

    if (!isEligibleProposal) {
      setError(
        "Reviewer hanya dapat ditugaskan untuk proposal berstatus ADMIN_VERIFIED.",
      );
      return;
    }

    if (!reviewerA || !reviewerB) {
      setError("Harus memilih tepat 2 reviewer.");
      return;
    }

    if (reviewerA === reviewerB) {
      setError("ID reviewer tidak boleh sama.");
      return;
    }

    setIsAssigning(true);
    try {
      const res = await assignReviewers(selectedProposal.id, [
        Number(reviewerA),
        Number(reviewerB),
      ]);

      setSuccessMessage(res.message);

      await loadProposals();

      setSelectedProposal((prev) =>
        prev
          ? {
              ...prev,
              status: mapProposalStatusLabel(res.data.status),
            }
          : prev,
      );
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Terjadi kesalahan pada server saat menugaskan reviewer.",
        ),
      );
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="p-10 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Plotting Reviewer</h1>
        <p className="text-gray-500 text-sm">
          Tentukan reviewer untuk proposal yang masuk
        </p>

        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Catatan: Proposal hanya bisa ditugaskan ke reviewer jika statusnya
          <span className="font-semibold"> ADMIN_VERIFIED</span>.
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-[2fr_1fr] gap-6">

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Judul Proposal</th>
                <th className="px-6 py-4 text-left font-medium">Kategori</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingProposals ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Memuat proposal...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada proposal.
                  </td>
                </tr>
              ) : (
                proposals.map((p) => (
                  <ProposalReviewerRow
                    key={p.id}
                    proposal={p}
                    onSelect={handleSelectProposal}
                  />
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 min-w-[280px] flex flex-col justify-between">

          {selectedProposal ? (
            <div>
              <h2 className="font-semibold text-gray-800 mb-1">
                Tugaskan Reviewer
              </h2>

              <p className="text-xs text-gray-400 mb-4">
                ID: PROP-00{selectedProposal.id}
              </p>

              <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700 mb-4">
                {selectedProposal.title}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Pilih Reviewer 1
                  </label>
                  <select
                    value={reviewerA}
                    onChange={(e) => setReviewerA(e.target.value)}
                    disabled={isLoadingReviewers || isAssigning}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Pilih reviewer pertama</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name} ({reviewer.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Pilih Reviewer 2 (Opsional)
                  </label>
                  <select
                    value={reviewerB}
                    onChange={(e) => setReviewerB(e.target.value)}
                    disabled={isLoadingReviewers || isAssigning}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Pilih reviewer kedua</option>
                    {reviewerBOptions.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name} ({reviewer.role})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => void handleAssign()}
                  disabled={
                    isAssigning || isLoadingReviewers || !isEligibleProposal
                  }
                  className={`w-full rounded-lg px-4 py-2 text-white ${
                    isAssigning || isLoadingReviewers || !isEligibleProposal
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isAssigning ? "Menyimpan..." : "Simpan Penugasan"}
                </button>

                {!isEligibleProposal && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                    Proposal harus berstatus ADMIN_VERIFIED sebelum reviewer bisa ditugaskan.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
              <UserIcon size={48} className="mb-3" />
              <p>
                Pilih proposal di sebelah kiri
                <br />
                untuk menugaskan reviewer.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
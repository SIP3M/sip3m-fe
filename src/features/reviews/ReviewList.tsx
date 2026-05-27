import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Search, User as UserIcon } from "lucide-react";
import ProposalReviewerRow from "./components/ProposalReviewerRow";
import { ReviewProposal } from "./review.types";
import { getAllProposals } from "@/features/proposals/proposal.api";
import { assignReviewers } from "./review.api";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 5;

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "REVISION", label: "Revision" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "APPROVED", label: "Approved" },
] as const;

type StatusFilterValue = (typeof STATUS_FILTER_OPTIONS)[number]["value"];
type ProposalStatusFilterValue = Exclude<StatusFilterValue, "ALL">;

const normalizeStatus = (status: string) => status.trim().toUpperCase();

const isStatusFilteredResult = (
  items: Array<{ status: string }>,
  selectedStatus: StatusFilterValue,
) => {
  if (selectedStatus === "ALL") return true;
  const target = normalizeStatus(selectedStatus);
  return items.every((item) => normalizeStatus(item.status) === target);
};

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

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
};

export default function ReviewList() {
  const [proposals, setProposals] = useState<ReviewProposal[]>([]);

  const [selectedProposal, setSelectedProposal] =
    useState<ReviewProposal | null>(null);

  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL");

  const loadAllProposalPages = useCallback(async (search = "") => {
    const firstPage = await getAllProposals({ page: 1, search });
    const all = [...firstPage.data];

    if (firstPage.meta.totalPages > 1) {
      const requests: ReturnType<typeof getAllProposals>[] = [];
      for (let page = 2; page <= firstPage.meta.totalPages; page++) {
        requests.push(getAllProposals({ page, search }));
      }

      const rest = await Promise.all(requests);
      rest.forEach((res) => all.push(...res.data));
    }

    return all;
  }, []);

  const loadProposals = useCallback(
    async (page = 1, search = "", status: StatusFilterValue = "ALL") => {
      setIsLoadingProposals(true);
      try {
        const statusParam: ProposalStatusFilterValue | undefined =
          status === "ALL" ? undefined : status;

        const response = await getAllProposals({
          page,
          search,
          status: statusParam,
        });

        // Fallback: jika backend belum menerapkan filter status,
        // pakai filter lokal agar UX tetap berfungsi.
        if (
          status !== "ALL" &&
          response.meta.totalData > 0 &&
          !isStatusFilteredResult(response.data, status)
        ) {
          const allItems = await loadAllProposalPages(search);
          const filteredItems = allItems.filter(
            (item) => normalizeStatus(item.status) === normalizeStatus(status),
          );

          const computedTotalItems = filteredItems.length;
          const computedTotalPages = Math.max(
            1,
            Math.ceil(computedTotalItems / ITEMS_PER_PAGE),
          );
          const safePage = Math.min(page, computedTotalPages);
          const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
          const pagedItems = filteredItems.slice(
            startIndex,
            startIndex + ITEMS_PER_PAGE,
          );

          const mappedFallback = pagedItems.map((item) =>
            mapReviewProposal({
              id: item.id,
              title: item.title,
              skema: item.skema,
              status: item.status,
            }),
          );

          setProposals(mappedFallback);
          setCurrentPage(safePage);
          setTotalPages(computedTotalPages);
          setTotalItems(computedTotalItems);
          return;
        }

        const mapped = response.data.map((item) =>
          mapReviewProposal({
            id: item.id,
            title: item.title,
            skema: item.skema,
            status: item.status,
          }),
        );

        setProposals(mapped);
        setCurrentPage(response.meta.currentPage);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.totalData);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Gagal memuat daftar proposal."));
        setProposals([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setIsLoadingProposals(false);
      }
    },
    [loadAllProposalPages],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    void loadProposals(currentPage, debouncedSearch, statusFilter);
  }, [currentPage, debouncedSearch, statusFilter, loadProposals]);

  const handleSelectProposal = (proposal: ReviewProposal) => {
    setSelectedProposal(proposal);
    setSuccessMessage(null);
    setError(null);
  };

  const isEligibleProposal =
    selectedProposal?.status?.toUpperCase() === "SUBMITTED";

  const handlePageChange = (page: number) => {
    if (page <= 0 || page > totalPages || isLoadingProposals) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAssign = async () => {
    if (!selectedProposal) return;

    setError(null);
    setSuccessMessage(null);

    if (!isEligibleProposal) {
      setError(
        "Reviewer hanya dapat ditugaskan untuk proposal berstatus SUBMITTED.",
      );
      return;
    }

    setIsAssigning(true);
    try {
      const res = await assignReviewers(selectedProposal.id);

      setSuccessMessage(res.message);

      await loadProposals(currentPage, debouncedSearch, statusFilter);

      setSelectedProposal((prev) =>
        prev
          ? {
              ...prev,
              status: mapProposalStatusLabel("UNDER_REVIEW"),
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
        <h1 className="text-2xl font-semibold text-gray-800">
          Plotting Reviewer
        </h1>
        <p className="text-gray-500 text-sm">
          Penugasan reviewer dilakukan otomatis oleh sistem
        </p>

        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Catatan: Tombol plotting otomatis hanya aktif untuk proposal
          <span className="font-semibold"> SUBMITTED</span>.
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div className="flex items-center gap-2 rounded-lg border px-3 md:w-80">
              <Search size={16} className="text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau kategori proposal..."
                className="w-full border-0 bg-transparent py-2 text-sm outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilterValue);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-gray-300 px-3 text-sm"
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left font-medium">
                  Judul Proposal
                </th>
                <th className="px-6 py-4 text-left font-medium">Kategori</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingProposals ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Memuat proposal...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
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

          {totalPages > 1 && (
            <div className="border-t border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                <p className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold">
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      totalItems,
                    )}
                  </span>{" "}
                  hingga{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </span>{" "}
                  dari <span className="font-semibold">{totalItems}</span>{" "}
                  proposal
                </p>

                <p className="text-sm text-gray-500">
                  Halaman <span className="font-semibold">{currentPage}</span>{" "}
                  dari <span className="font-semibold">{totalPages}</span>
                </p>
              </div>

              <div className="flex justify-center px-6 py-4">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoadingProposals}
                />
              </div>
            </div>
          )}
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
                <button
                  type="button"
                  onClick={() => void handleAssign()}
                  disabled={isAssigning || !isEligibleProposal}
                  className={`w-full rounded-lg px-4 py-2 text-white ${
                    isAssigning || !isEligibleProposal
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isAssigning
                    ? "Memproses..."
                    : "Plotting Reviewer (Otomatis)"}
                </button>

                {!isEligibleProposal && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                    Proposal harus berstatus SUBMITTED sebelum reviewer bisa
                    ditugaskan.
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

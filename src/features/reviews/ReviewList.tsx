import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Inbox, Search } from "lucide-react";
import ProposalReviewerRow from "./components/ProposalReviewerRow";
import {
  bulkAssignProposalReviewers,
  getAllProposals,
} from "@/features/proposals/proposal.api";
import { Proposal } from "@/features/proposals/proposal.types";
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

const formatProposalCode = (id: number) =>
  `PROP-${String(id).padStart(4, "0")}`;

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
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposals, setSelectedProposals] = useState<Proposal[]>([]);

  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
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

          setProposals(pagedItems);
          setCurrentPage(safePage);
          setTotalPages(computedTotalPages);
          setTotalItems(computedTotalItems);
          return;
        }

        setProposals(response.data);
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
    setSelectedProposals([]);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void loadProposals(currentPage, debouncedSearch, statusFilter);
  }, [currentPage, debouncedSearch, statusFilter, loadProposals]);

  const submittedProposalsOnPage = useMemo(
    () =>
      proposals.filter(
        (proposal) => normalizeStatus(proposal.status) === "SUBMITTED",
      ),
    [proposals],
  );

  const selectedIds = useMemo(
    () => new Set(selectedProposals.map((proposal) => proposal.id)),
    [selectedProposals],
  );

  const allSubmittedSelected =
    submittedProposalsOnPage.length > 0 &&
    submittedProposalsOnPage.every((proposal) => selectedIds.has(proposal.id));

  const toggleProposalSelection = (proposal: Proposal) => {
    if (normalizeStatus(proposal.status) !== "SUBMITTED") return;

    setSelectedProposals((prev) => {
      const exists = prev.some((item) => item.id === proposal.id);
      if (exists) {
        return prev.filter((item) => item.id !== proposal.id);
      }
      return [...prev, proposal];
    });
    setSuccessMessage(null);
    setError(null);
    setWarningMessage(null);
  };

  const toggleSelectAllOnPage = () => {
    setSelectedProposals((prev) => {
      const currentSubmittedIds = new Set(
        submittedProposalsOnPage.map((proposal) => proposal.id),
      );

      if (allSubmittedSelected) {
        return prev.filter((proposal) => !currentSubmittedIds.has(proposal.id));
      }

      const merged = [...prev];
      submittedProposalsOnPage.forEach((proposal) => {
        if (!merged.some((item) => item.id === proposal.id)) {
          merged.push(proposal);
        }
      });
      return merged;
    });

    setSuccessMessage(null);
    setError(null);
    setWarningMessage(null);
  };

  const handlePageChange = (page: number) => {
    if (page <= 0 || page > totalPages || isLoadingProposals) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBulkAssign = async () => {
    if (selectedProposals.length === 0) return;

    setError(null);
    setSuccessMessage(null);
    setWarningMessage(null);

    const proposalIds = selectedProposals
      .filter((proposal) => normalizeStatus(proposal.status) === "SUBMITTED")
      .map((proposal) => proposal.id);

    if (proposalIds.length === 0) {
      setError("Tidak ada proposal SUBMITTED yang dipilih.");
      return;
    }

    setIsAssigning(true);
    try {
      const res = await bulkAssignProposalReviewers(proposalIds);

      setSuccessMessage(res.message);

      const failedDetails = res.data.failed
        .map((item) => `#${item.proposalId}: ${item.reason}`)
        .join("; ");

      if (failedDetails) {
        setWarningMessage(`Detail kegagalan: ${failedDetails}`);
      }

      await loadProposals(currentPage, debouncedSearch, statusFilter);

      setSelectedProposals([]);
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Terjadi kesalahan pada server saat plotting reviewer massal.",
        ),
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedCount = selectedProposals.length;

  return (
    <div className="min-h-screen p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Plotting Reviewer
        </h1>
        <p className="text-sm text-gray-500">
          Penugasan reviewer dilakukan otomatis oleh sistem.
        </p>

        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Catatan: hanya proposal berstatus{" "}
          <span className="font-semibold">SUBMITTED</span> yang bisa dipilih.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow">
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSubmittedSelected}
                onChange={toggleSelectAllOnPage}
                disabled={submittedProposalsOnPage.length === 0 || isAssigning}
              />
              <span>Pilih semua proposal SUBMITTED pada halaman ini</span>
            </label>

            <span className="font-medium text-gray-500">
              {selectedCount} proposal dipilih
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-4 text-left font-medium">
                  <span className="sr-only">Pilih</span>
                </th>
                <th className="px-4 py-4 text-left font-medium">
                  Judul Proposal
                </th>
                <th className="px-4 py-4 text-left font-medium">Bidang</th>
                <th className="px-4 py-4 text-left font-medium">Status</th>
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
                proposals.map((proposal) => (
                  <ProposalReviewerRow
                    key={proposal.id}
                    proposal={proposal}
                    checked={selectedIds.has(proposal.id)}
                    disabled={isAssigning}
                    onToggle={toggleProposalSelection}
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

        <div className="flex min-w-[280px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow">
          <div>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="mb-1 font-semibold text-gray-800">
                  Ringkasan Plotting
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCount > 0
                    ? "Proposal yang dipilih akan diproses sekaligus."
                    : "Pilih proposal SUBMITTED dari tabel di sebelah kiri."}
                </p>
              </div>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedProposals([])}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Hapus pilihan
                </button>
              )}
            </div>

            <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total dipilih</span>
                <span className="text-lg font-semibold text-gray-800">
                  {selectedCount}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Hanya proposal berstatus SUBMITTED yang akan dikirim ke endpoint
                bulk plotting.
              </p>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
              {selectedProposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-gray-400">
                  <Inbox size={40} className="mb-3" />
                  <p className="text-sm">
                    Belum ada proposal yang dipilih untuk plotting massal.
                  </p>
                </div>
              ) : (
                selectedProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          {formatProposalCode(proposal.id)}
                        </p>
                        <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">
                          {proposal.title}
                        </h3>
                      </div>

                      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-medium text-orange-700">
                        {proposal.status}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      {proposal.faculty || "-"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {warningMessage && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {warningMessage}
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleBulkAssign()}
              disabled={isAssigning || selectedCount === 0}
              className={`w-full rounded-lg px-4 py-2 text-white ${
                isAssigning || selectedCount === 0
                  ? "cursor-not-allowed bg-blue-300"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isAssigning ? "Memproses..." : "Plotting Reviewer Massal"}
            </button>

            <p className="text-xs text-gray-500">
              Setelah proses berhasil, daftar proposal akan dimuat ulang dan
              pilihan yang sudah diproses akan dibersihkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

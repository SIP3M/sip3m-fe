import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "@/components/common/Pagination";
import { getAllProposals } from "./proposal.api";
import { Proposal } from "./proposal.types";

const ITEMS_PER_PAGE = 5;

type StatusFilterValue = "ALL" | "SUBMITTED";
type ProposalStatusFilterValue = "SUBMITTED";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ProposalStaff() {
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter] = useState<StatusFilterValue>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const latestRequestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProposals = async (
    page = 1,
    search = "",
    status: StatusFilterValue = "SUBMITTED",
  ) => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const statusParam: ProposalStatusFilterValue | undefined =
        status === "ALL" ? undefined : status;

      const response = await getAllProposals({
        page,
        search,
        status: statusParam,
      });

      if (requestId !== latestRequestId.current) return;

      setProposals(response.data);
      setCurrentPage(response.meta.currentPage);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalData);
    } catch (err: unknown) {
      if (requestId !== latestRequestId.current) return;

      setError(
        getErrorMessage(err, "Gagal memuat data proposal untuk Staff LPPM."),
      );
      setProposals([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchProposals(currentPage, debouncedSearch, statusFilter);
  }, [currentPage, debouncedSearch, statusFilter]);

  const handlePageChange = (page: number) => {
    if (page <= 0 || page > totalPages || isLoading) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-8">
      {/* TITLE */}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Plotting Reviewer Otomatis
        </h1>
        <p className="text-sm text-gray-500">
          Daftar proposal untuk penugasan reviewer otomatis.
        </p>
      </div>

      {/* CARD */}

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* SEARCH */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center border rounded-lg px-3 w-72">
            <Search size={16} className="text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 outline-none text-sm"
              placeholder="Cari peneliti atau judul proposal..."
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}

        <table className="w-full text-sm">
          <thead className="text-gray-500 text-left border-b">
            <tr>
              <th className="py-3">Tgl Masuk</th>
              <th>Judul Proposal</th>
              <th>Peneliti</th>
              <th>Skema</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Memuat proposal...
                </td>
              </tr>
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Tidak ada proposal sesuai filter.
                </td>
              </tr>
            ) : (
              proposals.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-4">
                    {formatDate(p.submitted_at || p.created_at)}
                  </td>

                  <td className="max-w-xs">{p.title}</td>

                  <td>
                    {p.user?.name || `ID Peneliti: ${p.lead_researcher_id}`}
                  </td>

                  <td>{p.skema}</td>

                  <td>
                    <button
                      onClick={() =>
                        navigate(`/staff-lppm/verifikasi-proposal/${p.id}`)
                      }
                      className="bg-red-600 text-white text-xs px-3 py-1 rounded-md hover:bg-red-700"
                    >
                      verifikasi
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>
                Menampilkan{" "}
                <span className="font-semibold">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}
                </span>{" "}
                hingga{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                </span>{" "}
                dari <span className="font-semibold">{totalItems}</span>{" "}
                proposal
              </p>

              <p>
                Halaman <span className="font-semibold">{currentPage}</span>{" "}
                dari <span className="font-semibold">{totalPages}</span>
              </p>
            </div>

            <div className="flex justify-center">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

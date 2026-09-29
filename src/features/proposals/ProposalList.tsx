import { useEffect, useRef, useState } from "react";
import { Download, Search } from "lucide-react";
import ProposalRow from "./components/ProposalRow";
import { Proposal } from "./proposal.types";
import { getAllProposals } from "./proposal.api";
import Pagination from "@/components/common/Pagination";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {Input} from "@/components/ui/input";

const ITEMS_PER_PAGE = 5;

export default function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [skemaQuery, setSkemaQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [tahunQuery, setTahunQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const latestRequestId = useRef(0);

  const fetchProposals = async (page = 1, search = "") => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAllProposals({ page, search });

      if (requestId !== latestRequestId.current) return;

      setProposals(response.data);
      setCurrentPage(response.meta.currentPage);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalData);
    } catch (err: unknown) {
      if (requestId !== latestRequestId.current) return;

      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.message ||
          "Gagal mengambil data proposal"
        : err instanceof Error
          ? err.message
          : "Gagal mengambil data proposal";
      setError(message);
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    void fetchProposals(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const handlePageChange = (page: number) => {
    if (page <= 0 || page > totalPages || isLoading) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-8">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Proposal</h1>

          <p className="text-gray-500 text-sm">
            Seluruh proposal penelitian dan pengabdian
          </p>
        </div>

        <Button variant="outline" className="cursor-pointer px-4 py-2 rounded-lg text-sm shadow transition">
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* FILTER BAR */}

      {/* FILTER BAR */}
<Card className="mb-6">
  <CardContent className="p-4">
    <div className="flex flex-wrap gap-4 md:flex-nowrap">

      {/* Skema */}
      <Input
        value={skemaQuery}
        onChange={(e) => setSkemaQuery(e.target.value)}
        className="w-52"
        placeholder="Skema"
      />

      {/* Status */}
      <Input
        value={statusQuery}
        onChange={(e) => setStatusQuery(e.target.value)}
        className="w-52"
        placeholder="Status"
      />

      {/* Tahun */}
      <Input
        value={tahunQuery}
        onChange={(e) => setTahunQuery(e.target.value)}
        className="w-52"
        placeholder="Tahun"
      />

      {/* Search Button */}
      <Button
        type="button"
        variant="outline"
        className="gap-2 h-11 cursor-pointer"
        onClick={() => {
          setDebouncedSearch(searchQuery.trim());
          setCurrentPage(1);
        }}
      >
        <Search className="h-4 w-4" />
        Search
      </Button>
    </div>
  </CardContent>
</Card>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading && (
          <div className="p-6 text-center text-sm text-gray-500">
            Memuat data proposal...
          </div>
        )}

        {!isLoading && proposals.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            Tidak ada proposal ditemukan.
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">Judul Proposal</th>
              <th className="px-6 py-4">Peneliti</th>
              <th className="px-6 py-4">Skema</th>
              <th className="px-6 py-4">Tahun</th>
              <th className="px-6 py-4">Anggaran</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {proposals.map((p, idx) => (
              <ProposalRow
                key={p.id}
                proposal={p}
                rowNumber={(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
              />
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="border-t border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600">
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
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

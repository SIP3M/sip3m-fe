import axios from "axios";
import { FileText, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import NewtonCradleLoader from "@/components/common/NewtonCradleLoader";
import Pagination from "@/components/common/Pagination";
import { getPengabdianRepository } from "../repository.api";
import type { PengabdianRepositoryItem, RepositoryMeta } from "../repository.types";
import SearchPill from "./SearchPill";

const PAGE_SIZE = 5;

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const extractErrorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError(error)
    ? (error.response?.data as { message?: string } | undefined)?.message ??
      error.message
    : fallback;

export default function PengabdianRepositoryTab() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [retryTick, setRetryTick] = useState(0);
  const [items, setItems] = useState<PengabdianRepositoryItem[]>([]);
  const [meta, setMeta] = useState<RepositoryMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPengabdianRepository({ page, limit: PAGE_SIZE, search })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err, "Gagal memuat repository pengabdian."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search, retryTick]);

  const handleSearch = () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setSearch(searchInput.trim());
    setRetryTick((tick) => tick + 1);
  };

  const handlePageChange = (nextPage: number) => {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  };

  return (
    <div>
      {/* SEARCH */}
      <div className="flex justify-center mb-6">
        <SearchPill
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          placeholder="Cari judul pengabdian atau nama ketua..."
        />
      </div>

      {/* JUMLAH */}
      <div className="mb-4">
        <h2 className="text-sm font-medium text-gray-700">
          Pengabdian Selesai{meta ? ` (${meta.totalData})` : ""}
        </h2>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex justify-center py-16">
          <NewtonCradleLoader />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-red-500 py-16">{error}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-gray-400 py-16">
          <SearchX size={32} />
          <p className="text-sm">Data tidak ditemukan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const report = item.documents[0];

            return (
              <div key={item.id} className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md">
                      {item.project_code ?? "Pengabdian"}
                    </span>

                    <h3 className="mt-2 text-base font-semibold text-gray-800">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {item.proposal.user.name} • {formatDate(item.created_at)}
                    </p>
                  </div>

                  {report && (
                    <button
                      onClick={() =>
                        window.open(report.public_url, "_blank", "noopener,noreferrer")
                      }
                      className="shrink-0 cursor-pointer flex items-center gap-1 text-xs border px-3 py-1.5 rounded-md hover:bg-gray-100"
                    >
                      <FileText size={14} />
                      Laporan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
}

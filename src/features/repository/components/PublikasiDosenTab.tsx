import axios from "axios";
import { ExternalLink, FileDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import NewtonCradleLoader from "@/components/common/NewtonCradleLoader";
import Pagination from "@/components/common/Pagination";
import { getPublikasi } from "../repository.api";
import type { PublikasiItem, PublikasiSort } from "../repository.types";
import SearchPill from "./SearchPill";

const PAGE_SIZE = 10;
const MIN_SEARCH_LENGTH = 2;

const SORT_OPTIONS: { key: PublikasiSort; label: string }[] = [
  { key: "relevance", label: "Relevan" },
  { key: "terbaru", label: "Terbaru" },
  { key: "terpopuler", label: "Terpopuler" },
];

const extractErrorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError(error)
    ? (error.response?.data as { message?: string } | undefined)?.message ??
      error.message
    : fallback;

export default function PublikasiDosenTab() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<PublikasiSort>("relevance");
  const [retryTick, setRetryTick] = useState(0);
  const [items, setItems] = useState<PublikasiItem[]>([]);
  const [totalData, setTotalData] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (search.trim().length < MIN_SEARCH_LENGTH) return;

    let cancelled = false;

    getPublikasi({ search, page, limit: PAGE_SIZE, sort })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setTotalData(res.meta.totalData);
        setTotalPages(res.meta.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err, "Gagal memuat publikasi."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, page, sort, retryTick]);

  const handleSearch = () => {
    const trimmed = searchInput.trim();

    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setError(`Masukkan minimal ${MIN_SEARCH_LENGTH} karakter untuk mencari.`);
      setItems([]);
      setTotalData(null);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    setError(null);
    setPage(1);
    setSearch(trimmed);
    setRetryTick((tick) => tick + 1);
  };

  const handleSort = (nextSort: PublikasiSort) => {
    setLoading(true);
    setError(null);
    setSort(nextSort);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-16">
          <NewtonCradleLoader />
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-sm text-red-500 py-16">{error}</div>;
    }

    if (search.trim().length < MIN_SEARCH_LENGTH) {
      return (
        <div className="flex flex-col items-center gap-2 text-gray-400 py-16">
          <Search size={32} />
          <p className="text-sm">
            Masukkan nama dosen, judul publikasi, atau kata kunci untuk mulai
            mencari.
          </p>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 text-gray-400 py-16">
          <Search size={32} />
          <p className="text-sm">Publikasi tidak ditemukan.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item) => {
          const extraAuthors =
            item.author_count - item.authors.length;

          return (
            <div key={item.id} className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md">
                    {item.venue ?? "Publikasi"}
                  </span>

                  <h3 className="mt-2 text-base font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    {item.authors.join(", ")}
                    {extraAuthors > 0 && ` (+${extraAuthors} penulis lain)`}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {[item.year, item.cited_by_count > 0 ? `${item.cited_by_count} sitasi` : null]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {item.pdf_url && (
                    <button
                      onClick={() => window.open(item.pdf_url!, "_blank", "noopener,noreferrer")}
                      className="cursor-pointer flex items-center gap-1 text-xs border px-3 py-1.5 rounded-md hover:bg-gray-100"
                    >
                      <FileDown size={14} />
                      PDF
                    </button>
                  )}

                  {(item.doi || item.url) && (
                    <button
                      onClick={() =>
                        window.open(item.doi ?? item.url!, "_blank", "noopener,noreferrer")
                      }
                      className="cursor-pointer flex items-center gap-1 text-xs border px-3 py-1.5 rounded-md hover:bg-gray-100"
                    >
                      <ExternalLink size={14} />
                      {item.doi ? "DOI" : "Artikel"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* SEARCH */}
      <div className="flex justify-center mb-6">
        <SearchPill
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          placeholder="Cari nama dosen, judul publikasi, atau kata kunci..."
        />
      </div>

      {/* SORT + JUMLAH */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-gray-700">
          Publikasi Dosen{totalData !== null ? ` (${totalData})` : ""}
        </h2>

        <div className="flex gap-4 text-xs">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSort(option.key)}
              className={`cursor-pointer ${
                sort === option.key
                  ? "text-red-600 font-medium"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      {renderBody()}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </div>
      )}

      {/* SUMBER */}
      <p className="mt-6 text-center text-xs text-gray-400">
        Data publikasi disediakan oleh OpenAlex
      </p>
    </div>
  );
}
